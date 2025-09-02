import React from 'react'
import {
  Calendar,
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Calculator,
  Percent,
  FileText,
  TrendingUp,
  BarChart3,
  Clock,
  Target,
  Lightbulb
} from 'lucide-react'
import type { ProjetoDetalhado } from '../../types/projetoTypes'
import { DashboardExecutivo } from './DashboardExecutivo'
import { FinanceiroDetalhado } from './FinanceiroDetalhado'
import { ItensResumo } from './ItensResumo'
import { TimelineAprimorada } from './TimelineAprimorada'
import { InsightsAlertas } from './InsightsAlertas'

interface GeralTabProps {
  projeto: ProjetoDetalhado
}

export function GeralTab({ projeto }: GeralTabProps) {
  const formatCurrency = (value: number | null) =>
    value ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'

  const formatDate = (date: Date | null) =>
    date ? new Date(date).toLocaleDateString('pt-BR') : '—'

  const formatPercent = (value: number | null) =>
    value ? `${value.toFixed(2)}%` : '—'

  return (
    <div className="space-y-6">
      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border-border rounded-2xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs opacity-70">Total do Projeto</p>
              <p className="text-lg font-semibold text-fg">{formatCurrency(projeto.totalFinal)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border-border rounded-2xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-600">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs opacity-70">Total de Itens</p>
              <p className="text-lg font-semibold text-fg">{projeto.items?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border-border rounded-2xl border p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${(projeto.margemLiquida || 0) > 20
                ? 'bg-emerald-500/20 text-emerald-600'
                : (projeto.margemLiquida || 0) > 10
                  ? 'bg-orange-500/20 text-orange-600'
                  : 'bg-red-500/20 text-red-600'
              }`}>
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs opacity-70">Margem Líquida</p>
              <p className="text-lg font-semibold text-fg">{formatPercent(projeto.margemLiquida)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border-border rounded-2xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-neutral-500/20 text-neutral-600">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs opacity-70">Impostos</p>
              <p className="text-lg font-semibold text-fg">{formatPercent(projeto.percentualImpostos)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seções principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações do Projeto */}
        <section className="bg-card border-border rounded-2xl border p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <User className="w-5 h-5 text-fg" />
            <h3 className="text-lg font-semibold text-fg">Informações do Projeto</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs opacity-70 block mb-1">Número</label>
                <p className="font-mono text-sm">{projeto.numero}</p>
              </div>
              <div>
                <label className="text-xs opacity-70 block mb-1">Status</label>
                <p className="text-sm">{projeto.status}</p>
              </div>
            </div>

            <div>
              <label className="text-xs opacity-70 block mb-1">Nome do Projeto</label>
              <p className="text-sm font-medium">{projeto.name}</p>
            </div>

            {projeto.description && (
              <div>
                <label className="text-xs opacity-70 block mb-1">Descrição</label>
                <p className="text-sm leading-relaxed">{projeto.description}</p>
              </div>
            )}

            <div>
              <label className="text-xs opacity-70 block mb-1">Responsável</label>
              <p className="text-sm">{projeto.responsavel || '—'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs opacity-70 block mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Data de Início
                </label>
                <p className="text-sm">{formatDate(projeto.startDate)}</p>
              </div>
              <div>
                <label className="text-xs opacity-70 block mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Previsão de Entrega
                </label>
                <p className="text-sm">{formatDate(projeto.deliveryDate)}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-xs opacity-70 block mb-1">Criado em</label>
                  <p>{formatDate(projeto.created_at)}</p>
                </div>
                <div>
                  <label className="text-xs opacity-70 block mb-1">Atualizado em</label>
                  <p>{formatDate(projeto.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Informações do Cliente */}
        <section className="bg-card border-border rounded-2xl border p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Building2 className="w-5 h-5 text-fg" />
            <h3 className="text-lg font-semibold text-fg">Informações do Cliente</h3>
          </div>

          {projeto.client ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs opacity-70 block mb-1">Razão Social</label>
                <p className="text-sm font-medium">{projeto.client.razao_social}</p>
              </div>

              {projeto.client.nome_fantasia && (
                <div>
                  <label className="text-xs opacity-70 block mb-1">Nome Fantasia</label>
                  <p className="text-sm">{projeto.client.nome_fantasia}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs opacity-70 block mb-1">CNPJ</label>
                  <p className="text-sm font-mono">{projeto.client.cpf_cnpj}</p>
                </div>
                <div>
                  <label className="text-xs opacity-70 block mb-1">Regime Tributário</label>
                  <p className="text-sm">{projeto.client.regime_trib || '—'}</p>
                </div>
              </div>

              {(projeto.client.email || projeto.client.telefone || projeto.client.responsavel) && (
                <div className="space-y-2 pt-2 border-t border-border">
                  {projeto.client.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 opacity-70" />
                      <span>{projeto.client.email}</span>
                    </div>
                  )}
                  {projeto.client.telefone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 opacity-70" />
                      <span>{projeto.client.telefone}</span>
                    </div>
                  )}
                  {projeto.client.responsavel && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 opacity-70" />
                      <span>{projeto.client.responsavel}</span>
                    </div>
                  )}
                </div>
              )}

              {(projeto.client.logradouro || projeto.client.cidade) && (
                <div className="pt-2 border-t border-border">
                  <label className="text-xs opacity-70 block mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Endereço
                  </label>
                  <div className="text-sm space-y-1">
                    {projeto.client.logradouro && (
                      <p>
                        {projeto.client.logradouro}
                        {projeto.client.numero && `, ${projeto.client.numero}`}
                      </p>
                    )}
                    {projeto.client.bairro && <p>{projeto.client.bairro}</p>}
                    <p>
                      {projeto.client.cidade}
                      {projeto.client.uf && ` - ${projeto.client.uf}`}
                      {projeto.client.cep && ` • CEP: ${projeto.client.cep}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Cliente não informado</p>
            </div>
          )}
        </section>
      </div>

      {/* Configuração de Preços */}
      {(projeto.pricingMethod || projeto.markupPct || projeto.marginPct || projeto.precoSugerido || projeto.precoAprovado) && (
        <section className="bg-card border-border rounded-2xl border p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Calculator className="w-5 h-5 text-fg" />
            <h3 className="text-lg font-semibold text-fg">Configuração de Preços</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projeto.pricingMethod && (
              <div>
                <label className="text-xs opacity-70 block mb-1">Método de Precificação</label>
                <p className="text-sm">
                  {projeto.pricingMethod === 'MARKUP' ? 'Markup' :
                    projeto.pricingMethod === 'MARGIN' ? 'Margem' : '—'}
                </p>
              </div>
            )}

            {projeto.markupPct && (
              <div>
                <label className="text-xs opacity-70 block mb-1">Markup Aplicado</label>
                <p className="text-sm font-semibold">{formatPercent(projeto.markupPct)}</p>
              </div>
            )}

            {projeto.marginPct && (
              <div>
                <label className="text-xs opacity-70 block mb-1">Margem Aplicada</label>
                <p className="text-sm font-semibold">{formatPercent(projeto.marginPct)}</p>
              </div>
            )}
          </div>

          {(projeto.precoSugerido || projeto.precoAprovado) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border">
              {projeto.precoSugerido && (
                <div>
                  <label className="text-xs opacity-70 block mb-1">Preço Sugerido</label>
                  <p className="text-lg font-semibold text-fg">{formatCurrency(projeto.precoSugerido)}</p>
                </div>
              )}
              {projeto.precoAprovado && (
                <div>
                  <label className="text-xs opacity-70 block mb-1">Preço Aprovado</label>
                  <p className="text-lg font-semibold text-emerald-600">{formatCurrency(projeto.precoAprovado)}</p>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Resumo Financeiro Detalhado */}
      <section className="bg-card border-border rounded-2xl border p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <CreditCard className="w-5 h-5 text-fg" />
          <h3 className="text-lg font-semibold text-fg">Resumo Financeiro</h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
            <span className="text-sm opacity-70">Subtotal dos Itens:</span>
            <span className="font-medium text-fg">{formatCurrency(projeto.subtotal)}</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
            <span className="text-sm opacity-70">Descontos Aplicados:</span>
            <span className="font-medium text-red-600">
              -{formatCurrency(projeto.totalDescontos)}
            </span>
          </div>

          {projeto.percentualImpostos && (
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
              <span className="text-sm opacity-70">Impostos ({formatPercent(projeto.percentualImpostos)}):</span>
              <span className="font-medium text-fg">
                {formatCurrency((projeto.totalFinal * (projeto.percentualImpostos / 100)))}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <span className="text-base font-semibold text-fg">Total Final:</span>
            <span className="text-xl font-bold text-emerald-600">
              {formatCurrency(projeto.totalFinal)}
            </span>
          </div>

          {projeto.margemLiquida && (
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
              <span className="text-sm opacity-70">Margem Líquida:</span>
              <span className={`font-semibold ${projeto.margemLiquida > 20 ? 'text-emerald-600' :
                  projeto.margemLiquida > 10 ? 'text-orange-600' : 'text-red-600'
                }`}>
                {formatPercent(projeto.margemLiquida)}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Dashboard Executivo */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <div className="p-1 rounded-lg bg-blue-500/20">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-fg">Dashboard Executivo</h3>
        </div>
        <DashboardExecutivo projeto={projeto} />
      </section>

      {/* Análise Financeira Detalhada */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <div className="p-1 rounded-lg bg-emerald-500/20">
            <Calculator className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-fg">Análise Financeira Detalhada</h3>
        </div>
        <FinanceiroDetalhado projeto={projeto} />
      </section>

      {/* Resumo de Itens */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <div className="p-1 rounded-lg bg-purple-500/20">
            <BarChart3 className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-fg">Análise de Itens</h3>
        </div>
        <ItensResumo projeto={projeto} />
      </section>

      {/* Timeline Aprimorada */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <div className="p-1 rounded-lg bg-indigo-500/20">
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-fg">Timeline do Projeto</h3>
        </div>
        <TimelineAprimorada projeto={projeto} />
      </section>

      {/* Insights e Alertas */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <div className="p-1 rounded-lg bg-yellow-500/20">
            <Lightbulb className="w-4 h-4 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-fg">Insights e Alertas</h3>
        </div>
        <InsightsAlertas projeto={projeto} />
      </section>
    </div>
  )
}