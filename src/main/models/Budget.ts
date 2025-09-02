import { prisma } from '../database'
import { Decimal } from '@prisma/client/runtime/library'
import type {
  Budget as PrismaBudget,
  BudgetItem as PrismaBudgetItem,
  BudgetFinancial as PrismaBudgetFinancial,
  PricingMethodEnum,
  BudgetStatus,
  RegimeEnum,
  TipoOperacaoEnum
} from '@prisma/client'

export interface BudgetItem {
  id: number
  name: string
  unit: string
  quantity: number
  unitPrice: number
  category: string
  sortIndex: number
  created_at: Date
  updated_at: Date
}

export interface BudgetFinancial {
  id: number
  regime: RegimeEnum
  tipoOperacao: TipoOperacaoEnum
  cfop?: string | null
  naturezaOperacao?: string | null
  ncm?: string | null
  cest?: string | null
  nbs?: string | null
  precoVenda?: number | null

  descontoPct: number
  descontoValor: number
  frete: number
  seguro: number
  outrosCustos: number

  compoeBaseICMS: boolean
  compoeBasePisCofins: boolean
  compoeBaseIPI: boolean

  cst?: string | null
  csosn?: string | null
  origemMercadoria?: string | null
  icmsAliq?: number | null
  icmsRedBasePct?: number | null
  icmsStMva?: number | null
  icmsStAliq?: number | null
  fcpAliq?: number | null
  fcpStAliq?: number | null
  difalAliqInter?: number | null
  difalAliqInterna?: number | null
  difalPartilhaDestinoPct?: number | null

  ipiCst?: string | null
  ipiAliq?: number | null

  pisCst?: string | null
  pisAliq?: number | null
  cofinsCst?: string | null
  cofinsAliq?: number | null

  municipioIncidencia?: string | null
  issAliq?: number | null
  issRetido?: boolean | null
  irrfAliq?: number | null
  inssAliq?: number | null
  csllAliq?: number | null
  pisRetAliq?: number | null
  cofinsRetAliq?: number | null

  created_at: Date
  updated_at: Date
}

export interface Budget {
  id: number
  clientId?: number | null
  client?: any | null // Client data when included
  numero: string
  name: string
  description?: string | null
  responsavel?: string | null
  startDate?: Date | null
  deliveryDate?: Date | null
  status: BudgetStatus
  precoSugerido?: number | null
  precoAprovado?: number | null
  pricingMethod?: PricingMethodEnum | null
  markupPct?: number | null
  marginPct?: number | null
  considerICMSasCost: boolean
  considerPISCOFINSasCost: boolean
  considerIPIasCost: boolean
  considerISSasCost: boolean
  items: BudgetItem[]
  financial?: BudgetFinancial | null
  created_at: Date
  updated_at: Date
}

function d(v: number | null | undefined): Decimal | null | undefined {
  if (v === null || v === undefined) return v
  return new Decimal(v)
}

