// pricing.ts
export type PriceMethod = 'MARKUP' | 'MARGIN'

export interface PricingFlagsAsCost {
  icmsAsCost: boolean
  pisCofinsAsCost: boolean
  ipiAsCost: boolean
  issAsCost: boolean
}

export interface TotalsForPricing {
  base?: number
  adicionais?: number
  icmsProprio?: number
  icmsST?: number
  fcp?: number
  fcpST?: number
  pis?: number
  cofins?: number
  ipi?: number
  iss?: number
  difal?: number
}

/** custo considerado = base + adicionais (+ impostos que você decidir tratar como custo) */
export function buildConsideredCost(totals: TotalsForPricing, flags: PricingFlagsAsCost) {
  let cost = (totals.base || 0) + (totals.adicionais || 0)
  if (flags.icmsAsCost)
    cost +=
      (totals.icmsProprio || 0) + (totals.icmsST || 0) + (totals.fcp || 0) + (totals.fcpST || 0)
  if (flags.pisCofinsAsCost) cost += (totals.pis || 0) + (totals.cofins || 0)
  if (flags.ipiAsCost) cost += totals.ipi || 0
  if (flags.issAsCost) cost += totals.iss || 0
  return Math.max(0, cost)
}

/** Calcula preço a partir de markup sobre custo */
export function priceFromMarkup(custo: number, markupPct: number): number {
  const markup = 1 + markupPct / 100
  return custo * markup
}

/** Calcula preço a partir de margem desejada */
export function priceFromMargin(custo: number, marginPct: number): number {
  const margin = marginPct / 100
  return custo / (1 - margin)
}

/** custo considerado = base + adicionais (+ impostos que você decidir tratar como custo) */
export function consideredCostFromTotals(totals: TotalsForPricing, flags: PricingFlagsAsCost) {
  let cost = (totals.base || 0) + (totals.adicionais || 0)
  if (flags.icmsAsCost)
    cost +=
      (totals.icmsProprio || 0) + (totals.icmsST || 0) + (totals.fcp || 0) + (totals.fcpST || 0)
  if (flags.pisCofinsAsCost) cost += (totals.pis || 0) + (totals.cofins || 0)
  if (flags.ipiAsCost) cost += totals.ipi || 0
  if (flags.issAsCost) cost += totals.iss || 0
  return Math.max(0, cost)
}

/** KPIs de preço e margem (valor e %) */
export function kpisFromPrice(
  totals: TotalsForPricing,
  precoVenda: number,
  flags: PricingFlagsAsCost
) {
  const receita = Math.max(0, Number(precoVenda) || 0)
  const custoConsiderado = buildConsideredCost(totals, flags)
  const lucroBruto = Math.max(0, receita - custoConsiderado)
  const margemBrutaPct = receita > 0 ? (lucroBruto / receita) * 100 : 0

  const totalImpostos =
    (totals.iss || 0) +
    (totals.icmsProprio || 0) +
    (totals.icmsST || 0) +
    (totals.fcp || 0) +
    (totals.fcpST || 0) +
    (totals.ipi || 0) +
    (totals.pis || 0) +
    (totals.cofins || 0) +
    (totals.difal || 0)

  // estimativa pós-tributos (sem re-simular bases; boa o suficiente para decisão comercial rápida)
  const lucroPosTrib = Math.max(0, receita - custoConsiderado - totalImpostos)
  const margemPosTribPct = receita > 0 ? (lucroPosTrib / receita) * 100 : 0

  const markupSobreCusto = custoConsiderado > 0 ? (receita / custoConsiderado - 1) * 100 : 0

  return {
    receita,
    custoConsiderado,
    lucroBruto,
    margemBrutaPct,
    lucroPosTrib,
    margemPosTribPct,
    markupSobreCusto,
    totalImpostos
  }
}
