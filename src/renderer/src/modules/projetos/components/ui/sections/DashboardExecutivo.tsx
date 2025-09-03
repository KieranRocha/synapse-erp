import React from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Target, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import type { ProjetoDetalhado } from '../../types/projetoTypes'
import { processItemsByCategory, getTopItems, getMarginStatus, calculateProjectHealth, formatCurrency, formatPercent } from '../../../utils/chartUtils'

interface DashboardExecutivoProps {
  projeto: ProjetoDetalhado
}

export function DashboardExecutivo({ projeto }: DashboardExecutivoProps) {
  const categoriesData = processItemsByCategory(projeto)
  const topItems = getTopItems(projeto, 5)
  const marginStatus = getMarginStatus(projeto.margemLiquida)
  const projectHealth = calculateProjectHealth(projeto)

  const getDaysUntilDelivery = () => {
    if (!projeto.deliveryDate) return null
    const today = new Date()
    const delivery = new Date(projeto.deliveryDate)
    const diffTime = delivery.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntilDelivery = getDaysUntilDelivery()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'SENT':
        return <Clock className="w-4 h-4 text-blue-600" />
      case 'DRAFT':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />
      case 'REJECTED':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-fg">{label}</p>
          <p className="text-sm text-emerald-600">
            {formatCurrency(payload[0].value)}
          </p>
          {payload[0].payload.percentage && (
            <p className="text-xs opacity-70">
              {formatPercent(payload[0].payload.percentage)}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border-border rounded-2xl border p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-fg" />
              <h4 className="font-semibold text-fg">Saúde do Projeto</h4>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              projectHealth.status === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
              projectHealth.status === 'good' ? 'bg-green-100 text-green-700' :
              projectHealth.status === 'warning' ? 'bg-orange-100 text-orange-700' :
              'bg-red-100 text-red-700'
            }`}>
              {projectHealth.score}/100
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-full h-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  projectHealth.status === 'excellent' ? 'bg-emerald-500' :
                  projectHealth.status === 'good' ? 'bg-green-500' :
                  projectHealth.status === 'warning' ? 'bg-orange-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${projectHealth.score}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-card border-border rounded-2xl border p-4">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-fg" />
            <div>
              <h4 className="font-semibold text-fg">Status da Margem</h4>
              <p className={`text-xs ${marginStatus.color}`}>{marginStatus.label}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-fg">
              {formatPercent(projeto.margemLiquida)}
            </span>
            <div className={`p-1 rounded-lg ${marginStatus.bgColor}`}>
              <TrendingUp className={`w-4 h-4 ${marginStatus.color}`} />
            </div>
          </div>
        </div>

        <div className="bg-card border-border rounded-2xl border p-4">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-fg" />
            <div>
              <h4 className="font-semibold text-fg">Prazo de Entrega</h4>
              <div className="flex items-center gap-1">
                {getStatusIcon(projeto.status)}
                <p className="text-xs opacity-70 capitalize">{projeto.status?.toLowerCase()}</p>
              </div>
            </div>
          </div>
          <div className="text-lg font-bold text-fg">
            {daysUntilDelivery !== null ? (
              <span className={
                daysUntilDelivery < 0 ? 'text-red-600' :
                daysUntilDelivery < 7 ? 'text-orange-600' :
                'text-green-600'
              }>
                {daysUntilDelivery < 0 ? 'Atrasado' :
                 daysUntilDelivery === 0 ? 'Hoje' :
                 `${daysUntilDelivery} dias`}
              </span>
            ) : '—'}
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Distribuição por Categoria */}
        <section className="bg-card border-border rounded-2xl border p-6">
          <div className="flex items-center gap-2 pb-4 border-b border-border mb-4">
            <div className="p-1 rounded-lg bg-blue-500/20">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-fg">Distribuição por Categoria</h3>
          </div>

          {categoriesData.length > 0 ? (
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <div className="w-full lg:w-1/2 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoriesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoriesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full lg:w-1/2 space-y-2">
                {categoriesData.slice(0, 5).map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium text-fg truncate">{category.name}</span>
                    </div>
                    <span className="text-xs opacity-70">
                      {formatPercent(category.percentage)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <p className="text-sm">Nenhum dado disponível</p>
            </div>
          )}
        </section>

        {/* Gráfico de Barras - Top 5 Itens */}
        <section className="bg-card border-border rounded-2xl border p-6">
          <div className="flex items-center gap-2 pb-4 border-b border-border mb-4">
            <div className="p-1 rounded-lg bg-emerald-500/20">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-fg">Top 5 Itens Mais Valiosos</h3>
          </div>

          {topItems.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topItems}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => formatCurrency(value).replace('R$', '').trim()}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="value" 
                    radius={[4, 4, 0, 0]}
                    fill="#22c55e"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <p className="text-sm">Nenhum item disponível</p>
            </div>
          )}
        </section>
      </div>

      {/* Insights e Alertas */}
      {(projectHealth.strengths.length > 0 || projectHealth.issues.length > 0) && (
        <section className="bg-card border-border rounded-2xl border p-6">
          <div className="flex items-center gap-2 pb-4 border-b border-border mb-4">
            <AlertTriangle className="w-5 h-5 text-fg" />
            <h3 className="text-lg font-semibold text-fg">Insights do Projeto</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pontos Fortes */}
            {projectHealth.strengths.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Pontos Fortes
                </h4>
                <div className="space-y-2">
                  {projectHealth.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      <p className="text-fg">{strength}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pontos de Atenção */}
            {projectHealth.issues.length > 0 && (
              <div>
                <h4 className="font-semibold text-orange-600 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Pontos de Atenção
                </h4>
                <div className="space-y-2">
                  {projectHealth.issues.map((issue, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                      <p className="text-fg">{issue}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}