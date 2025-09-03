// utils.ts
import { computeTotals, perItemImpact } from '@renderer/modules/orcamentos/domain/services/CalculadoraOrcamento'

/* ===== Helpers ===== */
export const currency = (v: number = 0) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const pct = (v: number = 0) => `${v.toFixed(2)}%`

export const num = (v: unknown): number => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export { computeTotals, perItemImpact }
