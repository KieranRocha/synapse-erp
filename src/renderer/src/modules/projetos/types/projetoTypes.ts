// Local type definitions - simplified from main models
interface Budget {
  id: string
  numero: string
  status: string
  valor?: number
  margemBruta?: number
  margemLiquida?: number
  // Add other fields as needed
}

interface BudgetItem {
  id: string
  descricao: string
  quantidade: number
  precoUnitario: number
  // Add other fields as needed
}

interface BudgetFinancial {
  subtotal: number
  impostos: number
  descontos: number
  total: number
  // Add other fields as needed
}

interface Client {
  id: string
  nomeCompleto: string
  email?: string
  telefone?: string
  // Add other fields as needed
}

export interface ProjetoDetalhado extends Budget {
  client?: Client | null
  subtotal: number
  totalImpostos: number
  totalDescontos: number
  totalFinal: number
  margemLiquida: number
  percentualImpostos: number
}

export interface ProjetoMetricas {
  totalItens: number
  categorias: Array<{
    nome: string
    quantidade: number
    valor: number
    percentual: number
  }>
  distribuicaoPrecos: Array<{
    faixa: string
    quantidade: number
  }>
  evolucaoTemporal: Array<{
    data: string
    valor: number
  }>
}

export interface ProjetoHistorico {
  id: number
  tipo: 'CRIACAO' | 'EDICAO' | 'STATUS_CHANGE' | 'ITEM_ADD' | 'ITEM_REMOVE' | 'ITEM_EDIT'
  descricao: string
  usuario: string
  data: Date
  detalhes?: Record<string, any>
}

export interface ProjetoDocumento {
  id: number
  nome: string
  tipo: 'PDF' | 'EXCEL' | 'WORD' | 'IMAGE' | 'OTHER'
  tamanho: number
  url: string
  dataUpload: Date
  uploadedBy: string
}

export interface ProjetoComentario {
  id: number
  texto: string
  autor: string
  data: Date
  respondendo?: number
  respostas?: ProjetoComentario[]
}

export type TabType = 
  | 'geral' 
  | 'itens' 
  | 'financeiro' 
  | 'analise' 
  | 'documentos' 
  | 'historico'

export interface ProjetoViewState {
  currentTab: TabType
  isLoading: boolean
  error: string | null
  projeto: ProjetoDetalhado | null
  metricas: ProjetoMetricas | null
  historico: ProjetoHistorico[]
  documentos: ProjetoDocumento[]
  comentarios: ProjetoComentario[]
}

export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }>
}

export interface StatusConfig {
  label: string
  color: string
  bgColor: string
  icon: string
  description: string
}

export const STATUS_CONFIGS: Record<string, StatusConfig> = {
  DRAFT: {
    label: 'Rascunho',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100 border-gray-300',
    icon: 'FileEdit',
    description: 'Projeto em elaboração'
  },
  SENT: {
    label: 'Enviado',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 border-blue-300',
    icon: 'Send',
    description: 'Enviado para cliente'
  },
  APPROVED: {
    label: 'Aprovado',
    color: 'text-green-600',
    bgColor: 'bg-green-100 border-green-300',
    icon: 'CheckCircle',
    description: 'Aprovado pelo cliente'
  },
  REJECTED: {
    label: 'Rejeitado',
    color: 'text-red-600',
    bgColor: 'bg-red-100 border-red-300',
    icon: 'XCircle',
    description: 'Rejeitado pelo cliente'
  },
  ARCHIVED: {
    label: 'Arquivado',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50 border-gray-200',
    icon: 'Archive',
    description: 'Projeto arquivado'
  }
}

export interface ExportOptions {
  formato: 'PDF' | 'EXCEL' | 'CSV'
  incluirDetalhes: boolean
  incluirGraficos: boolean
  incluirHistorico: boolean
}