import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { create } from 'zustand'
import { 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  FileDown,
  Mail,
  Copy,
  Share2,
  CheckCircle2,
  DollarSign,
  BarChart3,
  History
} from 'lucide-react'
import type { 
  ProjetoDetalhado, 
  ProjetoViewState, 
  TabType 
} from '../../../features/projetos/types/projetoTypes'
import { 
  ProjetoHeader,
  TabNavigation, 
  GeralTab,
  ItensTab
} from '../../../features/projetos/components/sections'

// Toast store (reutilizando do wizard)
interface ToastItem { 
  id: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
}

const useToastStore = create<{ 
  toasts: ToastItem[]
  push: (m: string, type?: ToastItem['type']) => void
  remove: (id: string) => void 
}>((set) => ({
  toasts: [],
  push: (message, type = 'success') => set((s) => ({ 
    toasts: [...s.toasts, { id: crypto.randomUUID(), message, type }] 
  })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

function ToastViewport() {
  const { toasts, remove } = useToastStore()
  
  useEffect(() => {
    const timers = toasts.map((t) => setTimeout(() => remove(t.id), 3000))
    return () => timers.forEach(clearTimeout)
  }, [toasts, remove])

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`
            flex items-center gap-2 rounded-xl border px-4 py-3 shadow-lg backdrop-blur
            ${t.type === 'error' ? 'border-red-500/40 bg-red-50/90 text-red-700' :
              t.type === 'warning' ? 'border-amber-500/40 bg-amber-50/90 text-amber-700' :
              t.type === 'info' ? 'border-blue-500/40 bg-blue-50/90 text-blue-700' :
              'border-green-500/40 bg-green-50/90 text-green-700'
            }
          `}
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">{t.message}</span>
        </div>
      ))}
    </div>
  )
}

