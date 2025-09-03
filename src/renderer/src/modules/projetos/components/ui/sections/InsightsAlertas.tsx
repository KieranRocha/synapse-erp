import React from 'react'
import { AlertTriangle, CheckCircle, Info, TrendingUp, TrendingDown, Target, DollarSign, Clock, Lightbulb, Star } from 'lucide-react'
import type { ProjetoDetalhado } from '../../types/projetoTypes'
import { calculateProjectHealth, getMarginStatus, formatCurrency, formatPercent, formatDate } from '../../../utils/chartUtils'

interface InsightsAlertasProps {
  projeto: ProjetoDetalhado
}

interface Alert {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  icon: React.ReactNode
  title: string
  description: string
  action?: string
  priority: 'high' | 'medium' | 'low'
}

interface Insight {
  id: string
  type: 'optimization' | 'risk' | 'opportunity' | 'recommendation'
  icon: React.ReactNode
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category: 'financial' | 'operational' | 'commercial'
}

export function InsightsAlertas({ projeto }: InsightsAlertasProps) {
  const projectHealth = calculateProjectHealth(projeto)
  const marginStatus = getMarginStatus(projeto.margemLiquida)

  const generateAlerts = (): Alert[] => {
    const alerts: Alert[] = []

    // Alertas de Margem
    if (projeto.margemLiquida !== null) {
      if (projeto.margemLiquida < 5) {
        alerts.push({
          id: 'margin-critical',
          type: 'error',
          icon: <AlertTriangle className="w-5 h-5" />,
          title: 'Margem Crítica',
          description: `Margem de ${formatPercent(projeto.margemLiquida)} está abaixo do mínimo recomendado (5%)`,
          action: 'Revisar precificação',
          priority: 'high'
        })
      } else if (projeto.margemLiquida < 10) {
        alerts.push({
          id: 'margin-low',
          type: 'warning',
          icon: <TrendingDown className="w-5 h-5" />,
          title: 'Margem Baixa',
          description: `Margem de ${formatPercent(projeto.margemLiquida)} pode comprometer a rentabilidade`,
          action: 'Considerar ajuste de preços',
          priority: 'medium'
        })
      }
    }

    // Alertas de Prazo
    if (projeto.deliveryDate) {
      const today = new Date()
      const daysUntilDelivery = Math.ceil((projeto.deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilDelivery < 0) {
        alerts.push({
          id: 'overdue',
          type: 'error',
          icon: <Clock className="w-5 h-5" />,
          title: 'Projeto Atrasado',
          description: `Entrega estava prevista para ${formatDate(projeto.deliveryDate)}`,
          action: 'Atualizar cronograma',
          priority: 'high'
        })
      } else if (daysUntilDelivery <= 7) {
        alerts.push({
          id: 'urgent',
          type: 'warning',
          icon: <Clock className="w-5 h-5" />,
          title: 'Prazo Próximo',
          description: `Apenas ${daysUntilDelivery} dias até a entrega`,
          action: 'Verificar andamento',
          priority: 'high'
        })
      }
    }

    // Alertas de Cliente
    if (!projeto.client) {
      alerts.push({
        id: 'no-client',
        type: 'warning',
        icon: <Info className="w-5 h-5" />,
        title: 'Cliente Não Informado',
        description: 'Projeto sem cliente associado pode gerar problemas no faturamento',
        action: 'Vincular cliente',
        priority: 'medium'
      })
    }

    // Alertas de Aprovação
    if (projeto.status === 'DRAFT' && projeto.created_at) {
      const daysSinceCreated = Math.ceil((new Date().getTime() - projeto.created_at.getTime()) / (1000 * 60 * 60 * 24))
      if (daysSinceCreated > 7) {
        alerts.push({
          id: 'pending-approval',
          type: 'info',
          icon: <Target className="w-5 h-5" />,
          title: 'Aguardando Envio',
          description: `Projeto em rascunho há ${daysSinceCreated} dias`,
          action: 'Considerar envio',
          priority: 'low'
        })
      }
    }

    // Alertas de Concentração de Risco
    if (projeto.items && projeto.items.length > 0) {
      const totalValue = projeto.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
      const maxItemValue = Math.max(...projeto.items.map(item => item.quantity * item.unitPrice))
      const concentration = totalValue > 0 ? (maxItemValue / totalValue) * 100 : 0
      
      if (concentration > 50) {
        alerts.push({
          id: 'concentration-risk',
          type: 'warning',
          icon: <AlertTriangle className="w-5 h-5" />,
          title: 'Alta Concentração de Risco',
          description: `${formatPercent(concentration)} do valor está concentrado em um item`,
          action: 'Diversificar portfólio',
          priority: 'medium'
        })
      }
    }

    return alerts.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  const generateInsights = (): Insight[] => {
    const insights: Insight[] = []

    // Insights de Otimização Financeira
    if (projeto.margemLiquida !== null && projeto.margemLiquida > 25) {
      insights.push({
        id: 'excellent-margin',
        type: 'optimization',
        icon: <TrendingUp className="w-5 h-5" />,
        title: 'Margem Excelente',
        description: 'Este projeto apresenta margem muito acima da média. Considere usar como referência.',
        impact: 'medium',
        category: 'financial'
      })
    }

    // Insights sobre Preços
    if (projeto.precoSugerido && projeto.precoAprovado && projeto.precoAprovado > projeto.precoSugerido) {
      const increase = ((projeto.precoAprovado - projeto.precoSugerido) / projeto.precoSugerido) * 100
      insights.push({
        id: 'price-increase',
        type: 'opportunity',
        icon: <DollarSign className="w-5 h-5" />,
        title: 'Cliente Aceitou Preço Superior',
        description: `Preço aprovado ${formatPercent(increase)} acima do sugerido. Cliente valoriza o projeto.`,
        impact: 'high',
        category: 'commercial'
      })
    }

    // Insights sobre Diversificação
    if (projeto.items && projeto.items.length > 0) {
      const categories = new Set(projeto.items.map(item => item.category || 'Sem categoria')).size
      if (categories >= 4) {
        insights.push({
          id: 'good-diversification',
          type: 'optimization',
          icon: <Target className="w-5 h-5" />,
          title: 'Boa Diversificação',
          description: `Projeto com ${categories} categorias diferentes reduz riscos e aumenta valor.`,
          impact: 'medium',
          category: 'operational'
        })
      }
    }

    // Insights sobre Timeline
    if (projeto.startDate && projeto.deliveryDate) {
      const projectDuration = Math.ceil((projeto.deliveryDate.getTime() - projeto.startDate.getTime()) / (1000 * 60 * 60 * 24))
      if (projectDuration > 30 && projectDuration <= 90) {
        insights.push({
          id: 'optimal-timeline',
          type: 'recommendation',
          icon: <Clock className="w-5 h-5" />,
          title: 'Prazo Adequado',
          description: `Cronograma de ${projectDuration} dias permite execução com qualidade.`,
          impact: 'low',
          category: 'operational'
        })
      }
    }

    // Insights sobre Performance do Projeto
    if (projectHealth.score >= 80) {
      insights.push({
        id: 'high-performance',
        type: 'optimization',
        icon: <Star className="w-5 h-5" />,
        title: 'Projeto de Alta Performance',
        description: `Score ${projectHealth.score}/100. Use como modelo para outros projetos.`,
        impact: 'high',
        category: 'operational'
      })
    }

    return insights
  }

  const alerts = generateAlerts()
  const insights = generateInsights()

  const getAlertBadge = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'warning':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'success':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'info':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getInsightBadge = (impact: Insight['impact']) => {
    switch (impact) {
      case 'high':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'medium':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Score Geral */}
      <div className="bg-card border-border rounded-2xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${
              projectHealth.status === 'excellent' ? 'bg-green-500/20 text-green-600' :
              projectHealth.status === 'good' ? 'bg-blue-500/20 text-blue-600' :
              projectHealth.status === 'warning' ? 'bg-orange-500/20 text-orange-600' :
              'bg-red-500/20 text-red-600'
            }`}>
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-fg">Score do Projeto</h3>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            projectHealth.status === 'excellent' ? 'bg-green-100 text-green-700' :
            projectHealth.status === 'good' ? 'bg-blue-100 text-blue-700' :
            projectHealth.status === 'warning' ? 'bg-orange-100 text-orange-700' :
            'bg-red-100 text-red-700'
          }`}>
            {projectHealth.score}/100
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 bg-muted rounded-full h-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                projectHealth.status === 'excellent' ? 'bg-green-500' :
                projectHealth.status === 'good' ? 'bg-blue-500' :
                projectHealth.status === 'warning' ? 'bg-orange-500' :
                'bg-red-500'
              }`}
              style={{ width: `${projectHealth.score}%` }}
            />
          </div>
          <span className="text-sm font-medium text-fg">{projectHealth.score}%</span>
        </div>

        <p className="text-sm opacity-70">
          {projectHealth.status === 'excellent' ? 'Projeto excepcional com excelente performance em todos os aspectos.' :
           projectHealth.status === 'good' ? 'Projeto bem estruturado com boa performance geral.' :
           projectHealth.status === 'warning' ? 'Projeto requer atenção em alguns aspectos importantes.' :
           'Projeto apresenta riscos significativos que devem ser endereçados.'}
        </p>
      </div>

      {/* Alertas */}
      {alerts.length > 0 && (
        <section className="bg-card border-border rounded-2xl border p-6">
          <div className="flex items-center gap-2 pb-4 border-b border-border mb-4">
            <div className="p-1 rounded-lg bg-red-500/20">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-fg">Alertas Ativos</h3>
            <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
              {alerts.length}
            </span>
          </div>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border ${getAlertBadge(alert.type)} transition-all hover:shadow-sm`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {alert.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-sm">{alert.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alert.priority === 'high' ? 'bg-red-500/20 text-red-700' :
                        alert.priority === 'medium' ? 'bg-orange-500/20 text-orange-700' :
                        'bg-blue-500/20 text-blue-700'
                      }`}>
                        {alert.priority === 'high' ? 'Alta' :
                         alert.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </div>
                    <p className="text-sm opacity-80 mb-2">{alert.description}</p>
                    {alert.action && (
                      <p className="text-xs font-medium opacity-90">
                        💡 {alert.action}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <section className="bg-card border-border rounded-2xl border p-6">
          <div className="flex items-center gap-2 pb-4 border-b border-border mb-4">
            <div className="p-1 rounded-lg bg-blue-500/20">
              <Lightbulb className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-fg">Insights Inteligentes</h3>
            <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
              {insights.length}
            </span>
          </div>

          <div className="space-y-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-4 rounded-xl border ${getInsightBadge(insight.impact)} transition-all hover:shadow-sm`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {insight.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          insight.category === 'financial' ? 'bg-green-500/20 text-green-700' :
                          insight.category === 'commercial' ? 'bg-purple-500/20 text-purple-700' :
                          'bg-blue-500/20 text-blue-700'
                        }`}>
                          {insight.category === 'financial' ? 'Financeiro' :
                           insight.category === 'commercial' ? 'Comercial' : 'Operacional'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getInsightBadge(insight.impact)}`}>
                          {insight.impact === 'high' ? 'Alto' :
                           insight.impact === 'medium' ? 'Médio' : 'Baixo'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm opacity-80">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Resumo de Performance */}
      <section className="bg-card border-border rounded-2xl border p-6">
        <div className="flex items-center gap-2 pb-4 border-b border-border mb-4">
          <div className="p-1 rounded-lg bg-green-500/20">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-fg">Resumo de Performance</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Pontos Fortes ({projectHealth.strengths.length})
            </h4>
            {projectHealth.strengths.length > 0 ? (
              <div className="space-y-2">
                {projectHealth.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <p className="text-fg">{strength}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm opacity-70">Nenhum ponto forte identificado</p>
            )}
          </div>

          <div>
            <h4 className="font-semibold text-orange-600 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Áreas de Melhoria ({projectHealth.issues.length})
            </h4>
            {projectHealth.issues.length > 0 ? (
              <div className="space-y-2">
                {projectHealth.issues.map((issue, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                    <p className="text-fg">{issue}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm opacity-70">Nenhuma área de melhoria identificada</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}