export type Budget = {
  id: number
  rev: number
  numero: string
  cliente: string
  projeto: string
  valor: number
  status: 'em análise' | 'aprovado' | 'reprovado' | 'vencido'
  emissao: string
  validade: string
  resp: string
  margem: number
  slaDias: number
  enviado: boolean
  respondeuEm: string | null
}

export type BudgetStatus = Budget['status']

export type Filtros = {
  busca?: string
  status?: BudgetStatus | ''
  inicio?: string
  fim?: string
  cliente?: string
  projeto?: string
  min?: string | number | null
}

export type SortKey = 'emissao' | '-emissao' | 'valor' | '-valor' | 'status'