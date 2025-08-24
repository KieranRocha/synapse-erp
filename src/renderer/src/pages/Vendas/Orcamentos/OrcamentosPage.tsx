import { useMemo, useState } from "react";
import { Plus, FileDown, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUIStore } from "../../../store/uiStore";
import { MOCK_BUDGETS } from "../../../data/mockBudgets";
import { useKpis } from "../../../hooks/useKpis";
import { filterBudgets, sortBudgets, type Filtros, type SortKey, type Budget } from "../../../utils/budgetFilters";
import { KpiCards } from "../../../components/budgets/KpiCards";
import { FiltersBar } from "../../../components/budgets/FiltersBar";
import { BudgetsTable } from "../../../components/budgets/BudgetsTable";
import { useToastStore } from "../../../store/toastStore";

// OBS: Esta página NÃO rende Sidebar/Header — use o seu layout existente.
export default function OrcamentosPage() {
    const { isDark } = useUIStore();
    const pushToast = useToastStore((s) => s.push);
    const navigate = useNavigate();

    const [searchTop] = useState("");
    const [filtros, setFiltros] = useState<Filtros>({ busca: "", status: "", inicio: "", fim: "", cliente: "", projeto: "", min: "" });
    const [sort, setSort] = useState<SortKey>("-emissao");


    const filtered = useMemo(() => {
        const f = filterBudgets(MOCK_BUDGETS, { ...filtros, busca: filtros.busca || searchTop });
        return sortBudgets(f, sort);
    }, [filtros, sort, searchTop]);


    const kpis = useKpis(filtered);
    const onNew = () => navigate("/vendas/orcamentos/novo");
    const onExport = () => pushToast("Exportar (mock)");
    const onEmail = () => pushToast("Enviar e-mail (mock)");
    const onView = (r: Budget) => navigate(`/vendas/orcamentos/detalhe?num=${r.numero}`);



    return (
        <div className={isDark ? "bg-dark-bg text-neutral-100" : "bg-neutral-50 text-neutral-900"}>
            <main className="  max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                {/* Header local da página */}
                <div className="flex items-center justify-between mb-6">

                    <div className="flex items-center gap-2">
                        <button onClick={onNew} className="px-3 py-2 rounded-xl border border-neutral-700/40 bg-transparent text-sm hover:bg-neutral-100/5 transition"><Plus className="w-4 h-4 inline mr-1" /> Novo</button>
                        <button onClick={onExport} className="px-3 py-2 rounded-xl border border-neutral-700/40 bg-transparent text-sm hover:bg-neutral-100/5 transition"><FileDown className="w-4 h-4 inline mr-1" /> Exportar</button>
                        <button onClick={onEmail} className="px-3 py-2 rounded-xl border border-neutral-700/40 bg-transparent text-sm hover:bg-neutral-100/5 transition"><Mail className="w-4 h-4 inline mr-1" /> E-mail</button>
                    </div>
                </div>


                {/* KPIs */}
                <KpiCards kpis={kpis} />


                {/* Filtros */}
                <FiltersBar filtros={filtros} setFiltros={setFiltros} sort={sort} onSortChange={setSort} isDark={isDark} />


                {/* Tabela */}
                <BudgetsTable
                    rows={filtered}
                    onView={onView}
                    onEdit={(r) => pushToast(`Editar ${r.numero} (mock)`)}
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