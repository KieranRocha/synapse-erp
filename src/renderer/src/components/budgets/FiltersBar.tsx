import { useState } from "react";
import { Search, Filter, ChevronDown } from "lucide-react";
import type { Filtros, SortKey } from "../../utils/budgetFilters";

type Props = {
    filtros: Filtros;
    setFiltros: React.Dispatch<React.SetStateAction<Filtros>>;
    onSortChange: (s: SortKey) => void;
    sort: SortKey;
    isDark: boolean; // 👈 novo
};

export function FiltersBar({ filtros, setFiltros, onSortChange, sort, isDark }: Props) {
    const [open, setOpen] = useState(false);

    const card = isDark
        ? "rounded-2xl border border-neutral-800 bg-neutral-950/60 backdrop-blur p-3 md:p-4 mb-6"
        : "rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur p-3 md:p-4 mb-6";

    const searchWrap = isDark
        ? "flex-1 flex items-center gap-2 rounded-xl px-3 py-2 border border-neutral-700 bg-neutral-900/60 text-neutral-100"
        : "flex-1 flex items-center gap-2 rounded-xl px-3 py-2 border border-neutral-200 bg-neutral-50 text-neutral-800";

    const input = isDark
        ? "px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900/60 text-sm text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        : "px-3 py-2 rounded-xl border border-neutral-200 bg-white/70 text-sm text-neutral-800 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30";

    const btnGhost = isDark
        ? "px-3 py-2 rounded-xl text-sm inline-flex items-center gap-2 border border-neutral-700 bg-neutral-900/60 text-neutral-100 hover:bg-neutral-800/60 transition"
        : "px-3 py-2 rounded-xl text-sm inline-flex items-center gap-2 border border-neutral-200 bg-white/70 text-neutral-800 hover:bg-neutral-50 transition";

    const STATUSES = ["em análise", "aprovado", "reprovado", "vencido"] as const;

    return (
        <div className={card}>
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                <div className={searchWrap}>
                    <Search className="w-4 h-4 opacity-60" />
                    <input
                        value={filtros.busca || ""}
                        onChange={(e) => setFiltros((s) => ({ ...s, busca: e.target.value }))}
                        placeholder="Buscar por nº, cliente ou projeto"
                        className="w-full bg-transparent outline-none text-sm placeholder-inherit"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={filtros.status || ""}
                        onChange={(e) => setFiltros((s) => ({ ...s, status: e.target.value as any }))}
                        className={input}
                    >
                        <option value="">Status (todos)</option>
                        {STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>

                    <input
                        type="date"
                        value={filtros.inicio || ""}
                        onChange={(e) => setFiltros((s) => ({ ...s, inicio: e.target.value }))}
                        className={input}
                    />
                    <input
                        type="date"
                        value={filtros.fim || ""}
                        onChange={(e) => setFiltros((s) => ({ ...s, fim: e.target.value }))}
                        className={input}
                    />

                    <button
                        onClick={() => setOpen((o) => !o)}
                        className={btnGhost}
                        aria-expanded={open}
                        aria-controls="filtros-avancados"
                    >
                        <Filter className="w-4 h-4" />
                        Filtros
                        <ChevronDown className={`w-4 h-4 transition ${open ? "rotate-180" : ""}`} />
                    </button>
                </div>

                <div className="flex items-center gap-2 md:ml-auto">
                    <select
                        value={sort}
                        onChange={(e) => onSortChange(e.target.value as SortKey)}
                        className={input}
                    >
                        <option value="-emissao">Ordenar por: Data (mais recente)</option>
                        <option value="emissao">Ordenar por: Data (mais antiga)</option>
                        <option value="valor">Ordenar por: Valor (crescente)</option>
                        <option value="-valor">Ordenar por: Valor (decrescente)</option>
                        <option value="status">Ordenar por: Status</option>
                    </select>
                </div>
            </div>

            {open && (
                <div id="filtros-avancados" className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                        value={filtros.cliente || ""}
                        onChange={(e) => setFiltros((s) => ({ ...s, cliente: e.target.value }))}
                        placeholder="Cliente"
                        className={input}
                    />
                    <input
                        value={filtros.projeto || ""}
                        onChange={(e) => setFiltros((s) => ({ ...s, projeto: e.target.value }))}
                        placeholder="Projeto/Obra"
                        className={input}
                    />
                    <input
                        type="number"
                        value={(filtros.min as any) || ""}
                        onChange={(e) => setFiltros((s) => ({ ...s, min: e.target.value }))}
                        placeholder="Valor mínimo (R$)"
                        className={input}
                    />
                </div>
            )}
        </div>
    );
}
