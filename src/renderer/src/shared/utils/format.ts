export function currency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
export function dateBR(d: string | number | Date) {
  const dt = new Date(d)
  return dt.toLocaleDateString('pt-BR')
}
