import { useMemo } from 'react'
import type { Budget } from '../utils/budgetFilters'

export function useKpis(data: Budget[]) {
  return useMemo(() => {
    if (!data.length) {
      return {
        conversao: 0,
        ticketMedio: 0,
        vencidosPct: 0,
        margemMedia: 0,
        prazoMedio: 0,
        revisadosPct: 0
      }
    }
    const enviados = data.filter((d) => d.enviado)
    const aprovados = data.filter((d) => d.status === 'aprovado')
    const vencidos = data.filter((d) => d.status === 'vencido')
    const revisados = data.filter((d) => d.rev && d.rev > 0)

    const conversao = enviados.length ? (aprovados.length / enviados.length) * 100 : 0
    const ticketMedio = data.reduce((s, d) => s + d.valor, 0) / data.length
    const vencidosPct = data.length ? (vencidos.length / data.length) * 100 : 0
    const margemMedia = (data.reduce((s, d) => s + d.margem, 0) / data.length) * 100
    const prazoMedio = data.reduce((s, d) => s + d.slaDias, 0) / data.length
    const revisadosPct = data.length ? (revisados.length / data.length) * 100 : 0

    return { conversao, ticketMedio, vencidosPct, margemMedia, prazoMedio, revisadosPct }
  }, [data])
}
