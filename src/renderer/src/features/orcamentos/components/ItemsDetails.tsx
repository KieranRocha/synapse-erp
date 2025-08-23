import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Item } from "../types";
import { currency } from "../utils";

type CatGroup = { cat: string; total: number; rows: Item[] };

export default function ItemsDetails({
    items, isDark,
}: { items: Item[]; isDark: boolean }) {
    const totalGeral = useMemo(
        () => items.reduce((s, i) => s + i.qtd * i.preco, 0),
        [items]
    );

    const grupos = useMemo<CatGroup[]>(() => {
        const map = new Map<string, CatGroup>();
        for (const it of items) {
            const key = it.categoria || "—";
            const curr = map.get(key) || { cat: key, total: 0, rows: [] };
            curr.total += it.qtd * it.preco;
            curr.rows.push(it);
            map.set(key, curr);
        }
        // ordena por total desc; dentro do grupo, mantém ordem de inserção
        return Array.from(map.values()).sort((a, b) => b.total - a.total);
    }, [items]);

    const [open, setOpen] = useState<Set<string>>(
        () => new Set(grupos.map(g => g.cat)) // inicia tudo aberto
    );
    const toggle = (cat: string) => {
        setOpen(prev => {
            const next = new Set(prev);
            next.has(cat) ? next.delete(cat) : next.add(cat);
            return next;
        });
    };

    const wrap = `${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"} rounded-2xl border`;
    const zebra = isDark ? "odd:bg-neutral-900 even:bg-neutral-900/60" : "odd:bg-white even:bg-neutral-50";
    const borderRow = isDark ? "border-neutral-800/70" : "border-neutral-200";

    return (
        <section className={`${wrap} p-4`}>
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Detalhes dos Itens</h4>
                <div className="text-sm opacity-70">
                    Total geral: <span className="font-semibold">{currency(totalGeral)}</span>
                </div>
            </div>

            <div className={`relative max-h-[56vh] overflow-auto nice-scrollbar rounded-xl  w-full
                      ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
                <table className="w-full text-sm table-fixed my-2 ">
                    {/* Larguras relativas para evitar "pular" */}
                    <colgroup>
                        <col style={{ width: "30%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "15%" }} />
                        <col style={{ width: "20%" }} />
                        <col style={{ width: "25%" }} />
                    </colgroup>

                    <tbody className="">
                        {grupos.map(({ cat, total, rows }) => {
                            const isOpen = open.has(cat);
                            const share = totalGeral > 0 ? (total / totalGeral) * 100 : 0;

                            return (
                                <React.Fragment key={cat}>
                                    {/* Linha de grupo (categoria) */}
                                    <tr
                                        className={`${isDark ? "bg-neutral-800/40" : "bg-neutral-50"} ${isDark ? "text-neutral-100" : "text-neutral-800"}`}
                                    >
                                        <td colSpan={5} className="p-0">
                                            <button
                                                onClick={() => toggle(cat)}
                                                className={`w-full flex items-center gap-2 px-3 py-2 text-left border-b ${borderRow}
                                    hover:opacity-100 transition`}
                                            >
                                                <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full
                                         ${isDark ? "bg-neutral-900 border border-neutral-700" : "bg-white border border-neutral-300"}`}>
                                                    {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                </span>
                                                <span className="font-medium">{cat}</span>
                                                <span className="ml-2 text-xs opacity-70">
                                                    ({rows.length} item{rows.length > 1 ? "s" : ""})
                                                </span>
                                                <span className="ml-3 text-[11px] px-2 py-0.5 rounded-full
                                          text-blue-600 dark:text-blue-300 border border-blue-500/20">
                                                    {share.toFixed(1)}%
                                                </span>
                                                <span className="ml-auto font-semibold">{currency(total)}</span>
                                            </button>
                                        </td>
                                    </tr>

                                    {/* Cabeçalho da tabela para cada grupo */}
                                    {isOpen && (
                                        <tr className={`${isDark ? "bg-neutral-800/20" : "bg-neutral-100"} ${isDark ? "text-neutral-300" : "text-neutral-600"} text-xs font-medium border-b ${borderRow}`}>
                                            <th className="text-left p-2 font-medium">Descrição</th>
                                            <th className="text-center p-2 font-medium">Un.</th>
                                            <th className="text-right p-2 font-medium">Qtd</th>
                                            <th className="text-right p-2 font-medium">Preço (R$)</th>
                                            <th className="text-right p-2 font-medium">Subtotal</th>
                                        </tr>
                                    )}

                                    {/* Linhas dos itens do grupo */}
                                    {isOpen &&
                                        rows.map((it, idx) => (
                                            <tr
                                                key={it.id}
                                                className={`${zebra} ${isDark ? "hover:bg-neutral-800/70" : "hover:bg-neutral-100"}
                                   ${idx === rows.length - 1 ? `border-b ${borderRow}` : ""}`}
                                            >
                                                <td className="p-2">{it.nome || "—"}</td>
                                                <td className="p-2 text-center">{it.un || "—"}</td>
                                                <td className="p-2 text-right">{it.qtd.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                                                <td className="p-2 text-right">{currency(it.preco)}</td>
                                                <td className="p-2 text-right font-medium">{currency(it.qtd * it.preco)}</td>
                                            </tr>
                                        ))}
                                </React.Fragment>
                            );
                        })}

                        {items.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-6 text-center opacity-60">
                                    Nenhum item adicionado.
                                </td>
                            </tr>
                        )}
                    </tbody>


                </table>
            </div>
        </section>
    );
}