function num(v: any): number | null {
  if (v === null || v === undefined) return null
  if (typeof v === 'number') return v
  if (typeof v === 'string' && v.trim() === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function serializeBudgetItem(it: PrismaBudgetItem): BudgetItem {
  return {
    ...it,
    quantity: it.quantity ? Number(it.quantity) : 0,
    unitPrice: it.unitPrice ? Number(it.unitPrice) : 0
  }
}

function serializeFinancial(fin: PrismaBudgetFinancial | null): BudgetFinancial | null {
  if (!fin) return null
  return {
    ...fin,
    precoVenda: fin.precoVenda != null ? Number(fin.precoVenda) : null,
    descontoPct: Number(fin.descontoPct),
    descontoValor: Number(fin.descontoValor),
    frete: Number(fin.frete),
    seguro: Number(fin.seguro),
    outrosCustos: Number(fin.outrosCustos),
    icmsAliq: num(fin.icmsAliq),
    icmsRedBasePct: num(fin.icmsRedBasePct),
    icmsStMva: num(fin.icmsStMva),
    icmsStAliq: num(fin.icmsStAliq),
    fcpAliq: num(fin.fcpAliq),
    fcpStAliq: num(fin.fcpStAliq),
    difalAliqInter: num(fin.difalAliqInter),
    difalAliqInterna: num(fin.difalAliqInterna),
    difalPartilhaDestinoPct: num(fin.difalPartilhaDestinoPct),
    ipiAliq: num(fin.ipiAliq),
    pisAliq: num(fin.pisAliq),
    cofinsAliq: num(fin.cofinsAliq),
    issAliq: num(fin.issAliq),
    irrfAliq: num(fin.irrfAliq),
    inssAliq: num(fin.inssAliq),
    csllAliq: num(fin.csllAliq),
    pisRetAliq: num(fin.pisRetAliq),
    cofinsRetAliq: num(fin.cofinsRetAliq)
  }
}

function serializeClient(raw: any): any {
  if (!raw) return null
  // Convert Prisma Decimal fields and keep dates as Date
  const out: any = { ...raw }
  if (Object.prototype.hasOwnProperty.call(out, 'limite_credito')) {
    out.limite_credito = out.limite_credito != null ? Number(out.limite_credito) : null
  }
  return out
}

function serializeBudget(b: PrismaBudget & { items: PrismaBudgetItem[]; financial: PrismaBudgetFinancial | null; client?: any }): Budget {
  return {
    ...b,
    client: serializeClient(b.client),
    precoSugerido: b.precoSugerido != null ? Number(b.precoSugerido) : null,
    precoAprovado: b.precoAprovado != null ? Number(b.precoAprovado) : null,
    markupPct: b.markupPct != null ? Number(b.markupPct) : null,
    marginPct: b.marginPct != null ? Number(b.marginPct) : null,
    items: b.items.map(serializeBudgetItem),
    financial: serializeFinancial(b.financial)
  }
}

export class BudgetModel {
  static async findAll(): Promise<Budget[]> {
    const rows = await prisma.budget.findMany({
      include: { items: true, financial: true },
      orderBy: { created_at: 'desc' }
    })
    return rows.map(serializeBudget)
  }

  static async findById(id: number): Promise<Budget | null> {
    const row = await prisma.budget.findUnique({
      where: { id },
      include: { items: true, financial: true, client: true }
    })
    return row ? serializeBudget(row) : null
  }

  static async search(term: string): Promise<Budget[]> {
    const rows = await prisma.budget.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { client: { is: { razao_social: { contains: term, mode: 'insensitive' } } } },
          { client: { is: { nome_fantasia: { contains: term, mode: 'insensitive' } } } }
        ]
      },
      include: { items: true, financial: true },
      orderBy: { created_at: 'desc' }
    })
    return rows.map(serializeBudget)
  }

  static async create(data: {
    clientId?: number | null
    numero: string
    name: string
    description?: string | null
    responsavel?: string | null
    startDate?: Date | null
    deliveryDate?: Date | null
    status?: BudgetStatus
    precoSugerido?: number | null
    precoAprovado?: number | null
    pricingMethod?: PricingMethodEnum | null
    markupPct?: number | null
    marginPct?: number | null
    considerICMSasCost?: boolean
    considerPISCOFINSasCost?: boolean
    considerIPIasCost?: boolean
    considerISSasCost?: boolean
    items: Array<{ name: string; unit: string; quantity: number; unitPrice: number; category: string; sortIndex?: number }>
    financial?: Partial<BudgetFinancial> | null
  }): Promise<Budget> {
    const created = await prisma.budget.create({
      data: {
        clientId: data.clientId ?? null,
        numero: data.numero,
        name: data.name,
        description: data.description ?? null,
        responsavel: data.responsavel ?? null,
        startDate: data.startDate ?? null,
        deliveryDate: data.deliveryDate ?? null,
        status: data.status ?? 'DRAFT',
        precoSugerido: d(num(data.precoSugerido) ?? null),
        precoAprovado: d(num(data.precoAprovado) ?? null),
        pricingMethod: data.pricingMethod ?? null,
        markupPct: d(num(data.markupPct) ?? null),
        marginPct: d(num(data.marginPct) ?? null),
        considerICMSasCost: data.considerICMSasCost ?? false,
        considerPISCOFINSasCost: data.considerPISCOFINSasCost ?? false,
        considerIPIasCost: data.considerIPIasCost ?? false,
        considerISSasCost: data.considerISSasCost ?? false,
        items: {
          create: data.items.map((it, idx) => ({
            name: it.name,
            unit: it.unit,
            quantity: d(num(it.quantity) ?? 0)!,
            unitPrice: d(num(it.unitPrice) ?? 0)!,
            category: it.category,
            sortIndex: it.sortIndex ?? idx
          }))
        },
        financial: data.financial
          ? {
              create: {
                regime: (data.financial!.regime as any) ?? 'SN',
                tipoOperacao: (data.financial!.tipoOperacao as any) ?? 'MERCADORIA',
                cfop: data.financial!.cfop ?? null,
                naturezaOperacao: data.financial!.naturezaOperacao ?? null,
                ncm: data.financial!.ncm ?? null,
                cest: data.financial!.cest ?? null,
                nbs: data.financial!.nbs ?? null,
                precoVenda: d(num(data.financial!.precoVenda) ?? null),
                descontoPct: d(num(data.financial!.descontoPct) ?? 0)!,
                descontoValor: d(num(data.financial!.descontoValor) ?? 0)!,
                frete: d(num(data.financial!.frete) ?? 0)!,
                seguro: d(num(data.financial!.seguro) ?? 0)!,
                outrosCustos: d(num(data.financial!.outrosCustos) ?? 0)!,
                compoeBaseICMS: !!data.financial!.compoeBaseICMS,
                compoeBasePisCofins: !!data.financial!.compoeBasePisCofins,
                compoeBaseIPI: !!data.financial!.compoeBaseIPI,
                cst: data.financial!.cst ?? null,
                csosn: data.financial!.csosn ?? null,
                origemMercadoria: data.financial!.origemMercadoria ?? null,
                icmsAliq: d(num(data.financial!.icmsAliq) ?? null),
                icmsRedBasePct: d(num(data.financial!.icmsRedBasePct) ?? null),
                icmsStMva: d(num(data.financial!.icmsStMva) ?? null),
                icmsStAliq: d(num(data.financial!.icmsStAliq) ?? null),
                fcpAliq: d(num(data.financial!.fcpAliq) ?? null),
                fcpStAliq: d(num(data.financial!.fcpStAliq) ?? null),
                difalAliqInter: d(num(data.financial!.difalAliqInter) ?? null),
                difalAliqInterna: d(num(data.financial!.difalAliqInterna) ?? null),
                difalPartilhaDestinoPct: d(num(data.financial!.difalPartilhaDestinoPct) ?? null),
                ipiCst: data.financial!.ipiCst ?? null,
                ipiAliq: d(num(data.financial!.ipiAliq) ?? null),
                pisCst: data.financial!.pisCst ?? null,
                pisAliq: d(num(data.financial!.pisAliq) ?? null),
                cofinsCst: data.financial!.cofinsCst ?? null,
                cofinsAliq: d(num(data.financial!.cofinsAliq) ?? null),
                municipioIncidencia: data.financial!.municipioIncidencia ?? null,
                issAliq: d(num(data.financial!.issAliq) ?? null),
                issRetido: data.financial!.issRetido ?? false,
                irrfAliq: d(num(data.financial!.irrfAliq) ?? null),
                inssAliq: d(num(data.financial!.inssAliq) ?? null),
                csllAliq: d(num(data.financial!.csllAliq) ?? null),
                pisRetAliq: d(num(data.financial!.pisRetAliq) ?? null),
                cofinsRetAliq: d(num(data.financial!.cofinsRetAliq) ?? null)
              }
            }
          : undefined
      },
      include: { items: true, financial: true }
    })
    return serializeBudget(created)
  }

  static async update(id: number, data: {
    clientId?: number | null
    numero?: string
    name?: string
    description?: string | null
    responsavel?: string | null
    startDate?: Date | null
    deliveryDate?: Date | null
    status?: BudgetStatus
    precoSugerido?: number | null
    precoAprovado?: number | null
    pricingMethod?: PricingMethodEnum | null
    markupPct?: number | null
    marginPct?: number | null
    considerICMSasCost?: boolean
    considerPISCOFINSasCost?: boolean
    considerIPIasCost?: boolean
    considerISSasCost?: boolean
    items?: Array<{ name: string; unit: string; quantity: number; unitPrice: number; category: string; sortIndex?: number }>
    financial?: Partial<BudgetFinancial> | null
  }): Promise<Budget | null> {
    return await prisma.$transaction(async (tx) => {
      const updated = await tx.budget.update({
        where: { id },
        data: {
          clientId: data.clientId ?? undefined,
          numero: data.numero ?? undefined,
          name: data.name ?? undefined,
          description: data.description === undefined ? undefined : data.description,
          responsavel: data.responsavel === undefined ? undefined : data.responsavel,
          startDate: data.startDate === undefined ? undefined : data.startDate,
          deliveryDate: data.deliveryDate === undefined ? undefined : data.deliveryDate,
          status: data.status ?? undefined,
          precoSugerido: data.precoSugerido === undefined ? undefined : d(num(data.precoSugerido) ?? null),
          precoAprovado: data.precoAprovado === undefined ? undefined : d(num(data.precoAprovado) ?? null),
          pricingMethod: data.pricingMethod === undefined ? undefined : data.pricingMethod,
          markupPct: data.markupPct === undefined ? undefined : d(num(data.markupPct) ?? null),
          marginPct: data.marginPct === undefined ? undefined : d(num(data.marginPct) ?? null),
          considerICMSasCost: data.considerICMSasCost === undefined ? undefined : !!data.considerICMSasCost,
          considerPISCOFINSasCost: data.considerPISCOFINSasCost === undefined ? undefined : !!data.considerPISCOFINSasCost,
          considerIPIasCost: data.considerIPIasCost === undefined ? undefined : !!data.considerIPIasCost,
          considerISSasCost: data.considerISSasCost === undefined ? undefined : !!data.considerISSasCost
        },
        include: { items: true, financial: true }
      })

      if (data.items) {
        // Replace items for simplicity
        await tx.budgetItem.deleteMany({ where: { budgetId: id } })
        if (data.items.length > 0) {
          await tx.budgetItem.createMany({
            data: data.items.map((it, idx) => ({
              budgetId: id,
              name: it.name,
              unit: it.unit,
              quantity: new Decimal(num(it.quantity) ?? 0),
              unitPrice: new Decimal(num(it.unitPrice) ?? 0),
              category: it.category,
              sortIndex: it.sortIndex ?? idx
            }))
          })
        }
      }

      if (data.financial !== undefined) {
        const f = data.financial
        if (f === null) {
          await tx.budgetFinancial.deleteMany({ where: { budgetId: id } })
        } else {
          await tx.budgetFinancial.upsert({
            where: { budgetId: id },
            update: {
              regime: (f.regime as any) ?? undefined,
              tipoOperacao: (f.tipoOperacao as any) ?? undefined,
              cfop: f.cfop === undefined ? undefined : f.cfop,
              naturezaOperacao: f.naturezaOperacao === undefined ? undefined : f.naturezaOperacao,
              ncm: f.ncm === undefined ? undefined : f.ncm,
              cest: f.cest === undefined ? undefined : f.cest,
              nbs: f.nbs === undefined ? undefined : f.nbs,
              precoVenda: f.precoVenda === undefined ? undefined : d(num(f.precoVenda) ?? null),
              descontoPct: f.descontoPct === undefined ? undefined : d(num(f.descontoPct) ?? 0),
              descontoValor: f.descontoValor === undefined ? undefined : d(num(f.descontoValor) ?? 0),
              frete: f.frete === undefined ? undefined : d(num(f.frete) ?? 0),
              seguro: f.seguro === undefined ? undefined : d(num(f.seguro) ?? 0),
              outrosCustos: f.outrosCustos === undefined ? undefined : d(num(f.outrosCustos) ?? 0),
              compoeBaseICMS: f.compoeBaseICMS === undefined ? undefined : !!f.compoeBaseICMS,
              compoeBasePisCofins: f.compoeBasePisCofins === undefined ? undefined : !!f.compoeBasePisCofins,
              compoeBaseIPI: f.compoeBaseIPI === undefined ? undefined : !!f.compoeBaseIPI,
              cst: f.cst === undefined ? undefined : f.cst,
              csosn: f.csosn === undefined ? undefined : f.csosn,
              origemMercadoria: f.origemMercadoria === undefined ? undefined : f.origemMercadoria,
              icmsAliq: f.icmsAliq === undefined ? undefined : d(num(f.icmsAliq) ?? null),
              icmsRedBasePct: f.icmsRedBasePct === undefined ? undefined : d(num(f.icmsRedBasePct) ?? null),
              icmsStMva: f.icmsStMva === undefined ? undefined : d(num(f.icmsStMva) ?? null),
              icmsStAliq: f.icmsStAliq === undefined ? undefined : d(num(f.icmsStAliq) ?? null),
              fcpAliq: f.fcpAliq === undefined ? undefined : d(num(f.fcpAliq) ?? null),
              fcpStAliq: f.fcpStAliq === undefined ? undefined : d(num(f.fcpStAliq) ?? null),
              difalAliqInter: f.difalAliqInter === undefined ? undefined : d(num(f.difalAliqInter) ?? null),
              difalAliqInterna: f.difalAliqInterna === undefined ? undefined : d(num(f.difalAliqInterna) ?? null),
              difalPartilhaDestinoPct: f.difalPartilhaDestinoPct === undefined ? undefined : d(num(f.difalPartilhaDestinoPct) ?? null),
              ipiCst: f.ipiCst === undefined ? undefined : f.ipiCst,
              ipiAliq: f.ipiAliq === undefined ? undefined : d(num(f.ipiAliq) ?? null),
              pisCst: f.pisCst === undefined ? undefined : f.pisCst,
              pisAliq: f.pisAliq === undefined ? undefined : d(num(f.pisAliq) ?? null),
              cofinsCst: f.cofinsCst === undefined ? undefined : f.cofinsCst,
              cofinsAliq: f.cofinsAliq === undefined ? undefined : d(num(f.cofinsAliq) ?? null),
              municipioIncidencia: f.municipioIncidencia === undefined ? undefined : f.municipioIncidencia,
              issAliq: f.issAliq === undefined ? undefined : d(num(f.issAliq) ?? null),
              issRetido: f.issRetido === undefined ? undefined : !!f.issRetido,
              irrfAliq: f.irrfAliq === undefined ? undefined : d(num(f.irrfAliq) ?? null),
              inssAliq: f.inssAliq === undefined ? undefined : d(num(f.inssAliq) ?? null),
              csllAliq: f.csllAliq === undefined ? undefined : d(num(f.csllAliq) ?? null),
              pisRetAliq: f.pisRetAliq === undefined ? undefined : d(num(f.pisRetAliq) ?? null),
              cofinsRetAliq: f.cofinsRetAliq === undefined ? undefined : d(num(f.cofinsRetAliq) ?? null)
            },
            create: {
              budgetId: id,
              regime: (f!.regime as any) ?? 'SN',
              tipoOperacao: (f!.tipoOperacao as any) ?? 'MERCADORIA',
              cfop: f!.cfop ?? null,
              naturezaOperacao: f!.naturezaOperacao ?? null,
              ncm: f!.ncm ?? null,
              cest: f!.cest ?? null,
              nbs: f!.nbs ?? null,
              precoVenda: d(num(f!.precoVenda) ?? null),
              descontoPct: d(num(f!.descontoPct) ?? 0)!,
              descontoValor: d(num(f!.descontoValor) ?? 0)!,
              frete: d(num(f!.frete) ?? 0)!,
              seguro: d(num(f!.seguro) ?? 0)!,
              outrosCustos: d(num(f!.outrosCustos) ?? 0)!,
              compoeBaseICMS: !!f!.compoeBaseICMS,
              compoeBasePisCofins: !!f!.compoeBasePisCofins,
              compoeBaseIPI: !!f!.compoeBaseIPI,
              cst: f!.cst ?? null,
              csosn: f!.csosn ?? null,
              origemMercadoria: f!.origemMercadoria ?? null,
              icmsAliq: d(num(f!.icmsAliq) ?? null),
              icmsRedBasePct: d(num(f!.icmsRedBasePct) ?? null),
              icmsStMva: d(num(f!.icmsStMva) ?? null),
              icmsStAliq: d(num(f!.icmsStAliq) ?? null),
              fcpAliq: d(num(f!.fcpAliq) ?? null),
              fcpStAliq: d(num(f!.fcpStAliq) ?? null),
              difalAliqInter: d(num(f!.difalAliqInter) ?? null),
              difalAliqInterna: d(num(f!.difalAliqInterna) ?? null),
              difalPartilhaDestinoPct: d(num(f!.difalPartilhaDestinoPct) ?? null),
              ipiCst: f!.ipiCst ?? null,
              ipiAliq: d(num(f!.ipiAliq) ?? null),
              pisCst: f!.pisCst ?? null,
              pisAliq: d(num(f!.pisAliq) ?? null),
              cofinsCst: f!.cofinsCst ?? null,
              cofinsAliq: d(num(f!.cofinsAliq) ?? null),
              municipioIncidencia: f!.municipioIncidencia ?? null,
              issAliq: d(num(f!.issAliq) ?? null),
              issRetido: f!.issRetido ?? false,
              irrfAliq: d(num(f!.irrfAliq) ?? null),
              inssAliq: d(num(f!.inssAliq) ?? null),
              csllAliq: d(num(f!.csllAliq) ?? null),
              pisRetAliq: d(num(f!.pisRetAliq) ?? null),
              cofinsRetAliq: d(num(f!.cofinsRetAliq) ?? null)
            }
          })
        }
      }

      const full = await tx.budget.findUnique({
        where: { id },
        include: { items: true, financial: true }
      })
      return full ? serializeBudget(full) : null
    })
  }

  static async delete(id: number): Promise<boolean> {
    try {
      await prisma.budget.delete({ where: { id } })
      return true
    } catch (e) {
      return false
    }
  }
}