// Mock data para desenvolvimento - será substituído pela API real
const MOCK_PROJETO: ProjetoDetalhado = {
  id: 1,
  numero: "ORC-2024-001",
  name: "Sistema de Gestão Empresarial",
  description: "Desenvolvimento de sistema completo de gestão empresarial com módulos de vendas, estoque, financeiro e relatórios gerenciais.",
  responsavel: "João Silva",
  startDate: new Date('2024-01-15'),
  deliveryDate: new Date('2024-06-30'),
  status: 'APPROVED',
  precoSugerido: 85000,
  precoAprovado: 78000,
  pricingMethod: 'MARKUP',
  markupPct: 35.5,
  marginPct: 22.8,
  considerICMSasCost: true,
  considerPISCOFINSasCost: true,
  considerIPIasCost: false,
  considerISSasCost: true,
  clientId: 1,
  client: {
    id: 1,
    razao_social: "TechnoSoft Soluções LTDA",
    nome_fantasia: "TechnoSoft",
    cpf_cnpj: "12.345.678/0001-90",
    regime_trib: "Simples Nacional",
    email: "contato@technosoft.com.br",
    telefone: "(11) 3456-7890",
    responsavel: "Maria Santos",
    logradouro: "Rua das Flores, 123",
    bairro: "Centro",
    cidade: "São Paulo",
    uf: "SP",
    cep: "01234-567",
    created_at: new Date('2023-06-15'),
    updated_at: new Date('2024-01-10'),
    tipo_pessoa: "PJ",
    indicador_ie: "Contribuinte",
    ie: "123.456.789.012",
    im: "",
    suframa: "",
    numero: "123",
    complemento: "Sala 456",
    pais: "Brasil",
    cargo: "Gerente de TI",
    cond_pgto_padrao: "30 dias",
    limite_credito: 100000,
    vendedor_padrao: "Vendedor A",
    transporte_padrao: "CIF",
    observacoes: "Cliente preferencial"
  },
  items: [
    {
      id: 1,
      name: "Desenvolvimento Frontend React",
      unit: "hora",
      quantity: 200,
      unitPrice: 150,
      category: "Desenvolvimento",
      sortIndex: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: "Desenvolvimento Backend Node.js",
      unit: "hora", 
      quantity: 180,
      unitPrice: 160,
      category: "Desenvolvimento",
      sortIndex: 2,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: "Design UI/UX",
      unit: "hora",
      quantity: 80,
      unitPrice: 120,
      category: "Design",
      sortIndex: 3,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      name: "Infraestrutura Cloud AWS",
      unit: "mês",
      quantity: 6,
      unitPrice: 800,
      category: "Infraestrutura",
      sortIndex: 4,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      name: "Testes Automatizados",
      unit: "hora",
      quantity: 60,
      unitPrice: 140,
      category: "Testes",
      sortIndex: 5,
      created_at: new Date(),
      updated_at: new Date()
    }
  ],
  financial: {
    id: 1,
    regime: 'SN',
    tipoOperacao: 'SERVICO',
    cfop: '5.933',
    naturezaOperacao: 'Prestação de serviços',
    nbs: '01.07',
    precoVenda: 78000,
    descontoPct: 8.5,
    descontoValor: 2000,
    frete: 0,
    seguro: 0,
    outrosCustos: 500,
    compoeBaseICMS: false,
    compoeBasePisCofins: true,
    compoeBaseIPI: false,
    issAliq: 3.0,
    issRetido: false,
    pisAliq: 0.65,
    cofinsAliq: 3.0,
    irrfAliq: 1.5,
    inssAliq: 11.0,
    created_at: new Date(),
    updated_at: new Date(),
    cst: null,
    csosn: null,
    origemMercadoria: null,
    icmsAliq: null,
    icmsRedBasePct: null,
    icmsStMva: null,
    icmsStAliq: null,
    fcpAliq: null,
    fcpStAliq: null,
    difalAliqInter: null,
    difalAliqInterna: null,
    difalPartilhaDestinoPct: null,
    ipiCst: null,
    ipiAliq: null,
    pisCst: '01',
    cofinsCst: '01',
    municipioIncidencia: 'São Paulo',
    csllAliq: 1.0,
    pisRetAliq: null,
    cofinsRetAliq: null
  },
  created_at: new Date('2024-01-15'),
  updated_at: new Date('2024-02-20'),
  
  // Campos calculados
  subtotal: 67400,
  totalImpostos: 8970,
  totalDescontos: 7630,
  totalFinal: 78000,
  margemLiquida: 22.8,
  percentualImpostos: 11.5
}


