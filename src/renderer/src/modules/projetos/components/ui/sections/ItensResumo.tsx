import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Package, TrendingUp, BarChart3, Layers, Target, Award } from 'lucide-react'
import type { ProjetoDetalhado } from '../../types/projetoTypes'
import { processItemsByCategory, formatCurrency, formatPercent, CHART_COLORS } from '../../../utils/chartUtils'

interface ItensResumoProps {
  projeto: ProjetoDetalhado
}

interface ItemAnalysis {
  highValue: number
  mediumValue: number
  lowValue: number
  highValueItems: any[]
  mediumValueItems: any[]
  lowValueItems: any[]
}

export function ItensResumo({ projeto }: ItensResumoProps) {
  const categoriesData = processItemsByCategory(projeto)

  const analyzeItems = (): ItemAnalysis => {
    if (!projeto.items || projeto.items.length === 0) {
      return {
        highValue: 0,
        mediumValue: 0,
        lowValue: 0,
        highValueItems: [],
        mediumValueItems: [],
        lowValueItems: []
      }
    }

    const itemsWithTotal = projeto.items.map(item => ({
      ...item,
      total: item.quantity * item.unitPrice
    })).sort((a, b) => b.total - a.total)

    const totalValue = itemsWithTotal.reduce((sum, item) => sum + item.total, 0)
    const itemCount = itemsWithTotal.length

    // Definir thresholds baseados na distribuiÃ§Ã£o
    const highThreshold = totalValue * 0.15 / itemCount // Itens que representam > 15% do valor mÃ©dio
    const lowThreshold = totalValue * 0.05 / itemCount  // Itens que representam < 5% do valor mÃ©dio

    const highValueItems = itemsWithTotal.filter(item => item.total >= highThreshold)
    const lowValueItems = itemsWithTotal.filter(item => item.total <= lowThreshold)
    const mediumValueItems = itemsWithTotal.filter(item => item.total > lowThreshold && item.total < highThreshold)

    return {
      highValue: highValueItems.reduce((sum, item) => sum + item.total, 0),
      mediumValue: mediumValueItems.reduce((sum, item) => sum + item.total, 0),
      lowValue: lowValueItems.reduce((sum, item) => sum + item.total, 0),
      highValueItems,
      mediumValueItems,
      lowValueItems
    }
  }

  const itemAnalysis = analyzeItems()
  const totalItems = projeto.items?.length || 0
  const totalValue = projeto.items?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) || 0

  const getDistributionData = () => {
    return [
      {
        name: 'Alto Valor',
        value: itemAnalysis.highValue,
        count: itemAnalysis.highValueItems.length,
        color: CHART_COLORS.danger
      },
      {
        name: 'MÃ©dio Valor',
        value: itemAnalysis.mediumValue,
        count: itemAnalysis.mediumValueItems.length,
        color: CHART_COLORS.warning
      },
      {
        name: 'Baixo Valor',
        value: itemAnalysis.lowValue,
        count: itemAnalysis.lowValueItems.length,
        color: CHART_COLORS.primary
      }
    ].filter(item => item.value > 0)
  }

  const distributionData = getDistributionData()

  const getCategoriesChartData = () => {
    if (!Array.isArray(categoriesData) || categoriesData.length === 0) {
      return []
    }
    
    return categoriesData.slice(0, 6)
      .filter(cat => cat && typeof cat === 'object' && cat.name && typeof cat.value === 'number' && typeof cat.count === 'number')
      .map((cat, index) => ({
        name: cat.name && cat.name.length > 10 ? `${cat.name.substring(0, 10)}...` : (cat.name || 'Categoria'),
        quantidade: Number(cat.count) || 0,
        valor: Number(cat.value) || 0,
        color: cat.color || '#22c55e'
      }))
      .filter(item => item.quantidade > 0 || item.valor > 0) // Only include items with data
  }

  const categoriesChartData = getCategoriesChartData()

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !Array.isArray(payload) || payload.length === 0) {
      return null
    }
    
    try {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-fg">{label || 'Dados'}</p>
          {payload.filter(entry => entry && entry.value !== undefined).map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'quantidade' ? `Qtd: ${Number(entry.value) || 0}` : formatCurrency(Number(entry.value) || 0)}
            </p>
          ))}
        </div>
      )
    } catch (error) {
      console.warn('Error in CustomTooltip:', error)
      return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Cards de MÃ©tricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border-border rounded-2xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-600">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs opacity-70">Total de Itens</p>
              <p className="text-lg font-semibold text-fg">{totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border-border rounded-2xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs opacity-70">Valor Total</p>
              <p className="text-lg font-semibold text-fg">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border-border rounded-2xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs opacity-70">Categorias</p>
              <p className="text-lg font-semibold text-fg">{categoriesData.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border-border rounded-2xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-600">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs opacity-70">Ticket MÃ©dio</p>
              <p className="text-lg font-semibold text-fg">
                {formatCurrency(totalItems > 0 ? totalValue / totalItems : 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* GrÃ¡ficos de AnÃ¡lise */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DistribuiÃ§Ã£o por Valor */}
        <section className="bg-card border-border rounded-2xl border p-6">
          <div className="flex items-center gap-2 pb-4 border-b border-border mb-4">
            <div className="p-1 rounded-lg bg-purple-500/20">
              <BarChart3 className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-fg">DistribuiÃ§Ã£o por Densidade de Valor</h3>
          </div>

          {distributionData.length > 0 ? (
            <div className="space-y-4">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={distributionData}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => formatCurrency(value).replace('R$', '').trim()}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={CHART_COLORS.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-center">
                {distributionData.map((item) => (
                  <div key={item.name} className="p-3 bg-muted/20 rounded-xl">
                    <div
                      className="w-4 h-4 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: item.color }}
                    />
                    <p className="text-xs opacity-70">{item.name}</p>
                    <p className="text-sm font-semibold text-fg">{item.count} itens</p>
                    <p className="text-xs opacity-70">
                      {formatPercent(totalValue > 0 ? (item.value / totalValue) * 100 : 0)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <p className="text-sm">Nenhum item disponÃ­vel</p>
            </div>
          )}
        </section>

        {/* AnÃ¡lise por Categoria */}
        <section className="bg-card border-border rounded-2xl border p-6">
          <div className="flex items-center gap-2 pb-4 border-b border-border mb-4">
            <div className="p-1 rounded-lg bg-emerald-500/20">
              <Layers className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-fg">Quantidade vs Valor por Categoria</h3>
          </div>

          {categoriesChartData.length > 1 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                {(() => {
                  try {
                    return (
                      <AreaChart
                        data={categoriesChartData}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 10 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          yAxisId="left"
                          domain={[0, 'auto']}
                          tick={{ fontSize: 11 }}
                          tickFormatter={(value) => formatCurrency(Number(value) || 0).replace('R$', '').trim()}
                        />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right"
                          domain={[0, 'auto']}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          yAxisId="left"
                          type="linear"
                          dataKey="valor"
                          stroke={CHART_COLORS.primary}
                          fill={CHART_COLORS.primary}
                          fillOpacity={0.6}
                          connectNulls
                          isAnimationActive={false}
                          dot={false}
                        />
                        <Area
                          yAxisId="right"
                          type="linear"
                          dataKey="quantidade"
                          stroke={CHART_COLORS.secondary}
                          fill={CHART_COLORS.secondary}
                          fillOpacity={0.4}
                          connectNulls
                          isAnimationActive={false}
                          dot={false}
                        />
                      </AreaChart>
                    )
                  } catch (error) {
                    console.error('Error rendering AreaChart:', error)
                    return (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p className="text-sm">Erro ao carregar grÃ¡fico</p>
                      </div>
                    )
                  }
                })()}
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <p className="text-sm">Nenhuma categoria disponÃ­vel</p>
            </div>
          )}
        </section>
      </div>

      {/* Top 3 Categorias */}
      <section className="bg-card border-border rounded-2xl border p-6">
        <div className="flex items-center gap-2 pb-4 border-b border-border mb-4">
          <div className="p-1 rounded-lg bg-yellow-500/20">
            <Award className="w-4 h-4 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-fg">Top 3 Categorias</h3>
        </div>

        {categoriesData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categoriesData.slice(0, 3).map((category, index) => (
              <div
                key={category.name}
                className="relative p-6 bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl border border-border/50 hover:from-muted/30 hover:to-muted/20 transition-all duration-300"
              >
                <div className="absolute top-3 right-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {index + 1}
                  </div>
                </div>

                <div className="mb-4">
                  <div
                    className="w-4 h-4 rounded-full mb-2"
                    style={{ backgroundColor: category.color }}
                  />
                  <h4 className="font-semibold text-fg truncate" title={category.name}>
                    {category.name}
                  </h4>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs opacity-70">Valor:</span>
                    <span className="text-sm font-semibold text-fg">
                      {formatCurrency(category.value)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs opacity-70">Quantidade:</span>
                    <span className="text-sm font-semibold text-fg">
                      {category.count.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs opacity-70">ParticipaÃ§Ã£o:</span>
                    <span className="text-sm font-semibold text-emerald-600">
                      {formatPercent(category.percentage)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border/30">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${category.percentage}%`,
                          backgroundColor: category.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma categoria encontrada</p>
          </div>
        )}
      </section>
    </div>
  )
}
