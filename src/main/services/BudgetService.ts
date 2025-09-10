import { z } from 'zod'
import { BudgetModel, type Budget } from '../models/Budget'

// Minimal input schemas (validate shapes from wizard)
const ItemSchema = z.object({
  nome: z.string().trim().min(1),
  un: z.string().trim().min(1),
  qtd: z.number().nonnegative(),
  preco: z.number().nonnegative(),
  categoria: z.string().trim().min(1)
})

const PricingSchema = z.object({
  method: z.enum(['MARKUP', 'MARGIN']),
  markupPct: z.number().optional(),
  marginPct: z.number().optional(),
  considerICMSasCost: z.boolean().default(false),
  considerPISCOFINSasCost: z.boolean().default(false),
  considerIPIasCost: z.boolean().default(false),
  considerISSasCost: z.boolean().default(false)
}).partial({ markupPct: true, marginPct: true })

const MetaSchema = z.object({
  numero: z.string().trim().min(1),
  nome: z.string().trim().min(1),
  clienteId: z.number().int().positive().optional(),
  responsavel: z.string().optional(),
  dataInicio: z.string().optional(),
  previsaoEntrega: z.string().optional(),
  descricao: z.string().optional(),
  precoSugerido: z.number().optional(),
  precoAprovado: z.number().optional()
})

// Fin shape approximating UI Fin interface
const FinSchema = z.object({
  regime: z.enum(['SN', 'LP', 'LR']),
  tipoOperacao: z.enum(['MERCADORIA', 'SERVICO']),
  cfop: z.string().optional(),
  naturezaOperacao: z.string().optional(),
  ncm: z.string().optional(),
  cest: z.string().optional(),
  nbs: z.string().optional(),
  precoVenda: z.number().optional(),
  descontoPct: z.number(),
  descontoValor: z.number(),
  frete: z.number(),
  seguro: z.number(),
  outrosCustos: z.number(),
  compoeBaseICMS: z.boolean(),
  compoeBasePisCofins: z.boolean(),
  compoeBaseIPI: z.boolean(),
  cst: z.string().optional(),
  csosn: z.string().optional(),
  origemMercadoria: z.string().optional(),
  icmsAliq: z.number().optional(),
  icmsRedBasePct: z.number().optional(),
  icmsStMva: z.number().optional(),
  icmsStAliq: z.number().optional(),
  fcpAliq: z.number().optional(),
  fcpStAliq: z.number().optional(),
  difalAliqInter: z.number().optional(),
  difalAliqInterna: z.number().optional(),
  difalPartilhaDestinoPct: z.number().optional(),
  ipiCst: z.string().optional(),
  ipiAliq: z.number().optional(),
  pisCst: z.string().optional(),
  pisAliq: z.number().optional(),
  cofinsCst: z.string().optional(),
  cofinsAliq: z.number().optional(),
  municipioIncidencia: z.string().optional(),
  issAliq: z.number().optional(),
  issRetido: z.boolean().optional(),
  irrfAliq: z.number().optional(),
  inssAliq: z.number().optional(),
  csllAliq: z.number().optional(),
  pisRetAliq: z.number().optional(),
  cofinsRetAliq: z.number().optional()
})

export const BudgetCreateSchema = z.object({
  meta: MetaSchema,
  items: z.array(ItemSchema),
  fin: FinSchema.optional(),
  pricing: PricingSchema.optional()
})

export type BudgetCreateInput = z.infer<typeof BudgetCreateSchema>

export class BudgetService {
  static async getAllBudgets(tenantId: string): Promise<Budget[]> {
    return await BudgetModel.findAll(tenantId)
  }

  static async getBudgetById(tenantId: string, id: number): Promise<Budget | null> {
    return await BudgetModel.findById(tenantId, id)
  }

  static async searchBudgets(tenantId: string, term: string): Promise<Budget[]> {
    if (!term.trim()) return await BudgetModel.findAll(tenantId)
    return await BudgetModel.search(tenantId, term.trim())
  }

  static async createBudget(tenantId: string, payload: BudgetCreateInput): Promise<Budget> {
    const data = BudgetCreateSchema.parse(payload)
    const startDate = data.meta.dataInicio ? new Date(data.meta.dataInicio) : undefined
    const deliveryDate = data.meta.previsaoEntrega ? new Date(data.meta.previsaoEntrega) : undefined

    return await BudgetModel.create(tenantId, {
      clientId: data.meta.clienteId ?? undefined,
      numero: data.meta.numero,
      name: data.meta.nome,
      description: data.meta.descricao,
      responsavel: data.meta.responsavel,
      startDate,
      deliveryDate,
      precoSugerido: data.meta.precoSugerido,
      precoAprovado: data.meta.precoAprovado,
      pricingMethod: data.pricing?.method as any,
      markupPct: data.pricing?.markupPct,
      marginPct: data.pricing?.marginPct,
      considerICMSasCost: !!data.pricing?.considerICMSasCost,
      considerPISCOFINSasCost: !!data.pricing?.considerPISCOFINSasCost,
      considerIPIasCost: !!data.pricing?.considerIPIasCost,
      considerISSasCost: !!data.pricing?.considerISSasCost,
      items: data.items.map((it, idx) => ({
        name: it.nome,
        unit: it.un,
        quantity: it.qtd,
        unitPrice: it.preco,
        category: it.categoria,
        sortIndex: idx
      })),
      financial: data.fin
        ? {
            ...data.fin
          }
        : undefined
    })
  }

  static async updateBudget(tenantId: string, id: number, payload: Partial<BudgetCreateInput>): Promise<Budget | null> {
    // Allow partial updates: validate each part if provided
    const items = payload.items ? z.array(ItemSchema).parse(payload.items) : undefined
    const fin = payload.fin ? FinSchema.partial().parse(payload.fin) : undefined
    const pricing = payload.pricing ? PricingSchema.parse(payload.pricing) : undefined
    const meta = payload.meta ? MetaSchema.partial().parse(payload.meta) : undefined

    const startDate = meta?.dataInicio ? new Date(meta.dataInicio) : undefined
    const deliveryDate = meta?.previsaoEntrega ? new Date(meta.previsaoEntrega) : undefined

    return await BudgetModel.update(tenantId, id, {
      clientId: meta?.clienteId,
      numero: meta?.numero,
      name: meta?.nome,
      description: meta?.descricao,
      responsavel: meta?.responsavel,
      startDate,
      deliveryDate,
      precoSugerido: meta?.precoSugerido,
      precoAprovado: meta?.precoAprovado,
      pricingMethod: pricing?.method as any,
      markupPct: pricing?.markupPct,
      marginPct: pricing?.marginPct,
      considerICMSasCost: pricing?.considerICMSasCost,
      considerPISCOFINSasCost: pricing?.considerPISCOFINSasCost,
      considerIPIasCost: pricing?.considerIPIasCost,
      considerISSasCost: pricing?.considerISSasCost,
      items: items?.map((it, idx) => ({
        name: it.nome,
        unit: it.un,
        quantity: it.qtd,
        unitPrice: it.preco,
        category: it.categoria,
        sortIndex: idx
      })),
      financial: fin
    })
  }

  static async deleteBudget(tenantId: string, id: number): Promise<boolean> {
    return await BudgetModel.delete(tenantId, id)
  }
}
