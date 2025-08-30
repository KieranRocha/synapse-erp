import { useEffect, useMemo, useState } from "react";
import { Plus, FileDown, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useKpis } from "../../../shared/hooks";
import type { Budget, Filtros, SortKey } from "../../../shared/types";
import { filterBudgets, sortBudgets } from "../../../shared/utils";
import { KpiCards } from "../../../components/budgets/KpiCards";
import { FiltersBar } from "../../../components/budgets/FiltersBar";
import { BudgetsTable } from "../../../components/budgets/BudgetsTable";
import { useToastStore } from "../../../store/toastStore";

// OBS: Esta página NÃO rende Sidebar/Header — use o seu layout existente.
export default function OrcamentosPage() {

    const pushToast = useToastStore((s) => s.push);
    const navigate = useNavigate();

    const [searchTop] = useState("");
    const [rows, setRows] = useState<Budget[]>([]);
    const [filtros, setFiltros] = useState<Filtros>({ busca: "", status: "", inicio: "", fim: "", cliente: "", projeto: "", min: "" });
    const [sort, setSort] = useState<SortKey>("-emissao");


    const filtered = useMemo(() => {
        const f = filterBudgets(rows, { ...filtros, busca: filtros.busca || searchTop });
        return sortBudgets(f, sort);
    }, [rows, filtros, sort, searchTop]);


    const kpis = useKpis(filtered);

    // Load budgets from DB
    useEffect(() => {
        const mapStatus = (s: string) => {
            switch (String(s || '').toUpperCase()) {
                case 'APPROVED': return 'aprovado'
                case 'REJECTED': return 'reprovado'
                case 'ARCHIVED': return 'vencido'
                case 'SENT': return 'andamento'
                case 'DRAFT':
                default: return 'em análise'
            }
        }
        const addDays = (d: Date, days: number) => {
            const x = new Date(d)
            x.setDate(x.getDate() + days)
            return x.toISOString()
        }
        const toUi = (b: any): Budget => {
            const preco = Number(b.precoAprovado ?? b.precoSugerido ?? 0)
            const sumItems = Array.isArray(b.items) ? b.items.reduce((s: number, it: any) => s + Number(it.quantity || 0) * Number(it.unitPrice || 0), 0) : 0
            const valor = preco > 0 ? preco : sumItems
            const emissaoIso = b.created_at ? new Date(b.created_at).toISOString() : new Date().toISOString()
            const validadeIso = b.deliveryDate ? new Date(b.deliveryDate).toISOString() : addDays(new Date(emissaoIso), 15)
            const nomeCliente = b.client?.nome_fantasia || b.client?.razao_social || '—'
            const margem = typeof b.marginPct === 'number' ? Number(b.marginPct) : 0
            const slaDias = (b.startDate && b.deliveryDate) ? Math.max(0, Math.ceil((+new Date(b.deliveryDate) - +new Date(b.startDate)) / (1000 * 60 * 60 * 24))) : 0
            return {
                id: b.id,
                rev: 0,
                numero: String(b.id).padStart(5, '0'),
                cliente: nomeCliente,
                projeto: b.name,
                valor,
                status: mapStatus(b.status) as any,
                emissao: emissaoIso,
                validade: validadeIso,
                resp: b.responsavel || '',
                margem,
                slaDias,
                enviado: String(b.status || '').toUpperCase() !== 'DRAFT',
                respondeuEm: null,
            }
        }
            ; (async () => {
                try {
                    const list = await window.api.budgets.getAll()
                    setRows(list.map(toUi))
                } catch (e) {
                    console.error('Falha ao carregar orçamentos', e)
                }
            })()
    }, [])
    const onNew = () => navigate("/vendas/orcamentos/novo");
    const onExport = () => pushToast("Exportar (mock)");
    const onEmail = () => pushToast("Enviar e-mail (mock)");
    const onView = (r: Budget) => navigate(`/vendas/orcamentos/detalhe?num=${r.numero}`);



    return (
        <div className="bg-bg ">
            <main className="  max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                {/* Header local da página */}
                <div className="flex items-center justify-between mb-6">

                    <div className="flex items-center gap-2">
                        <button onClick={onNew} className="px-3 py-2 rounded-lg border border-neutral-700/40 bg-transparent text-sm hover:bg-neutral-100/5 transition"><Plus className="w-4 h-4 inline mr-1" /> Novo</button>
                        <button onClick={onExport} className="px-3 py-2 rounded-lg border border-neutral-700/40 bg-transparent text-sm hover:bg-neutral-100/5 transition"><FileDown className="w-4 h-4 inline mr-1" /> Exportar</button>
                        <button onClick={onEmail} className="px-3 py-2 rounded-lg border border-neutral-700/40 bg-transparent text-sm hover:bg-neutral-100/5 transition"><Mail className="w-4 h-4 inline mr-1" /> E-mail</button>
                    </div>
                </div>


                {/* KPIs */}
                <KpiCards kpis={kpis} />


                {/* Filtros */}
                <FiltersBar filtros={filtros} setFiltros={setFiltros} sort={sort} onSortChange={setSort} />


                {/* Tabela */}
                <BudgetsTable
                    rows={filtered}
                    onView={onView}
                    onEdit={() => navigate("/vendas/orcamentos/2/editar")}
                    onDuplicate={(r) => pushToast(`Duplicar ${r.numero} (mock)`)}
                    onPdf={(r) => pushToast(`Gerar PDF ${r.numero} (mock)`)}
                />


                <div className="text-xs opacity-70 mt-6">
                    *Mock — Integrações futuras: Estoque (disponibilidade), Compras (cotações X), E-mail (envio automático), PDF (modelo de proposta), Revisões & histórico completo.
                </div>
            </main>
        </div>
    );
}
