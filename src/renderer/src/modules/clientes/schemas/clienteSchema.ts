// packages/schemas/src/cliente.ts
import { z } from 'zod'
import { validateCPFOrCNPJ } from '../../../shared/utils/validators'

export const TipoPessoa = z.enum(['PJ', 'PF'])
export const IndicadorIE = z.enum(['Contribuinte', 'Isento', 'Não Contribuinte'])
export const ModalidadeFrete = z.enum(['CIF', 'FOB'])

const digits = (s: string) => s.replace(/\D+/g, '')

// Schema de validação principal - SINCRONIZADO COM PRISMA
export const clienteSchema = z
  .object({
    // Dados Básicos (Prisma fields)
    tipoPessoa: TipoPessoa.default('PJ'),
    razaoSocial: z.string().trim().min(3, 'Mínimo de 3 caracteres'),
    nomeFantasia: z.string().trim().optional().default(''),
    cpfCnpj: z
      .string()
      .min(1, 'CPF/CNPJ obrigatório')
      .transform(digits)
      .refine((v) => v.length === 11 || v.length === 14, 'CPF/CNPJ deve ter 11 ou 14 dígitos')
      .refine((v) => validateCPFOrCNPJ(v), 'CPF/CNPJ inválido'),
    indicadorIE: IndicadorIE.default('Contribuinte'),
    ie: z.string().optional().default(''),
    im: z.string().optional().default(''),
    suframa: z.string().optional().default(''),
    regimeTrib: z.enum(['Simples Nacional', 'Lucro Presumido', 'Lucro Real']).default('Simples Nacional'),

    // Endereço (Prisma fields)
    cep: z.string().transform(digits).optional().default(''),
    logradouro: z.string().optional().default(''),
    numero: z.string().optional().default(''),
    complemento: z.string().optional().default(''),
    bairro: z.string().optional().default(''),
    cidade: z.string().optional().default(''),
    uf: z
      .string()
      .transform((s) => s.toUpperCase())
      .refine((s) => s === '' || /^[A-Z]{2}$/.test(s), 'UF inválida')
      .optional()
      .default(''),
    pais: z.string().default('Brasil'),

    // Contatos (Prisma fields)
    email: z.string().email('Email inválido').or(z.literal('')).optional().default(''),
    telefone: z.string().optional().default(''),
    responsavel: z.string().optional().default(''),
    cargo: z.string().optional().default(''),

    // Informações Comerciais (Prisma fields)
    condPgtoPadrao: z.string().optional().default(''),
    limiteCredito: z.coerce.number().nonnegative('Limite não pode ser negativo').default(0),
    vendedorPadraoId: z.number().optional().nullable(),
    transportePadrao: ModalidadeFrete.default('CIF'),
    observacoes: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    // Validação condicional para PJ
    if (data.tipoPessoa === 'PJ') {
      if (!data.razaoSocial || data.razaoSocial.length < 3) {
        ctx.addIssue({
          code: 'custom',
          path: ['razaoSocial'],
          message: 'Razão social obrigatória para PJ (mínimo 3 caracteres)'
        })
      }
      const cnpj = data.cpfCnpj.replace(/\D/g, '')
      if (cnpj.length !== 14) {
        ctx.addIssue({
          code: 'custom',
          path: ['cpfCnpj'],
          message: 'CNPJ deve ter 14 dígitos'
        })
      }
    }

    // Validação condicional para PF
    if (data.tipoPessoa === 'PF') {
      if (!data.razaoSocial || data.razaoSocial.length < 3) {
        ctx.addIssue({
          code: 'custom',
          path: ['razaoSocial'],
          message: 'Nome completo obrigatório para PF (mínimo 3 caracteres)'
        })
      }
      const cpf = data.cpfCnpj.replace(/\D/g, '')
      if (cpf.length !== 11) {
        ctx.addIssue({
          code: 'custom',
          path: ['cpfCnpj'],
          message: 'CPF deve ter 11 dígitos'
        })
      }
    }
  })

export type ClienteInput = z.infer<typeof clienteSchema>

// Tipo para o formulário - EXATAMENTE os campos do Prisma
export type ClienteFormData = {
  tipoPessoa: 'PJ' | 'PF'
  razaoSocial: string
  nomeFantasia?: string
  cpfCnpj: string
  indicadorIE: 'Contribuinte' | 'Isento' | 'Não Contribuinte'
  ie?: string
  im?: string
  suframa?: string
  regimeTrib: 'Simples Nacional' | 'Lucro Presumido' | 'Lucro Real'
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  uf?: string
  pais?: string
  email?: string
  telefone?: string
  responsavel?: string
  cargo?: string
  condPgtoPadrao?: string
  limiteCredito: number
  vendedorPadraoId?: number | null
  transportePadrao: 'CIF' | 'FOB'
  observacoes?: string
}
