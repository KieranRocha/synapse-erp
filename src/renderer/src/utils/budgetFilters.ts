export type Budget = {
  margem: number
  slaDias: number
  enviado: boolean
  respondeuEm: string | null
}

export type Filtros = {
  busca?: string
  status?: Budget['status'] | ''
  inicio?: string
  fim?: string
  cliente?: string
  projeto?: string
  min?: string | number | null
}

export type SortKey = 'emissao' | '-emissao' | 'valor' | '-valor' | 'status'

export function filterBudgets(budgets: Budget[], filtros: Filtros) {
  const b = (filtros.busca || '').toLowerCase()
  const cli = (filtros.cliente || '').toLowerCase()
  const proj = (filtros.projeto || '').toLowerCase()
  const hasMin = filtros.min !== '' && filtros.min !== null && filtros.min !== undefined
  const minVal = hasMin ? Number(filtros.min) : null

  return budgets.filter((r) => {
    if (filtros.status && r.status !== filtros.status) return false
    if (filtros.inicio && new Date(r.emissao) < new Date(filtros.inicio)) return false
    if (filtros.fim && new Date(r.emissao) > new Date(filtros.fim)) return false
    if (hasMin && !Number.isNaN(minVal) && r.valor < (minVal as number)) return false
    if (filtros.cliente && !r.cliente.toLowerCase().includes(cli)) return false
    if (filtros.projeto && !r.projeto.toLowerCase().includes(proj)) return false

    if (!filtros.busca) return true
    const matchBusca =
      r.numero.toLowerCase().includes(b) ||
      r.cliente.toLowerCase().includes(b) ||
      r.projeto.toLowerCase().includes(b)
    return matchBusca
  })
}

export function sortBudgets(rows: Budget[], sort: SortKey) {
  const arr = [...rows]
  switch (sort) {
    case 'emissao':
      return arr.sort((a, b) => +new Date(a.emissao) - +new Date(b.emissao))
    case '-emissao':
      return arr.sort((a, b) => +new Date(b.emissao) - +new Date(a.emissao))
    case 'valor':
      return arr.sort((a, b) => a.valor - b.valor)
    case '-valor':
      return arr.sort((a, b) => b.valor - a.valor)
    case 'status':
      return arr.sort((a, b) => a.status.localeCompare(b.status))
    default:
      return arr
  }
}

// (Opcional) pequenos testes de sanidade
export function selfTest(budgets: Budget[]) {
  const assert = (cond: boolean, msg: string) => {
    if (!cond) throw new Error(msg)
  }
  let out = sortBudgets(filterBudgets(budgets, { status: 'aprovado' }), '-emissao')
  assert(
    out.every((r) => r.status === 'aprovado'),
    'Filtro por status falhou'
  )
  out = sortBudgets(filterBudgets(budgets, { busca: 'aurora' }), '-emissao')
  assert(
    out.some((r) => r.cliente === 'Metalúrgica Aurora'),
    'Busca texto falhou'
  )
  out = sortBudgets(filterBudgets(budgets, { min: 150000 }), 'valor')
  assert(
    out.every((r) => r.valor >= 150000),
    'Mínimo por valor falhou'
  )
}
