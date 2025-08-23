import React, { useMemo, useState, useEffect } from "react";
import type { Item, Fin, Pricing as PricingType } from "../../types";
import { currency, num, perItemImpact } from "../../utils";
import { buildConsideredCost, priceFromMarkup, priceFromMargin } from "../../pricing";

export default function StepPrecoEMargem({
    items, fin, isDark, meta, setMeta,
}: {
    items: Item[]; fin: Fin; isDark: boolean;
    meta: any; setMeta: (v: any) => void;
}) {
    const { totals } = useMemo(() => perItemImpact(items, fin), [items, fin]);

    const [pricing, setPricing] = useState<PricingType>({
        method: "MARGIN",
        markupPct: 20,
        marginPct: 25,
        considerICMSasCost: false,
        considerPISCOFINSasCost: false,
        considerIPIasCost: false,
        considerISSasCost: false,
    });

    const costConsiderado = buildConsideredCost(totals, pricing);
    const precoSugerido = pricing.method === "MARKUP"
        ? priceFromMarkup(costConsiderado, pricing.markupPct)
        : priceFromMargin(costConsiderado, pricing.marginPct);

    // salva direto no meta (aproveita seu store/submit)
    useEffect(() => {
        const precoEfetivo = meta.precoAprovado ?? precoSugerido;
        setMeta({ ...meta, precoSugerido });     // mantém
        // 👇 injeta no Fin para os resumos/compute usarem
        setFin((f: any) => ({ ...f, precoVenda: precoEfetivo }));
    }, [meta.precoAprovado, precoSugerido]);

    const card = `${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"} rounded-2xl border p-4`;
    const input = `px-3 py-2 rounded-xl border text-sm outline-none ${isDark ? "border-neutral-800 bg-neutral-900" : "border-neutral-300 bg-white"}`;

    return (
        <section className={card}>
            <h3 className="font-semibold mb-3">Preço & Margem</h3>

            <div className="flex flex-col md:flex-row gap-3">
                <div className="space-y-1">
                    <label className="text-xs opacity-70">Método</label>
                    <select
                        className={input}
                        value={pricing.method}
                        onChange={(e) => setPricing({ ...pricing, method: e.target.value as any })}
                    >
                        <option value="MARGIN">Margem sobre preço</option>
                        <option value="MARKUP">Markup sobre custo</option>
                    </select>
                </div>

                {pricing.method === "MARKUP" ? (
                    <div className="space-y-1">
                        <label className="text-xs opacity-70">Markup (%)</label>
                        <input type="number" step="0.01" className={input}
                            value={pricing.markupPct}
                            onChange={(e) => setPricing({ ...pricing, markupPct: num(e.target.value) })} />
                    </div>
                ) : (
                    <div className="space-y-1">
                        <label className="text-xs opacity-70">Margem alvo (%)</label>
                        <input type="number" step="0.01" className={input}
                            value={pricing.marginPct}
                            onChange={(e) => setPricing({ ...pricing, marginPct: num(e.target.value) })} />
                    </div>
                )}
            </div>

            <div className="mt-3 flex flex-wrap gap-3 text-sm">
                {[
                    ["considerICMSasCost", "Considerar ICMS/ST/FCP como custo"],
                    ["considerPISCOFINSasCost", "Considerar PIS/COFINS como custo"],
                    ["considerIPIasCost", "Considerar IPI como custo"],
                    ["considerISSasCost", "Considerar ISS como custo"],
                ].map(([k, label]) => (
                    <label key={k} className="inline-flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={(pricing as any)[k]}
                            onChange={(e) => setPricing({ ...pricing, [k]: e.target.checked } as any)}
                        />
                        {label}
                    </label>
                ))}
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div>
                    <p className="text-xs opacity-70">Custo considerado</p>
                    <p className="font-semibold">{currency(costConsiderado)}</p>
                </div>
                <div>
                    <p className="text-xs opacity-70">Preço sugerido</p>
                    <p className="font-semibold">{currency(precoSugerido)}</p>
                </div>
                <div>
                    <p className="text-xs opacity-70">Preço aprovado</p>
                    <input
                        type="number" step="0.01" className={input}
                        placeholder="Defina o preço final"
                        value={meta.precoAprovado ?? ""}
                        onChange={(e) => setMeta({ ...meta, precoAprovado: num(e.target.value) })}
                    />
                </div>
            </div>
        </section>
    );
}
