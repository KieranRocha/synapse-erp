import React from 'react'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { CreditCard, TrendingUp, TrendingDown, Calculator, Percent, DollarSign, Receipt } from 'lucide-react'
import type { ProjetoDetalhado } from '../../types/projetoTypes'
import { createWaterfallData, calculateTaxBreakdown, formatCurrency, formatPercent, CHART_COLORS } from '../../utils/chartUtils'

interface FinanceiroDetalhadoProps {
  projeto: ProjetoDetalhado
}

export function FinanceiroDetalhado({ projeto }: FinanceiroDetalhadoProps) {
  const waterfallData = createWaterfallData(projeto)
  const taxBreakdown = calculateTaxBreakdown(projeto)

  const CustomWaterfallTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-fg">{label}</p>
          <p className="text-sm text-emerald-600">
            {formatCurrency(Math.abs(data.value))}
          </p>
          {data.cumulative && (
            <p className="text-xs opacity-70">
              Acumulado: {formatCurrency(data.cumulative)}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const CustomTaxTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-fg">{label}</p>
          <p className="text-sm text-emerald-600">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  const getComparisonData = () => {
    if (!projeto.precoSugerido && !projeto.precoAprovado) return null
    
    const data = []
    if (projeto.precoSugerido) {
      data.push({
        name: 'Preço Sugerido',
        value: projeto.precoSugerido,
        color: CHART_COLORS.secondary
      })
    }
    if (projeto.precoAprovado) {
      data.push({
        name: 'Preço Aprovado',
        value: projeto.precoAprovado,
        color: CHART_COLORS.primary
      })
    }
    data.push({
      name: 'Total Final',
      value: projeto.totalFinal,
      color: CHART_COLORS.warning
    })
    return data
  }

  const comparisonData = getComparisonData()

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro com Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border-border rounded-2xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-600">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs opacity-70">Subtotal</p>
              <p className="text-lg font-semibold text-fg">{formatCurrency(projeto.subtotal)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border-border rounded-2xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-600">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs opacity-70">Descontos</p>
              <p className="text-lg font-semibold text-fg">-{formatCurrency(projeto.totalDescontos)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border-border rounded-2xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-600">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs opacity-70">Impostos</p>
              <p className="text-lg font-semibold text-fg">{formatCurrency(projeto.totalImpostos)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border-border rounded-2xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs opacity-70">Total Final</p>
              <p className="text-lg font-semibold text-fg">{formatCurrency(projeto.totalFinal)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico Waterfall */}
        <section className="bg-card border-border rounded-2xl border p-6">
          <div className="flex items-center gap-2 pb-4 border-b border-border mb-4">
            <div className="p-1 rounded-lg bg-blue-500/20">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-fg">Composição do Preço</h3>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={waterfallData}
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
                <Tooltip content={<CustomWaterfallTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {waterfallData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <Line 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke={CHART_COLORS.secondary} 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Breakdown de Impostos */}
        <section className="bg-card border-border rounded-2xl border p-6">
          <div className="flex items-center gap-2 pb-4 border-b border-border mb-4">
            <div className="p-1 rounded-lg bg-orange-500/20">
              <Receipt className="w-4 h-4 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-fg">Breakdown de Impostos</h3>
          </div>

          {taxBreakdown.length > 0 ? (
            <div className="space-y-4">
              {taxBreakdown.map((tax, index) => (
                <div key={tax.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tax.color }}
                    />
                    <span className="font-medium text-fg">{tax.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-fg">
                    {formatCurrency(tax.value)}
                  </span>
                </div>
              ))}
              
              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-70">Total de Impostos:</span>
                  <span className="font-bold text-fg">
                    {formatCurrency(taxBreakdown.reduce((sum, tax) => sum + tax.value, 0))}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <div className="text-center">
                <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhuma informação fiscal disponível</p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Comparativo de Preços */}
      {comparisonData && (
        <section className="bg-card border-border rounded-2xl border p-6">
          <div className="flex items-center gap-2 pb-4 border-b border-border mb-4">
            <div className="p-1 rounded-lg bg-emerald-500/20">
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-fg">Comparativo de Preços</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparisonData.map((item, index) => (
              <div key={item.name} className="text-center p-4 bg-muted/20 rounded-xl">
                <p className="text-sm opacity-70 mb-2">{item.name}</p>
                <p 
                  className="text-xl font-bold"
                  style={{ color: item.color }}
                >
                  {formatCurrency(item.value)}
                </p>
                {index > 0 && comparisonData[0] && (
                  <p className="text-xs opacity-70 mt-1">
                    {item.value > comparisonData[0].value ? '+' : ''}
                    {formatCurrency(item.value - comparisonData[0].value)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Informações de Precificação */}
      {(projeto.pricingMethod || projeto.markupPct || projeto.marginPct) && (
        <section className="bg-card border-border rounded-2xl border p-6">
          <div className="flex items-center gap-2 pb-4 border-b border-border mb-4">
            <div className="p-1 rounded-lg bg-purple-500/20">
              <Percent className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-fg">Estratégia de Precificação</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projeto.pricingMethod && (
              <div className="text-center p-4 bg-muted/20 rounded-xl">
                <Calculator className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <h4 className="font-semibold text-fg mb-1">Método</h4>
                <p className="text-sm">
                  {projeto.pricingMethod === 'MARKUP' ? 'Markup' : 
                   projeto.pricingMethod === 'MARGIN' ? 'Margem' : 
                   projeto.pricingMethod}
                </p>
              </div>
            )}

            {projeto.markupPct && (
              <div className="text-center p-4 bg-muted/20 rounded-xl">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                <h4 className="font-semibold text-fg mb-1">Markup Aplicado</h4>
                <p className="text-lg font-bold text-emerald-600">
                  {formatPercent(projeto.markupPct)}
                </p>
              </div>
            )}

            {projeto.marginPct && (
              <div className="text-center p-4 bg-muted/20 rounded-xl">
                <Percent className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h4 className="font-semibold text-fg mb-1">Margem Aplicada</h4>
                <p className="text-lg font-bold text-blue-600">
                  {formatPercent(projeto.marginPct)}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Detalhamento Final */}
      <section className="bg-card border-border rounded-2xl border p-6">
        <div className="flex items-center gap-2 pb-4 border-b border-border mb-4">
          <div className="p-1 rounded-lg bg-gray-500/20">
            <Calculator className="w-4 h-4 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-fg">Detalhamento Completo</h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm opacity-70">Subtotal dos Itens:</span>
            <span className="font-medium text-fg">{formatCurrency(projeto.subtotal)}</span>
          </div>

          {projeto.totalDescontos > 0 && (
            <div className="flex justify-between items-center py-2">
              <span className="text-sm opacity-70">(-) Descontos:</span>
              <span className="font-medium text-red-600">-{formatCurrency(projeto.totalDescontos)}</span>
            </div>
          )}

          {projeto.totalImpostos > 0 && (
            <div className="flex justify-between items-center py-2">
              <span className="text-sm opacity-70">
                (+) Impostos ({formatPercent(projeto.percentualImpostos)}):
              </span>
              <span className="font-medium text-orange-600">{formatCurrency(projeto.totalImpostos)}</span>
            </div>
          )}

          <div className="border-t border-border pt-3">
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-fg">Total Final:</span>
              <span className="text-xl font-bold text-emerald-600">
                {formatCurrency(projeto.totalFinal)}
              </span>
            </div>
          </div>

          {projeto.margemLiquida !== null && (
            <div className="flex justify-between items-center py-2">
              <span className="text-sm opacity-70">Margem Líquida:</span>
              <span className={`font-semibold ${
                projeto.margemLiquida > 20 ? 'text-emerald-600' :
                projeto.margemLiquida > 10 ? 'text-orange-600' : 'text-red-600'
              }`}>
                {formatPercent(projeto.margemLiquida)}
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}