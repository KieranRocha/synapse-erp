import { useState } from "react";
import { Search, Filter, ChevronDown } from "lucide-react";
import type { Filtros, SortKey } from "../../shared/types";

/**
 * Agora sem isDark: usamos tokens semânticos do tema (bg-card, text-fg, border-border, bg-muted, etc.)
 * O data-theme no <html> controla light/dark e os tokens CSS ajustam as cores.
 */

type Props = {
    filtros: Filtros;
    setFiltros: React.Dispatch<React.SetStateAction<Filtros>>;
    onSortChange: (s: SortKey) => void;
    sort: SortKey;
};

export function FiltersBar({ filtros, setFiltros, onSortChange, sort }: Props) {
    const [open, setOpen] = useState(false);

    const STATUSES = ["em análise", "aprovado", "reprovado", "vencido"] as const;

    return (
        <div className="rounded-2xl border border-border bg-card/70 backdrop-blur p-3 md:p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                {/* Busca */}
                <div className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2 border border-input bg-muted/50 text-fg">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input
                        value={filtros.busca || ""}
                        onChange={(e) => setFiltros((s) => ({ ...s, busca: e.target.value }))}
                        placeholder="Buscar por nº, cliente ou projeto"
                        className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                    />
                </div>

                {/* Filtros principais */}
                <div className="flex items-center gap-2">
                    <select
                        value={filtros.status || ""}
                        onChange={(e) => setFiltros((s) => ({ ...s, status: e.target.value as any }))}
                        className="px-3 py-2 rounded-xl border border-input bg-card text-sm text-fg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                        className="px-3 py-2 rounded-xl border border-input bg-card text-sm text-fg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <input
                        type="date"
                        value={filtros.fim || ""}
                        onChange={(e) => setFiltros((s) => ({ ...s, fim: e.target.value }))}
                        className="px-3 py-2 rounded-xl border border-input bg-card text-sm text-fg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />

                    <button
                        onClick={() => setOpen((o) => !o)}
                        className="px-3 py-2 rounded-xl text-sm inline-flex items-center gap-2 border border-input bg-card text-fg hover:bg-muted/50 transition"
                        aria-expanded={open}
                        aria-controls="filtros-avancados"
                    >
                        <Filter className="w-4 h-4" />
                        Filtros
                        <ChevronDown
                            className={`w-4 h-4 transition ${open ? "rotate-180" : ""}`}
                        />
                    </button>
                </div>

                {/* Ordenação */}
                <div className="flex items-center gap-2 md:ml-auto">
                    <select
                        value={sort}
                        onChange={(e) => onSortChange(e.target.value as SortKey)}
                        className="px-3 py-2 rounded-xl border border-input bg-card text-sm text-fg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                <div
                    id="filtros-avancados"
                    className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3"
                >
                    <input
                        value={filtros.cliente || ""}
                        onChange={(e) => setFiltros((s) => ({ ...s, cliente: e.target.value }))}
                        placeholder="Cliente"
                        className="px-3 py-2 rounded-xl border border-input bg-card text-sm text-fg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <input
                        value={filtros.projeto || ""}
                        onChange={(e) => setFiltros((s) => ({ ...s, projeto: e.target.value }))}
                        placeholder="Projeto/Obra"
                        className="px-3 py-2 rounded-xl border border-input bg-card text-sm text-fg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <input
                        type="number"
                        value={(filtros.min as any) || ""}
                        onChange={(e) => setFiltros((s) => ({ ...s, min: e.target.value }))}
                        placeholder="Valor mínimo (R$)"
                        className="px-3 py-2 rounded-xl border border-input bg-card text-sm text-fg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
            )}
        </div>
    );
}