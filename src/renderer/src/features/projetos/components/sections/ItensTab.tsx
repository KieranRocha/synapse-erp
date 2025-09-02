import React, { useMemo } from 'react'
import { Package, TrendingUp, BarChart3, Search, Filter } from 'lucide-react'
import type { ProjetoDetalhado } from '../../types/projetoTypes'

interface ItensTabProps {
  projeto: ProjetoDetalhado
}

interface ItemProcessado {
  nome: string
  categoria: string
  unidade: string
  quantidade: number
  precoUnitario: number
  subtotal: number
  percentual: number
}

interface CategoriaProcessada {
  nome: string
  quantidade: number
  valor: number
  percentual: number
  color: string
}

export function ItensTab({ projeto }: ItensTabProps) {
  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const getCategoryColor = (categoria: string) => {
    const colors = [
      '#22c55e', '#3b82f6', '#f59e0b', '#ef4444',
      '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'
    ]
    const hash = categoria.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  const dadosProcessados = useMemo(() => {
    if (!projeto.items || projeto.items.length === 0) {
      return {
        itens: [],
        categorias: [],
        metricas: {
          totalItens: 0,
          valorTotal: 0,
          ticketMedio: 0,
          categoriaTop: null
        }
      }
    }

    const valorTotal = projeto.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)

    const itens: ItemProcessado[] = projeto.items.map(item => ({
      nome: item.name,
      categoria: item.category || 'Sem categoria',
      unidade: item.unit,
      quantidade: item.quantity,
      precoUnitario: item.unitPrice,
      subtotal: item.quantity * item.unitPrice,
      percentual: valorTotal > 0 ? ((item.quantity * item.unitPrice) / valorTotal) * 100 : 0
    }))

    // Agrupar por categoria
    const categoriaMap = new Map<string, { quantidade: number; valor: number }>()
    projeto.items.forEach(item => {
      const categoria = item.category || 'Sem categoria'
      const existing = categoriaMap.get(categoria) || { quantidade: 0, valor: 0 }
      categoriaMap.set(categoria, {
        quantidade: existing.quantidade + item.quantity,
        valor: existing.valor + (item.quantity * item.unitPrice)
      })
    })

    const categorias: CategoriaProcessada[] = Array.from(categoriaMap.entries())
      .map(([nome, data]) => ({
        nome,
        quantidade: data.quantidade,
        valor: data.valor,
        percentual: valorTotal > 0 ? (data.valor / valorTotal) * 100 : 0,
        color: getCategoryColor(nome)
      }))
      .sort((a, b) => b.valor - a.valor)

    const metricas = {
      totalItens: projeto.items.length,
      valorTotal,
      ticketMedio: valorTotal / projeto.items.length,
      categoriaTop: categorias[0]?.nome || null
    }

    return { itens, categorias, metricas }
  }, [projeto.items])

  if (!projeto.items || projeto.items.length === 0) {
    return (
      <div className="bg-card border-border rounded-2xl border p-8 text-center">
        <Package className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold text-fg mb-2">
          Nenhum item encontrado
        </h3>
        <p className="text-sm opacity-70">
          Este projeto ainda não possui itens cadastrados.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border-border rounded-2xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-600">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs opacity-70">Total de Itens</p>
              <p className="text-lg font-semibold text-fg">{dadosProcessados.metricas.totalItens}</p>
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
              <p className="text-lg font-semibold text-fg">{formatCurrency(dadosProcessados.metricas.valorTotal)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border-border rounded-2xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs opacity-70">Ticket Médio</p>
              <p className="text-lg font-semibold text-fg">{formatCurrency(dadosProcessados.metricas.ticketMedio)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border-border rounded-2xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-600">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs opacity-70">Categoria Principal</p>
              <p className="text-sm font-semibold text-fg truncate">{dadosProcessados.metricas.categoriaTop || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por categoria */}
        <section className="bg-card border-border rounded-2xl border p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <BarChart3 className="w-5 h-5 text-fg" />
            <h3 className="text-lg font-semibold text-fg">Distribuição por Categoria</h3>
          </div>

          {dadosProcessados.categorias.length > 0 ? (
            <div className="space-y-3">
              {dadosProcessados.categorias.map((categoria, index) => (
                <div key={categoria.nome} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: categoria.color }}
                      />
                      <span className="font-medium text-fg">{categoria.nome}</span>
                    </div>
                    <span className="text-xs opacity-70">
                      {categoria.percentual.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${categoria.percentual}%`,
                          backgroundColor: categoria.color
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-fg min-w-fit">
                      {formatCurrency(categoria.valor)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">Nenhuma categoria encontrada</p>
            </div>
          )}
        </section>

        {/* Resumo por categoria em cards */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Package className="w-5 h-5 text-fg" />
            <h3 className="text-lg font-semibold text-fg">Resumo por Categoria</h3>
          </div>

          <div className="space-y-3">
            {dadosProcessados.categorias.slice(0, 6).map((categoria) => (
              <div
                key={categoria.nome}
                className="bg-card border-border rounded-2xl border p-4 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-fg truncate">
                    {categoria.nome}
                  </h4>
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: categoria.color }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="opacity-70 mb-1">Valor</p>
                    <p className="font-semibold text-fg">{formatCurrency(categoria.valor)}</p>
                  </div>
                  <div>
                    <p className="opacity-70 mb-1">Qtd.</p>
                    <p className="font-semibold text-fg">{categoria.quantidade.toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="opacity-70 mb-1">Participação</p>
                    <p className="font-semibold text-fg">{categoria.percentual.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Lista detalhada de itens */}
      <section className="bg-card border-border rounded-2xl border overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-fg">Lista Detalhada de Itens</h3>
              <p className="text-sm opacity-70 mt-1">
                Visualize todos os itens do projeto com seus respectivos valores
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar item..."
                  className="pl-9 pr-3 py-2 rounded-xl border border-border bg-input text-sm"
                />
              </div>
              <button className="p-2 rounded-xl border border-border hover:bg-muted transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-xs opacity-70 font-medium">Item</th>
                <th className="text-center p-4 text-xs opacity-70 font-medium">Un.</th>
                <th className="text-right p-4 text-xs opacity-70 font-medium">Qtd.</th>
                <th className="text-right p-4 text-xs opacity-70 font-medium">Preço Unit.</th>
                <th className="text-right p-4 text-xs opacity-70 font-medium">Subtotal</th>
                <th className="text-right p-4 text-xs opacity-70 font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {dadosProcessados.itens.map((item, index) => (
                <tr key={index} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-fg text-sm">{item.nome}</p>
                      <p className="text-xs opacity-70">{item.categoria}</p>
                    </div>
                  </td>
                  <td className="p-4 text-center text-sm">{item.unidade}</td>
                  <td className="p-4 text-right text-sm font-medium">
                    {item.quantidade.toLocaleString('pt-BR')}
                  </td>
                  <td className="p-4 text-right text-sm">
                    {formatCurrency(item.precoUnitario)}
                  </td>
                  <td className="p-4 text-right text-sm font-semibold text-emerald-600">
                    {formatCurrency(item.subtotal)}
                  </td>
                  <td className="p-4 text-right text-xs opacity-70">
                    {item.percentual.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}