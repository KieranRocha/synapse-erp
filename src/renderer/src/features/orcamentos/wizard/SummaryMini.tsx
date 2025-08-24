import { useMemo, useState } from "react";
import type { Item, Fin } from "../types";
import { perItemImpact, currency, pct, num } from "../utils";

function shareOfTotal(v: number, total: number) {
    return total > 0 ? `${((v / total) * 100).toFixed(1)}%` : "0%";
}

export default function SummaryMini({
    items, fin, isDark,
}: { items: Item[]; fin: Fin; isDark: boolean }) {
    const { totals } = useMemo(() => perItemImpact(items, fin), [items, fin]);
    const [open, setOpen] = useState(false);
    const card = `${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"} rounded-2xl border p-4`;

    // Somatório de impostos contemplando todos os cálculos do computeTotals
    const totalImpostos = [
        "iss",
        "icmsProprio",
        "icmsST",
        "fcp",
        "fcpST",
        "ipi",
        "pis",
        "cofins",
        "difal",
    ].reduce((s, k) => s + num((totals as any)[k]), 0);

    const line = "flex items-center justify-between py-1.5";
    const sub = "text-xs opacity-70";
    const pill = `ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] border
    ${isDark ? "border-neutral-700 text-neutral-300" : "border-neutral-300 text-neutral-700"}`;

    return (
        <aside className="hidden lg:block lg:sticky lg:top-20 space-y-4">
            {/* SUMÁRIO */}
            <div className={card}>
                <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Resumo</h4>
                    <button
                        onClick={() => setOpen((v) => !v)}
                        className={`text-xs rounded-lg px-2 py-1 border transition ${isDark
                            ? "border-neutral-700/50 text-neutral-300 hover:bg-neutral-800"
                            : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                            }`}
                    >
                        {open ? "Ocultar" : "Detalhar"}
                    </button>
                </div>

                <div className="text-sm space-y-1 mt-2">
                    <div className={line}>
                        <span className="opacity-70">Subtotal</span>
                        <span>{currency(totals.subtotal)}</span>
                    </div>
                    <div className={line}>
                        <span className="opacity-70">Descontos</span>
                        <span>- {currency(totals.descontoTotal)}</span>
                    </div>
                    <div className={line}>
                        <span className="opacity-70">Impostos</span>
                        <span>{currency(totalImpostos)}</span>
                    </div>
                    <div className={line}>
                        <span className="opacity-70">Adicionais</span>
                        <span>{currency(totals.adicionais)}</span>
                    </div>
                    <div className="flex items-center justify-between font-semibold border-t pt-2 mt-2 border-neutral-700/30">
                        <span>Total</span>
                        <span>{currency(totals.total)}</span>
                    </div>
                </div>
            </div>

            {/* DETALHES (bases + impostos) */}
            {open && (
                <div className={card}>
                    {/* Bases de cálculo */}
                    <h5 className="font-medium mb-2">Bases de Cálculo</h5>
                    <div className="text-sm">
                        <div className={line}>
                            <span className="opacity-70">Base Produtos (após descontos)</span>
                            <span>{currency(num((totals as any).base))}</span>
                        </div>
                        <div className={`${line} ${isDark ? "text-neutral-200" : "text-neutral-800"}`}>
                            <span>
                                ICMS (com redução)
                                {num((fin as any).icmsRedBasePct) > 0 && (
                                    <span className={pill}>redução {pct(num((fin as any).icmsRedBasePct))}</span>
                                )}
                            </span>
                            <span>{currency(num((totals as any).baseICMSProp || (totals as any).baseICMS))}</span>
                        </div>
                        <div className={line}>
                            <span className="opacity-70">PIS/COFINS</span>
                            <span>{currency(num((totals as any).basePISCOF))}</span>
                        </div>
                        <div className={line}>
                            <span className="opacity-70">IPI</span>
                            <span>{currency(num((totals as any).baseIPI))}</span>
                        </div>
                        <div className={line}>
                            <span className="opacity-70">Adicionais (frete/seguro/outros)</span>
                            <span>{currency(num((totals as any).adicionais))}</span>
                        </div>

                        {/* Flags de composição de base */}
                        <div className="mt-2 flex flex-wrap gap-1">
                            <span className={pill}>
                                {fin.compoeBaseICMS ? "Adicionais compõem base ICMS" : "Adicionais fora da base ICMS"}
                            </span>
                            <span className={pill}>
                                {fin.compoeBasePisCofins ? "Compõem base PIS/COFINS" : "Fora da base PIS/COFINS"}
                            </span>
                            <span className={pill}>
                                {fin.compoeBaseIPI ? "Compõem base IPI" : "Fora da base IPI"}
                            </span>
                        </div>
                    </div>

                    {/* Impostos detalhados */}
                    <h5 className="font-medium mt-4 mb-2">Impostos</h5>
                    <div className="text-sm space-y-1">
                        {/* ISS (serviço) */}
                        {(num((totals as any).iss) > 0 || num((fin as any).issAliq) > 0) && (
                            <div className={line}>
                                <span>
                                    ISS {num((fin as any).issAliq) ? `(${pct(num((fin as any).issAliq))})` : ""}
                                    {fin.municipioIncidencia && <span className={pill}>{fin.municipioIncidencia}</span>}
                                </span>
                                <span>
                                    {currency(num((totals as any).iss))}{" "}
                                    <span className={sub}>· {shareOfTotal(num((totals as any).iss), totals.total)} do total</span>
                                </span>
                            </div>
                        )}

                        {/* ICMS próprio */}
                        {(num((totals as any).icmsProprio) > 0 || num((fin as any).icmsAliq) > 0) && (
                            <div className={line}>
                                <span>
                                    ICMS {num((fin as any).icmsAliq) ? `(${pct(num((fin as any).icmsAliq))})` : ""}
                                </span>
                                <span>
                                    {currency(num((totals as any).icmsProprio))}{" "}
                                    <span className={sub}>· {shareOfTotal(num((totals as any).icmsProprio), totals.total)} do total</span>
                                </span>
                            </div>
                        )}

                        {/* ICMS-ST */}
                        {(num((totals as any).icmsST) > 0 || num((fin as any).icmsStAliq) > 0 || num((fin as any).icmsStMva) > 0) && (
                            <div className={line}>
                                <span>
                                    ICMS-ST
                                    {num((fin as any).icmsStAliq) > 0 && ` (${pct(num((fin as any).icmsStAliq))})`}
                                    {num((fin as any).icmsStMva) > 0 && <span className={pill}>MVA {pct(num((fin as any).icmsStMva))}</span>}
                                </span>
                                <span>
                                    {currency(num((totals as any).icmsST))}{" "}
                                    <span className={sub}>· {shareOfTotal(num((totals as any).icmsST), totals.total)} do total</span>
                                </span>
                            </div>
                        )}

                        {/* FCP / FCP-ST */}
                        {(num((totals as any).fcp) > 0 || num((fin as any).fcpAliq) > 0) && (
                            <div className={line}>
                                <span>FCP {num((fin as any).fcpAliq) ? `(${pct(num((fin as any).fcpAliq))})` : ""}</span>
                                <span>
                                    {currency(num((totals as any).fcp))}{" "}
                                    <span className={sub}>· {shareOfTotal(num((totals as any).fcp), totals.total)} do total</span>
                                </span>
                            </div>
                        )}
                        {(num((totals as any).fcpST) > 0 || num((fin as any).fcpStAliq) > 0) && (
                            <div className={line}>
                                <span>FCP-ST {num((fin as any).fcpStAliq) ? `(${pct(num((fin as any).fcpStAliq))})` : ""}</span>
                                <span>
                                    {currency(num((totals as any).fcpST))}{" "}
                                    <span className={sub}>· {shareOfTotal(num((totals as any).fcpST), totals.total)} do total</span>
                                </span>
                            </div>
                        )}

                        {/* IPI */}
                        {(num((totals as any).ipi) > 0 || num((fin as any).ipiAliq) > 0) && (
                            <div className={line}>
                                <span>IPI {num((fin as any).ipiAliq) ? `(${pct(num((fin as any).ipiAliq))})` : ""}</span>
                                <span>
                                    {currency(num((totals as any).ipi))}{" "}
                                    <span className={sub}>· {shareOfTotal(num((totals as any).ipi), totals.total)} do total</span>
                                </span>
                            </div>
                        )}

                        {/* PIS / COFINS */}
                        {(num((totals as any).pis) > 0 || num((fin as any).pisAliq) > 0) && (
                            <div className={line}>
                                <span>PIS {num((fin as any).pisAliq) ? `(${pct(num((fin as any).pisAliq))})` : ""}</span>
                                <span>
                                    {currency(num((totals as any).pis))}{" "}
                                    <span className={sub}>· {shareOfTotal(num((totals as any).pis), totals.total)} do total</span>
                                </span>
                            </div>
                        )}
                        {(num((totals as any).cofins) > 0 || num((fin as any).cofinsAliq) > 0) && (
                            <div className={line}>
                                <span>COFINS {num((fin as any).cofinsAliq) ? `(${pct(num((fin as any).cofinsAliq))})` : ""}</span>
                                <span>
                                    {currency(num((totals as any).cofins))}{" "}
                                    <span className={sub}>· {shareOfTotal(num((totals as any).cofins), totals.total)} do total</span>
                                </span>
                            </div>
                        )}

                        {/* DIFAL (com partilha) */}
                        {(num((totals as any).difal) > 0 ||
                            num((fin as any).difalAliqInter) > 0 ||
                            num((fin as any).difalAliqInterna) > 0) && (
                                <div className={line}>
                                    <span>
                                        DIFAL{" "}
                                        {num((fin as any).difalAliqInterna) > 0 || num((fin as any).difalAliqInter) > 0
                                            ? `(int ${pct(num((fin as any).difalAliqInterna || 0))} − inter ${pct(
                                                num((fin as any).difalAliqInter || 0)
                                            )}${num((fin as any).difalPartilhaDestinoPct) ? `, dest ${pct(num((fin as any).difalPartilhaDestinoPct))}` : ""})`
                                            : ""}
                                    </span>
                                    <span>
                                        {currency(num((totals as any).difal))}{" "}
                                        <span className={sub}>· {shareOfTotal(num((totals as any).difal), totals.total)} do total</span>
                                    </span>
                                </div>
                            )}

                        {/* Quebra do DIFAL destino/origem (se existir) */}
                        {num((totals as any).difalDestino) > 0 || num((totals as any).difalOrigem) > 0 ? (
                            <div className="mt-1 space-y-1 pl-2 border-l border-dashed border-neutral-500/30">
                                <div className={line}>
                                    <span className="opacity-70">DIFAL — Destino</span>
                                    <span className="text-sm">{currency(num((totals as any).difalDestino))}</span>
                                </div>
                                <div className={line}>
                                    <span className="opacity-70">DIFAL — Origem</span>
                                    <span className="text-sm">{currency(num((totals as any).difalOrigem))}</span>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Rodapé de parâmetros (compacto) */}
                </div>
            )}
        </aside>
    );
}
