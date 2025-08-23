import React, { useMemo, useState } from "react";
import type { Item, Fin } from "../../types";
import { perItemImpact, currency, pct, num } from "../../utils";
import { Info, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { kpisFromPrice } from "../../pricing";
function share(v: number, total: number) {
    return total > 0 ? `${((v / total) * 100).toFixed(1)}%` : "0%";
}

export default function StepRevisao({
    items, fin, isDark
}: { items: Item[]; fin: Fin; isDark: boolean }) {
    const { list, totals } = useMemo(() => perItemImpact(items, fin), [items, fin]);

    const card = `${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"} rounded-2xl border p-4`;
    const line = "flex items-center justify-between py-1.5";
    const sub = "text-xs opacity-70";

    // ----- Bases / impostos totais (conforme computeTotals) -----
    const baseProdutos = num((totals as any).base);               // após descontos
    const baseICMSProp = num((totals as any).baseICMSProp || (totals as any).baseICMS);
    const basePISCOF = num((totals as any).basePISCOF);
    const baseIPI = num((totals as any).baseIPI);
    const adicionais = num((totals as any).adicionais);

    const trib = {
        iss: num((totals as any).iss),
        icmsProprio: num((totals as any).icmsProprio),
        icmsST: num((totals as any).icmsST),
        fcp: num((totals as any).fcp),
        fcpST: num((totals as any).fcpST),
        ipi: num((totals as any).ipi),
        pis: num((totals as any).pis),
        cofins: num((totals as any).cofins),
        difal: num((totals as any).difal),
    };
    const totalImpostos = Object.values(trib).reduce((s, v) => s + v, 0);

    // quebra de DIFAL
    const difalDestino = num((totals as any).difalDestino);
    const difalOrigem = num((totals as any).difalOrigem);

    // ----- Consistência per-item x total (nota: DIFAL não é alocado por item) -----
    const somaImpostosItens = list.reduce(
        (s, it) => s + num(it.iss) + num(it.icms) + num(it.icmsST) + num(it.fcp) + num(it.fcpST) + num(it.ipi) + num(it.pis) + num(it.cofins),
        0
    );
    const diffTrib = Math.abs((somaImpostosItens + trib.difal) - totalImpostos);

    // ----- Tabela de impostos para exibir (ordena por valor desc) -----
    const impostosRows = [
        { key: "ICMS", val: trib.icmsProprio, aliq: num((fin as any).icmsAliq), baseLabel: "ICMS (c/ redução)", baseVal: baseICMSProp },
        { key: "ICMS-ST", val: trib.icmsST, aliq: num((fin as any).icmsStAliq), extra: num((fin as any).icmsStMva) ? `MVA ${pct(num((fin as any).icmsStMva))}` : "", baseLabel: "Base ST", baseVal: baseICMSProp * (1 + num((fin as any).icmsStMva) / 100) },
        { key: "FCP", val: trib.fcp, aliq: num((fin as any).fcpAliq), baseLabel: "ICMS (c/ redução)", baseVal: baseICMSProp },
        { key: "FCP-ST", val: trib.fcpST, aliq: num((fin as any).fcpStAliq), baseLabel: "Base ST", baseVal: baseICMSProp * (1 + num((fin as any).icmsStMva) / 100) },
        { key: "IPI", val: trib.ipi, aliq: num((fin as any).ipiAliq), baseLabel: "Base IPI", baseVal: baseIPI },
        { key: "PIS", val: trib.pis, aliq: num((fin as any).pisAliq), baseLabel: "Base PIS/COFINS", baseVal: basePISCOF },
        { key: "COFINS", val: trib.cofins, aliq: num((fin as any).cofinsAliq), baseLabel: "Base PIS/COFINS", baseVal: basePISCOF },
        { key: "ISS", val: trib.iss, aliq: num((fin as any).issAliq), baseLabel: "Base Serviços", baseVal: baseProdutos, badge: fin.municipioIncidencia || "" },
        {
            key: "DIFAL", val: trib.difal, aliq: Math.max(0, num((fin as any).difalAliqInterna) - num((fin as any).difalAliqInter)), baseLabel: "ICMS (c/ redução)", baseVal: baseICMSProp,
            extra: (num((fin as any).difalAliqInterna) || num((fin as any).difalAliqInter) || num((fin as any).difalPartilhaDestinoPct))
                ? `int ${pct(num((fin as any).difalAliqInterna || 0))} − inter ${pct(num((fin as any).difalAliqInter || 0))} • dest ${pct(num((fin as any).difalPartilhaDestinoPct || 0))}`
                : ""
        },
    ].filter(r => r.val > 0 || r.aliq > 0).sort((a, b) => b.val - a.val);

    // ----- UI toggles -----
    const [showTribPorItem, setShowTribPorItem] = useState(false);
    const precoVenda = num(fin.precoVenda);
    const KPIs = useMemo(() => kpisFromPrice(totals, precoVenda, {
        icmsAsCost: false, pisCofinsAsCost: false, ipiAsCost: false, issAsCost: false,
    }), [totals, precoVenda]);
    return (
        <section className="space-y-4">
            {/* RESUMO FINANCEIRO */}
            <div className={card}>
                <div className=" items-center justify-between mb-2">
                    <h4 className="font-semibold">Resumo Financeiro</h4>
                    <div className="pt-2 grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
                        <div><p className="opacity-70 text-xs">Preço de venda</p><p className="font-semibold">{currency(KPIs.receita)}</p></div>
                        <div><p className="opacity-70 text-xs">Custo considerado</p><p className="font-semibold">{currency(KPIs.custoConsiderado)}</p></div>
                        <div><p className="opacity-70 text-xs">Lucro bruto</p><p className="font-semibold">{currency(KPIs.lucroBruto)} <span className="text-xs opacity-60">· {pct(KPIs.margemBrutaPct)}</span></p></div>
                        <div><p className="opacity-70 text-xs">Impostos (estim.)</p><p className="font-semibold">{currency(KPIs.totalImpostos)}</p></div>
                        <div><p className="opacity-70 text-xs">Lucro pós-trib.</p><p className="font-semibold">{currency(KPIs.lucroPosTrib)} <span className="text-xs opacity-60">· {pct(KPIs.margemPosTribPct)}</span></p></div>
                        <div><p className="opacity-70 text-xs">Markup sobre custo</p><p className="font-semibold">{pct(KPIs.markupSobreCusto)}</p></div>

                        <div className="md:col-span-6 border-t pt-2">
                            <p className="text-xs opacity-70">Total (base + adicionais + impostos)</p>
                            <p className="text-2xl font-semibold">{currency(totals.total)}</p>
                        </div>
                    </div>
                </div>

                {/* Bases de cálculo + flags */}
                <div className={`mt-3 grid grid-cols-2 md:grid-cols-5 gap-2 text-sm ${isDark ? "text-neutral-200" : "text-neutral-800"}`}>
                    <div><p className="text-xs opacity-70">Base Produtos</p><p className="font-medium">{currency(baseProdutos)}</p></div>
                    <div><p className="text-xs opacity-70">ICMS (c/ redução)</p><p className="font-medium">{currency(baseICMSProp)}</p></div>
                    <div><p className="text-xs opacity-70">PIS/COFINS</p><p className="font-medium">{currency(basePISCOF)}</p></div>
                    <div><p className="text-xs opacity-70">IPI</p><p className="font-medium">{currency(baseIPI)}</p></div>
                    <div><p className="text-xs opacity-70">Adicionais</p><p className="font-medium">{currency(adicionais)}</p></div>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${isDark ? "border-neutral-700 text-neutral-300" : "border-neutral-300 text-neutral-700"}`}>
                        {fin.compoeBaseICMS ? "Adicionais compõem base ICMS" : "Adicionais fora da base ICMS"}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${isDark ? "border-neutral-700 text-neutral-300" : "border-neutral-300 text-neutral-700"}`}>
                        {fin.compoeBasePisCofins ? "Compõem base PIS/COFINS" : "Fora da base PIS/COFINS"}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${isDark ? "border-neutral-700 text-neutral-300" : "border-neutral-300 text-neutral-700"}`}>
                        {fin.compoeBaseIPI ? "Compõem base IPI" : "Fora da base IPI"}
                    </span>
                </div>

                {/* Aviso de consistência */}
                {diffTrib > 0.01 && (
                    <div className={`mt-3 flex items-start gap-2 text-xs ${isDark ? "text-yellow-300" : "text-yellow-700"}`}>
                        <AlertTriangle className="w-4 h-4 mt-0.5" />
                        <p>
                            Diferença entre total de impostos e soma por item detectada ({currency(diffTrib)}).
                            Isso é esperado quando <em>frete/seguro/outros</em> compõem bases e não foram rateados por item,
                            e/ou quando há <strong>DIFAL</strong> (não alocado por item).
                        </p>
                    </div>
                )}
            </div>

            {/* QUEBRA DE IMPOSTOS */}
            <div className={card}>
                <h4 className="font-semibold mb-2">Quebra de Impostos</h4>

                <div className="overflow-auto nice-scrollbar">
                    <table className="w-full text-sm min-w-[760px]">
                        <thead className={isDark ? "bg-neutral-900/80" : "bg-white/80"}>
                            <tr className={isDark ? "border-b border-neutral-800/60" : "border-b border-neutral-200"}>
                                <th className="text-left p-2">Imposto</th>
                                <th className="text-left p-2">Alíquota</th>
                                <th className="text-left p-2">Base usada</th>
                                <th className="text-right p-2">Valor</th>
                                <th className="text-right p-2">Participação</th>
                            </tr>
                        </thead>
                        <tbody className="">
                            {impostosRows.map((r) => (
                                <tr key={r.key} className={isDark ? "border-b border-neutral-800/40" : "border-b border-neutral-200"}>
                                    <td className="p-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{r.key}</span>
                                            {r.badge ? (
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${isDark ? "border-neutral-700 text-neutral-300" : "border-neutral-300 text-neutral-700"}`}>{r.badge}</span>
                                            ) : null}
                                            {r.extra ? (
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${isDark ? "border-blue-500/40 text-blue-300" : "border-blue-500/30 text-blue-700"}`}>{r.extra}</span>
                                            ) : null}
                                        </div>
                                    </td>
                                    <td className="p-2">{r.aliq ? pct(r.aliq) : "—"}</td>
                                    <td className="p-2">{r.baseVal ? `${r.baseLabel}: ${currency(r.baseVal)}` : "—"}</td>
                                    <td className="p-2 text-right font-medium">{currency(r.val)}</td>
                                    <td className="p-2 text-right">{share(r.val, totalImpostos)}</td>
                                </tr>
                            ))}
                            {/* sublinhas do DIFAL, se houver */}
                            {trib.difal > 0 && (difalDestino > 0 || difalOrigem > 0) && (
                                <>
                                    <tr className={isDark ? "border-b border-neutral-800/40" : "border-b border-neutral-200"}>
                                        <td className="p-2 pl-6 opacity-80">DIFAL — Destino</td>
                                        <td className="p-2">—</td>
                                        <td className="p-2">—</td>
                                        <td className="p-2 text-right">{currency(difalDestino)}</td>
                                        <td className="p-2 text-right">{share(difalDestino, totalImpostos)}</td>
                                    </tr>
                                    <tr className={isDark ? "border-b border-neutral-800/40" : "border-b border-neutral-200"}>
                                        <td className="p-2 pl-6 opacity-80">DIFAL — Origem</td>
                                        <td className="p-2">—</td>
                                        <td className="p-2">—</td>
                                        <td className="p-2 text-right">{currency(difalOrigem)}</td>
                                        <td className="p-2 text-right">{share(difalOrigem, totalImpostos)}</td>
                                    </tr>
                                </>
                            )}
                            {impostosRows.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center opacity-60">Sem impostos configurados para esta operação.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* IMPACTO POR ITEM */}
            <div className={card}>
                <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Impacto por Item</h4>
                    <button
                        onClick={() => setShowTribPorItem(v => !v)}
                        className={`inline-flex items-center gap-1 text-xs rounded-lg px-2 py-1 border transition ${isDark ? "border-neutral-700/50 text-neutral-300 hover:bg-neutral-800" : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                            }`}
                    >
                        {showTribPorItem ? <>Ocultar tributos <ChevronUp className="w-3.5 h-3.5" /></> : <>Ver tributos <ChevronDown className="w-3.5 h-3.5" /></>}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {list.length === 0 && <p className="text-sm opacity-70">Nenhum item adicionado</p>}

                    {list.map((it) => {
                        const impostosItem = num(it.iss) + num(it.icms) + num(it.icmsST) + num(it.fcp) + num(it.fcpST) + num(it.ipi) + num(it.pis) + num(it.cofins);
                        return (
                            <div key={it.id} className={`rounded-xl border p-3 text-sm ${isDark ? "border-neutral-800" : "border-neutral-200"}`}>
                                <div className="flex items-center justify-between">
                                    <p className="font-medium truncate">{it.nome || "Item"}</p>
                                    <span className="text-xs opacity-70">{(it.share * 100).toFixed(1)}%</span>
                                </div>

                                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex justify-between"><span className="opacity-70">Bruto</span><span>{currency(it.bruto)}</span></div>
                                    <div className="flex justify-between"><span className="opacity-70">Desc. alocado</span><span>- {currency(it.desconto)}</span></div>
                                    <div className="flex justify-between"><span className="opacity-70">Base</span><span>{currency(it.base)}</span></div>
                                    <div className="flex justify-between"><span className="opacity-70">Impostos</span><span>{currency(impostosItem)}</span></div>
                                </div>

                                {showTribPorItem && (
                                    <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                                        <div className="flex justify-between"><span className="opacity-70">ICMS</span><span>{currency(num(it.icms))}</span></div>
                                        <div className="flex justify-between"><span className="opacity-70">ICMS-ST</span><span>{currency(num(it.icmsST))}</span></div>
                                        <div className="flex justify-between"><span className="opacity-70">FCP</span><span>{currency(num(it.fcp))}</span></div>
                                        <div className="flex justify-between"><span className="opacity-70">FCP-ST</span><span>{currency(num(it.fcpST))}</span></div>
                                        <div className="flex justify-between"><span className="opacity-70">IPI</span><span>{currency(num(it.ipi))}</span></div>
                                        <div className="flex justify-between"><span className="opacity-70">PIS</span><span>{currency(num(it.pis))}</span></div>
                                        <div className="flex justify-between"><span className="opacity-70">COFINS</span><span>{currency(num(it.cofins))}</span></div>
                                        <div className="flex justify-between"><span className="opacity-70">ISS</span><span>{currency(num(it.iss))}</span></div>
                                    </div>
                                )}

                                <div className="flex justify-between font-medium mt-2">
                                    <span>Total item</span>
                                    <span>{currency(it.total)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
