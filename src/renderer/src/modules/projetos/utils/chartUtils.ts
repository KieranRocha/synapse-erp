// Utility functions for charts
export const CHART_COLORS = {
  primary: '#22c55e',
  secondary: '#3b82f6',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  muted: '#94a3b8',
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value || 0))
}

export const formatPercentage = (value: number): string => {
  return `${(Number(value || 0) * 100).toFixed(1)}%`
}

export const formatPercent = (value: number): string => {
  const v = Number(value || 0)
  const pct = v <= 1 ? v * 100 : v
  return `${pct.toFixed(1)}%`
}

export const formatDate = (d: Date | string): string => {
  const date = d instanceof Date ? d : new Date(d)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString('pt-BR')
}

export const generateChartColors = (count: number): string[] => {
  const baseColors = [
    CHART_COLORS.secondary, CHART_COLORS.danger, CHART_COLORS.primary, CHART_COLORS.warning,
    '#8B5CF6', '#EC4899', CHART_COLORS.info, '#84CC16', '#F97316', '#6366F1'
  ]
  return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length])
}

export function processItemsByCategory(projeto: any) {
  const items: any[] = Array.isArray(projeto?.items) ? projeto.items : []
  if (items.length === 0) return [] as Array<any>
  const byCat = new Map<string, { value: number; count: number }>()
  const getQty = (it: any) => Number(it.quantity ?? it.quantidade ?? 0)
  const getUnit = (it: any) => Number(it.unitPrice ?? it.precoUnitario ?? 0)
  const getCat = (it: any) => String(it.category ?? it.categoria ?? 'Outros')
  for (const it of items) {
    const key = getCat(it)
    const inc = getQty(it) * getUnit(it)
    const prev = byCat.get(key) || { value: 0, count: 0 }
    byCat.set(key, { value: prev.value + inc, count: prev.count + getQty(it) })
  }
  const total = Array.from(byCat.values()).reduce((s, v) => s + v.value, 0)
  const colors = generateChartColors(byCat.size)
  return Array.from(byCat.entries()).map(([name, data], i) => ({
    name,
    value: data.value,
    count: data.count,
    percentage: total > 0 ? (data.value / total) * 100 : 0,
    color: colors[i],
  })).sort((a, b) => b.value - a.value)
}

export function getTopItems(projeto: any, n = 5) {
  const items: any[] = Array.isArray(projeto?.items) ? projeto.items : []
  const getQty = (it: any) => Number(it.quantity ?? it.quantidade ?? 0)
  const getUnit = (it: any) => Number(it.unitPrice ?? it.precoUnitario ?? 0)
  const getName = (it: any) => String(it.name ?? it.descricao ?? 'Item')
  return items
    .map((it) => ({ name: getName(it), value: getQty(it) * getUnit(it) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, n)
}

export function getMarginStatus(margem: number | null | undefined) {
  const v = Number(margem ?? 0)
  if (v < 5) return { label: 'Crítica', color: 'text-red-600', bgColor: 'bg-red-100' }
  if (v < 10) return { label: 'Baixa', color: 'text-orange-600', bgColor: 'bg-orange-100' }
  if (v < 20) return { label: 'Ok', color: 'text-green-600', bgColor: 'bg-green-100' }
  return { label: 'Excelente', color: 'text-emerald-600', bgColor: 'bg-emerald-100' }
}

export function calculateProjectHealth(projeto: any) {
  const strengths: string[] = []
  const issues: string[] = []
  const margem = Number(projeto?.margemLiquida ?? 0)
  const impostos = Number(projeto?.percentualImpostos ?? 0)
  if (margem >= 20) strengths.push('Margem acima de 20%')
  else if (margem < 10) issues.push('Margem abaixo de 10%')
  if (impostos <= 10) strengths.push('Baixa carga tributária')
  else if (impostos > 20) issues.push('Impostos elevados')
  if (projeto?.client) strengths.push('Cliente associado')
  else issues.push('Sem cliente associado')
  let score = 50
  score += Math.max(0, Math.min(40, (margem / 100) * 40))
  score -= Math.max(0, Math.min(20, (impostos / 100) * 20))
  score = Math.max(0, Math.min(100, Math.round(score)))
  const status = score >= 85 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'warning' : 'critical'
  return { score, status, strengths, issues }
}

export function createWaterfallData(projeto: any) {
  const steps = [
    { name: 'Subtotal', value: Number(projeto?.subtotal ?? 0), color: CHART_COLORS.secondary },
    { name: 'Descontos', value: -Math.abs(Number(projeto?.totalDescontos ?? 0)), color: CHART_COLORS.danger },
    { name: 'Impostos', value: Number(projeto?.totalImpostos ?? 0), color: CHART_COLORS.warning },
    { name: 'Total Final', value: Number(projeto?.totalFinal ?? 0), color: CHART_COLORS.primary },
  ]
  let cumulative = 0
  return steps.map((s, idx) => {
    if (idx === 0) cumulative = s.value
    else if (idx < steps.length - 1) cumulative += s.value
    else cumulative = s.value
    return { ...s, cumulative }
  })
}

export function calculateTaxBreakdown(projeto: any) {
  const total = Number(projeto?.totalImpostos ?? 0)
  if (!total) return [] as Array<{ name: string; value: number; color: string }>
  return [
    { name: 'Impostos', value: total, color: CHART_COLORS.warning },
  ]
}
