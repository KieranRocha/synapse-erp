export interface Item {
  id: string
  nome: string
  un: string
  qtd: number
  preco: number
  categoria: string
}

export type Regime = 'SN' | 'LP' | 'LR' // Simples, Lucro Presumido, Lucro Real
export type TipoOperacao = 'MERCADORIA' | 'SERVICO'

export interface Fin {
  // núcleo
  regime: Regime
  tipoOperacao: TipoOperacao
  cfop?: string
  naturezaOperacao?: string
  ncm?: string // mercadorias
  cest?: string // mercadorias (quando aplicável)
  nbs?: string // serviços (NFS-e / lista municipal)
  precoVenda?: number // 👈 preço efetivo a considerar nos KPIs
  // comuns
  descontoPct: number
  descontoValor: number
  frete: number
  seguro: number
  outrosCustos: number

  // flags de composição de base
  compoeBaseICMS: boolean
  compoeBasePisCofins: boolean
  compoeBaseIPI: boolean

  // ICMS / ICMS-ST / FCP / DIFAL (uso típico em mercadorias)
  cst?: string // LP/LR
  csosn?: string // Simples Nacional
  origemMercadoria?: string // 0..8 (Nacional/Importação...)
  icmsAliq?: number
  icmsRedBasePct?: number
  icmsStMva?: number
  icmsStAliq?: number
  fcpAliq?: number
  fcpStAliq?: number
  difalAliqInter?: number // alíquota interestadual
  difalAliqInterna?: number // alíquota interna no destino
  difalPartilhaDestinoPct?: number

  // IPI
  ipiCst?: string
  ipiAliq?: number

  // PIS/COFINS
  pisCst?: string
  pisAliq?: number
  cofinsCst?: string
  cofinsAliq?: number

  // ISS + retenções (serviço)
  municipioIncidencia?: string
  issAliq?: number
  issRetido?: boolean
  irrfAliq?: number
  inssAliq?: number
  csllAliq?: number
  pisRetAliq?: number
  cofinsRetAliq?: number
}

export const CATEGORIES = [
  { key: 'maquinas', label: 'Máquinas & Equipamentos' },
  { key: 'materiais', label: 'Materiais / Matéria-prima' },
  { key: 'consumiveis', label: 'Consumíveis' },
  { key: 'insumos', label: 'Insumos' },
  { key: 'servicos', label: 'Serviços' },
  { key: 'maoObra', label: 'Mão de Obra' },
  { key: 'ferramentas', label: 'Ferramentas & Acessórios' }
] as const

export const STEPS = [
  { key: 'dados', label: 'Dados' },
  { key: 'itens', label: 'Itens' },
  { key: 'financeiro', label: 'Financeiro' },
  { key: 'preco', label: 'Preço & Margem' },
  { key: 'revisao', label: 'Revisão' }
] as const
export type PriceMethod = 'MARKUP' | 'MARGIN'

export interface Pricing {
  method: PriceMethod // "MARKUP" | "MARGIN"
  markupPct: number // % sobre custo
  marginPct: number // % margem alvo
  considerICMSasCost: boolean
  considerPISCOFINSasCost: boolean
  considerIPIasCost: boolean
  considerISSasCost: boolean
}
export type StepKey = (typeof STEPS)[number]['key']