export default function OrcamentoDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const pushToast = useToastStore(s => s.push)

  const [viewState, setViewState] = useState<ProjetoViewState>({
    currentTab: 'geral',
    isLoading: true,
    error: null,
    projeto: null,
    metricas: null,
    historico: [],
    documentos: [],
    comentarios: []
  })

  // Simular carregamento dos dados
  useEffect(() => {
    const loadProjeto = async () => {
      setViewState(prev => ({ ...prev, isLoading: true, error: null }))
      
      try {
        // Buscar dados reais do banco
        const projeto = await window.api.budgets.getById(Number(id))
        
        if (!projeto) {
          throw new Error('Projeto não encontrado')
        }

        // Calcular valores derivados
        const subtotal = projeto.items?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) || 0
        
        const totalDescontos = projeto.financial ? 
          (subtotal * projeto.financial.descontoPct / 100) + projeto.financial.descontoValor 
          : 0
        
        // Calcular impostos se existirem dados financeiros
        const baseCalculo = Math.max(0, subtotal - totalDescontos)
        let totalImpostos = 0
        
        if (projeto.financial) {
          const f = projeto.financial
          totalImpostos = baseCalculo * (
            (f.issAliq || 0) + 
            (f.icmsAliq || 0) + 
            (f.pisAliq || 0) + 
            (f.cofinsAliq || 0) +
            (f.ipiAliq || 0)
          ) / 100
        }
        
        const totalFinal = baseCalculo + totalImpostos + (projeto.financial?.frete || 0) + (projeto.financial?.outrosCustos || 0)
        
        // Converter dados do banco para o formato da interface
        const projetoDetalhado: ProjetoDetalhado = {
          ...projeto,
          subtotal,
          totalImpostos,
          totalDescontos,
          totalFinal,
          margemLiquida: projeto.marginPct || 0,
          percentualImpostos: subtotal > 0 ? (totalImpostos / subtotal) * 100 : 0
        }
        
        setViewState(prev => ({
          ...prev,
          isLoading: false,
          projeto: projetoDetalhado
        }))
      } catch (error) {
        console.error('Erro ao carregar projeto:', error)
        setViewState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Erro ao carregar os dados do projeto'
        }))
      }
    }

    if (id) {
      loadProjeto()
    }
  }, [id])

  // Handlers para ações
  const handleEdit = () => {
    navigate(`/vendas/orcamentos/editar/${id}`)
  }

  const handleDuplicate = () => {
    // TODO: Implementar duplicação
    pushToast('Funcionalidade em desenvolvimento', 'info')
  }

  const handleArchive = () => {
    // TODO: Implementar arquivamento
    pushToast('Funcionalidade em desenvolvimento', 'info')
  }

  const handleExport = () => {
    // TODO: Implementar exportação
    pushToast('Funcionalidade em desenvolvimento', 'info')
  }

  const handleShare = () => {
    // TODO: Implementar compartilhamento
    pushToast('Funcionalidade em desenvolvimento', 'info')
  }

  const handleTabChange = (tab: TabType) => {
    setViewState(prev => ({ ...prev, currentTab: tab }))
  }

  // Calcular badges para as abas
  const tabBadges = useMemo(() => {
    if (!viewState.projeto) return {}
    
    return {
      itens: viewState.projeto.items?.length || 0,
      documentos: viewState.documentos.length,
      historico: viewState.historico.length
    }
  }, [viewState.projeto, viewState.documentos, viewState.historico])

  // Loading state
  if (viewState.isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-fg" />
          <p className="text-muted-foreground">Carregando projeto...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (viewState.error || !viewState.projeto) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-fg" />
          <h2 className="text-xl font-semibold text-fg mb-2">
            Projeto não encontrado
          </h2>
          <p className="text-muted-foreground mb-6">
            {viewState.error || 'O projeto solicitado não foi encontrado ou não existe.'}
          </p>
          <button
            onClick={() => navigate('/vendas/orcamentos')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-fg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Orçamentos
          </button>
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (viewState.currentTab) {
      case 'geral':
        return <GeralTab projeto={viewState.projeto} />
        
      case 'itens':
        return <ItensTab projeto={viewState.projeto} />
        
      case 'financeiro':
        return (
          <div className="bg-card border-border rounded-2xl border p-6 text-center">
            <DollarSign className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-fg mb-2">Financeiro & Impostos</h3>
            <p className="text-muted-foreground">Em desenvolvimento...</p>
          </div>
        )
        
      case 'analise':
        return (
          <div className="bg-card border-border rounded-2xl border p-6 text-center">
            <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-fg mb-2">Análise & Relatórios</h3>
            <p className="text-muted-foreground">Em desenvolvimento...</p>
          </div>
        )
        
      case 'documentos':
        return (
          <div className="bg-card border-border rounded-2xl border p-6 text-center">
            <FileDown className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-fg mb-2">Documentos</h3>
            <p className="text-muted-foreground">Em desenvolvimento...</p>
          </div>
        )
        
      case 'historico':
        return (
          <div className="bg-card border-border rounded-2xl border p-6 text-center">
            <History className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-fg mb-2">Histórico</h3>
            <p className="text-muted-foreground">Em desenvolvimento...</p>
          </div>
        )
        
      default:
        return null
    }
  }

  return (
    <div className="bg-bg">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <ProjetoHeader
          projeto={viewState.projeto}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onArchive={handleArchive}
          onExport={handleExport}
          onShare={handleShare}
        />

        {/* Tab Navigation */}
        <TabNavigation
          activeTab={viewState.currentTab}
          onTabChange={handleTabChange}
          badges={tabBadges}
        />

        {/* Content */}
        <div className="space-y-6 mt-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Toast viewport */}
      <ToastViewport />
    </div>
  )
}


