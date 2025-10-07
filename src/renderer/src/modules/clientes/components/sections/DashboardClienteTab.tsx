import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, ShoppingCart, TrendingUp, Calendar, User, ArrowRight } from 'lucide-react';
import { currency } from '../../../../shared/utils/format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardClienteTabProps {
  clienteId: string;
  nomeCliente: string;
}

interface ClienteKPIs {
  totalOrcamentos: number;
  orcamentosAbertos: number;
  orcamentosAprovados: number;
  totalFaturado: number;
  limiteDisponivel: number;
  ticketMedio: number;
  taxaAprovacao: number;
  tempoMedioResposta: number;
}

interface OrcamentoRecente {
  id: number;
  numero: string;
  data: string;
  valor: number;
  status: 'aberto' | 'aprovado' | 'recusado' | 'enviado';
}

interface FaturamentoMensal {
  mes: string;
  valor: number;
}

export function DashboardClienteTab({ clienteId, nomeCliente }: DashboardClienteTabProps) {
  const [kpis, setKpis] = useState<ClienteKPIs>({
    totalOrcamentos: 0,
    orcamentosAbertos: 0,
    orcamentosAprovados: 0,
    totalFaturado: 0,
    limiteDisponivel: 0,
    ticketMedio: 0,
    taxaAprovacao: 0,
    tempoMedioResposta: 0,
  });

  const [orcamentosRecentes, setOrcamentosRecentes] = useState<OrcamentoRecente[]>([]);
  const [faturamentoMensal, setFaturamentoMensal] = useState<FaturamentoMensal[]>([]);
  const [dataCadastro, setDataCadastro] = useState<string>('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // TODO: Integrar com APIs reais do backend
        // const kpisData = await window.api.clients.getKPIs(clienteId);
        // const orcamentos = await window.api.clients.getRecentBudgets(clienteId);
        // const faturamento = await window.api.clients.getMonthlyRevenue(clienteId);

        // Por enquanto, não há dados disponíveis - aguardando integração backend
        setKpis({
          totalOrcamentos: 0,
          orcamentosAbertos: 0,
          orcamentosAprovados: 0,
          totalFaturado: 0,
          limiteDisponivel: 0,
          ticketMedio: 0,
          taxaAprovacao: 0,
          tempoMedioResposta: 0,
        });

        setOrcamentosRecentes([]);
        setFaturamentoMensal([]);
        setDataCadastro('—');
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      }
    };

    loadDashboardData();
  }, [clienteId]);

  const Trend = ({ trend }: { trend?: number }) => {
    if (typeof trend !== "number") return null;

    const cls = trend > 0 ? "text-success" : trend < 0 ? "text-danger" : "text-muted-foreground";

    return (
      <div className={`mt-1 text-xs flex items-center gap-1 ${cls}`} aria-live="polite">
        {trend > 0 && <ArrowUpRight className="w-3 h-3" aria-hidden />}
        {trend < 0 && <ArrowDownRight className="w-3 h-3" aria-hidden />}
        {trend !== 0 ? `${Math.abs(trend)}%` : "—"}
      </div>
    );
  };

  const KPICard = ({
    title,
    value,
    trend,
  }: {
    title: string;
    value: string | number;
    trend?: number;
  }) => (
    <div className="rounded-2xl border border-border bg-card shadow-card backdrop-blur p-4">
      <p className="text-xs text-muted-foreground mb-1">{title}</p>
      <div className="text-xl font-semibold text-fg">{value}</div>
      <Trend trend={trend} />
    </div>
  );

  const getStatusBadge = (status: OrcamentoRecente['status']) => {
    const badges = {
      aberto: 'badge badge-info',
      aprovado: 'badge badge-success',
      recusado: 'badge badge-danger',
      enviado: 'badge badge-warning'
    };
    const labels = {
      aberto: 'Aberto',
      aprovado: 'Aprovado',
      recusado: 'Recusado',
      enviado: 'Enviado'
    };
    return <span className={`${badges[status]} text-xs`}>{labels[status]}</span>;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-fg">{payload[0].payload.mes}</p>
        <p className="text-sm text-emerald-600">{currency(payload[0].value)}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-2">{nomeCliente}</h2>
        <p className="text-sm opacity-70">Visão geral do relacionamento comercial</p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard title="Total Orçamentos" value={kpis.totalOrcamentos} trend={+8} />
        <KPICard title="Orçamentos Abertos" value={kpis.orcamentosAbertos} trend={+5} />
        <KPICard title="Aprovados" value={kpis.orcamentosAprovados} trend={+12} />
        <KPICard title="Total Faturado" value={currency(kpis.totalFaturado)} trend={+3} />
        <KPICard title="Limite Disponível" value={currency(kpis.limiteDisponivel)} trend={0} />
        <KPICard title="Ticket Médio" value={currency(kpis.ticketMedio)} trend={-2} />
      </div>

      {/* Métricas de Relacionamento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs opacity-70">Taxa de Aprovação</p>
              <p className="text-2xl font-semibold">{kpis.taxaAprovacao.toFixed(1)}%</p>
            </div>
          </div>
          <p className="text-xs opacity-70">{kpis.orcamentosAprovados} de {kpis.totalOrcamentos} orçamentos aprovados</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs opacity-70">Tempo Médio Resposta</p>
              <p className="text-2xl font-semibold">{kpis.tempoMedioResposta} dias</p>
            </div>
          </div>
          <p className="text-xs opacity-70">Tempo entre envio e resposta</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs opacity-70">Cliente Desde</p>
              <p className="text-2xl font-semibold">{dataCadastro}</p>
            </div>
          </div>
          <p className="text-xs opacity-70">Relacionamento de longo prazo</p>
        </div>
      </div>

      {/* Orçamentos Recentes e Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orçamentos Recentes */}
        <section className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-fg" />
              <h3 className="text-lg font-semibold">Orçamentos Recentes</h3>
            </div>
            <button className="text-xs text-primary hover:underline flex items-center gap-1">
              Ver todos <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {orcamentosRecentes.length > 0 ? (
            <div className="space-y-3">
              {orcamentosRecentes.map((orc) => (
                <div key={orc.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{orc.numero}</p>
                    <p className="text-xs opacity-70">{new Date(orc.data).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-semibold text-sm">{currency(orc.valor)}</p>
                  </div>
                  <div>
                    {getStatusBadge(orc.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <ShoppingCart className="w-12 h-12 opacity-20 mx-auto mb-4" />
              <p className="text-sm opacity-70">Aguardando integração com backend</p>
              <p className="text-xs opacity-50 mt-1">Orçamentos do cliente serão exibidos aqui</p>
            </div>
          )}
        </section>

        {/* Faturamento Mensal */}
        <section className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
            <TrendingUp className="w-5 h-5 text-fg" />
            <h3 className="text-lg font-semibold">Faturamento Mensal</h3>
          </div>

          {faturamentoMensal.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={faturamentoMensal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.1)" />
                  <XAxis
                    dataKey="mes"
                    tick={{ fill: 'var(--fg)', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(128, 128, 128, 0.2)' }}
                  />
                  <YAxis
                    tick={{ fill: 'var(--fg)', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(128, 128, 128, 0.2)' }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 opacity-20 mx-auto mb-4" />
                <p className="text-sm opacity-70">Aguardando integração com backend</p>
                <p className="text-xs opacity-50 mt-1">Faturamento mensal será exibido aqui</p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Timeline de Relacionamento */}
      <section className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
          <Calendar className="w-5 h-5 text-fg" />
          <h3 className="text-lg font-semibold">Timeline do Relacionamento</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2"></div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">Cliente desde</p>
                <p className="text-sm opacity-70">15 de Janeiro, 2023</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">Última compra</p>
                <p className="text-sm opacity-70">3 de Outubro, 2025</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">Último contato</p>
                <p className="text-sm opacity-70">28 de Setembro, 2025</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-2"></div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">Próximo follow-up</p>
                <p className="text-sm opacity-70 text-amber-600">15 de Outubro, 2025</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
