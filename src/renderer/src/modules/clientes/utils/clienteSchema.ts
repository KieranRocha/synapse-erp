// packages/schemas/src/cliente.ts
import { z } from 'zod'

export const TipoPessoa = z.enum(['PJ', 'PF'])
export const IndicadorIE = z.enum(['Contribuinte', 'Isento', 'Não Contribuinte'])
export const RegimeTrib = z.enum(['SN', 'LP', 'LR'])
export const ModalidadeFrete = z.enum(['CIF', 'FOB'])

const digits = (s: string) => s.replace(/\D+/g, '')

export const clienteSchema = z
  .object({
    tipoPessoa: TipoPessoa.default('PJ'),
    razaoSocial: z.string().trim().min(1, 'Obrigatório'),
    nomeFantasia: z.string().trim().optional().default(''),
    cpfCnpj: z
      .string()
      .transform(digits)
      .refine((v) => v.length === 11 || v.length === 14, 'CPF/CNPJ inválido'),
    indicadorIE: IndicadorIE.default('Contribuinte'),
    ie: z.string().optional().default(''),
    im: z.string().optional().default(''),
    suframa: z.string().optional().default(''),
    regimeTrib: z.enum(['Simples Nacional', 'Lucro Presumido', 'Lucro Real']),
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
    email: z.string().email('E-mail inválido').optional().or(z.literal('')).default(''),
    telefone: z.string().optional().default(''),
    responsavel: z.string().optional().default(''),
    cargo: z.string().optional().default(''),
    condPgtoPadrao: z.string().optional().default(''),
    limiteCredito: z.coerce.number().nonnegative().default(0),
    vendedorPadrao: z.string().optional().default(''),
    transportePadrao: ModalidadeFrete.default('CIF'),
    observacoes: z.string().optional().default('')
  })
  .superRefine((data, ctx) => {
    if (data.tipoPessoa === 'PJ' && !data.razaoSocial) {
      ctx.addIssue({
        code: 'custom',
        path: ['razaoSocial'],
        message: 'Razão social obrigatória para PJ'
      })
    }
  })
export type ClienteInput = z.infer<typeof clienteSchema>

// Tipo para o formulário (compatível com os componentes existentes)
export type ClienteFormData = {
  tipoPessoa: 'PJ' | 'PF'
  razaoSocial: string
  nomeFantasia?: string
  nomePF?: string
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
  vendedorPadrao?: string
  transportePadrao: 'CIF' | 'FOB'
  observacoes?: string
}
