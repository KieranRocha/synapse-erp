import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, AlertCircle, TrendingUp, Calendar, Receipt } from 'lucide-react';
import { currency } from '../../../../shared/utils/format';

interface FinancasClienteTabProps {
  clienteId: string;
}

interface FinancialKPIs {
  limiteTotal: number;
  limiteUtilizado: number;
  limiteDisponivel: number;
  percentualUtilizado: number;
  faturamentoTotal: number;
  inadimplencia: number;
  performancePagamento: number;
}

interface TituloAberto {
  id: number;
  documento: string;
  vencimento: string;
  valor: number;
  diasAtraso: number;
  status: 'em_dia' | 'vencido' | 'a_vencer';
}

interface HistoricoPagamento {
  id: number;
  documento: string;
  vencimento: string;
  pagamento: string;
  valor: number;
  status: 'pago' | 'pago_atraso' | 'pago_antecipado';
}

export function FinancasClienteTab({ clienteId }: FinancasClienteTabProps) {
  const [kpis, setKpis] = useState<FinancialKPIs>({
    limiteTotal: 0,
    limiteUtilizado: 0,
    limiteDisponivel: 0,
    percentualUtilizado: 0,
    faturamentoTotal: 0,
    inadimplencia: 0,
    performancePagamento: 0,
  });

  const [titulosAbertos, setTitulosAbertos] = useState<TituloAberto[]>([]);
  const [historicoPagamentos, setHistoricoPagamentos] = useState<HistoricoPagamento[]>([]);

  useEffect(() => {
    const loadFinancialData = async () => {
      try {
        // TODO: Integrar com APIs reais do backend
        // const kpisData = await window.api.clients.getFinancialKPIs(clienteId);
        // const titulos = await window.api.clients.getOpenInvoices(clienteId);
        // const historico = await window.api.clients.getPaymentHistory(clienteId);

        // Aguardando integração - sem dados disponíveis
        setKpis({
          limiteTotal: 0,
          limiteUtilizado: 0,
          limiteDisponivel: 0,
          percentualUtilizado: 0,
          faturamentoTotal: 0,
          inadimplencia: 0,
          performancePagamento: 0,
        });

        setTitulosAbertos([]);
        setHistoricoPagamentos([]);
      } catch (error) {
        console.error('Erro ao carregar dados financeiros:', error);
      }
    };

    loadFinancialData();
  }, [clienteId]);

  const getStatusBadge = (status: TituloAberto['status']) => {
    const badges = {
      em_dia: 'badge badge-success',
      vencido: 'badge badge-danger',
      a_vencer: 'badge badge-info'
    };
    const labels = {
      em_dia: 'Em dia',
      vencido: 'Vencido',
      a_vencer: 'A vencer'
    };
    return <span className={`${badges[status]} text-xs`}>{labels[status]}</span>;
  };

  const getPaymentStatusBadge = (status: HistoricoPagamento['status']) => {
    const badges = {
      pago: 'badge badge-success',
      pago_atraso: 'badge badge-warning',
      pago_antecipado: 'badge badge-success'
    };
    const labels = {
      pago: 'Pago',
      pago_atraso: 'Pago c/ atraso',
      pago_antecipado: 'Pago antecipado'
    };
    return <span className={`${badges[status]} text-xs`}>{labels[status]}</span>;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-2">Informações Financeiras</h2>
        <p className="text-sm opacity-70">Gestão de crédito e histórico financeiro</p>
      </div>

      {/* KPIs Financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs opacity-70">Limite Total</p>
              <p className="text-lg font-semibold text-fg">{currency(kpis.limiteTotal)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs opacity-70">Limite Utilizado</p>
              <p className="text-lg font-semibold text-fg">{currency(kpis.limiteUtilizado)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs opacity-70">Faturamento Total</p>
              <p className="text-lg font-semibold text-fg">{currency(kpis.faturamentoTotal)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${
              kpis.inadimplencia > 0 ? 'bg-red-500/20 text-red-600' : 'bg-emerald-500/20 text-emerald-600'
            }`}>
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs opacity-70">Inadimplência</p>
              <p className="text-lg font-semibold text-fg">{kpis.inadimplencia.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo Financeiro em Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Limite de Crédito */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <CreditCard className="w-5 h-5 text-fg" />
            <h3 className="text-lg font-semibold text-fg">Limite de Crédito</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Limite Total</span>
              <span className="font-semibold">{currency(kpis.limiteTotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Utilizado</span>
              <span className="font-semibold text-amber-600">{currency(kpis.limiteUtilizado)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Disponível</span>
              <span className="font-semibold text-emerald-600">{currency(kpis.limiteDisponivel)}</span>
            </div>

            {/* Barra de Progresso */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs opacity-70">Utilização</span>
                <span className="text-xs font-medium">{kpis.percentualUtilizado.toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${
                    kpis.percentualUtilizado > 80
                      ? 'bg-red-500'
                      : kpis.percentualUtilizado > 60
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                  }`}
                  style={{ width: `${kpis.percentualUtilizado}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Condições Comerciais */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Receipt className="w-5 h-5 text-fg" />
            <h3 className="text-lg font-semibold text-fg">Performance de Pagamentos</h3>
          </div>

          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-emerald-600">{kpis.performancePagamento.toFixed(1)}%</p>
              <p className="text-sm opacity-70 mt-1">Pagamentos no prazo</p>
            </div>

            <div className="pt-3 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="opacity-70">Total de pagamentos:</span>
                <span className="font-medium">{historicoPagamentos.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Pagos no prazo:</span>
                <span className="font-medium text-emerald-600">
                  {historicoPagamentos.filter(p => p.status !== 'pago_atraso').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Pagos com atraso:</span>
                <span className="font-medium text-amber-600">
                  {historicoPagamentos.filter(p => p.status === 'pago_atraso').length}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Títulos em Aberto */}
      <section className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-fg" />
            <h3 className="text-lg font-semibold text-fg">Títulos em Aberto</h3>
          </div>
        </div>

        {titulosAbertos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium opacity-70">Documento</th>
                  <th className="text-left py-3 px-4 font-medium opacity-70">Vencimento</th>
                  <th className="text-right py-3 px-4 font-medium opacity-70">Valor</th>
                  <th className="text-center py-3 px-4 font-medium opacity-70">Dias Atraso</th>
                  <th className="text-center py-3 px-4 font-medium opacity-70">Status</th>
                </tr>
              </thead>
              <tbody>
                {titulosAbertos.map((titulo) => (
                  <tr key={titulo.id} className="border-b border-border/50 hover:bg-muted/20 transition">
                    <td className="py-3 px-4 font-medium">{titulo.documento}</td>
                    <td className="py-3 px-4">{formatDate(titulo.vencimento)}</td>
                    <td className="py-3 px-4 text-right font-medium">{currency(titulo.valor)}</td>
                    <td className="py-3 px-4 text-center">
                      {titulo.diasAtraso > 0 ? (
                        <span className="text-red-600 font-medium">{titulo.diasAtraso}</span>
                      ) : (
                        <span className="opacity-70">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(titulo.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 opacity-20 mx-auto mb-4" />
            <p className="text-sm opacity-70">Aguardando integração com backend</p>
            <p className="text-xs opacity-50 mt-1">Títulos em aberto serão exibidos aqui</p>
          </div>
        )}
      </section>

      {/* Histórico de Pagamentos */}
      <section className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
          <TrendingUp className="w-5 h-5 text-fg" />
          <h3 className="text-lg font-semibold text-fg">Histórico de Pagamentos</h3>
        </div>

        {historicoPagamentos.length > 0 ? (
          <div className="space-y-3">
            {historicoPagamentos.map((pagamento) => (
              <div
                key={pagamento.id}
                className="flex items-center justify-between py-3 px-4 rounded-xl border border-border hover:bg-muted/30 transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <div>
                      <p className="font-medium text-sm">{pagamento.documento} - {currency(pagamento.valor)}</p>
                      <p className="text-xs opacity-70">
                        Venc: {formatDate(pagamento.vencimento)} | Pago: {formatDate(pagamento.pagamento)}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  {getPaymentStatusBadge(pagamento.status)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <TrendingUp className="w-12 h-12 opacity-20 mx-auto mb-4" />
            <p className="text-sm opacity-70">Aguardando integração com backend</p>
            <p className="text-xs opacity-50 mt-1">Histórico de pagamentos será exibido aqui</p>
          </div>
        )}
      </section>
    </div>
  );
}
