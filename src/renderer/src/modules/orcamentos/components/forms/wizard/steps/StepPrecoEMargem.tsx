import { useMemo, useState, useEffect } from "react";
import type { Item, Fin, Pricing as PricingType, PriceMethod } from "../../../../utils/types";
import { currency, num, perItemImpact } from "../../../../utils/utils";
import { buildConsideredCost, priceFromMarkup, priceFromMargin, PricingFlagsAsCost } from "../../../../utils/pricing";

export default function StepPrecoEMargem({
    items, fin, meta, setMeta,
}: {
    items: Item[]; fin: Fin;
    meta: { precoAprovado?: number; precoSugerido?: number;[key: string]: unknown };
    setMeta: (v: { precoAprovado?: number; precoSugerido?: number;[key: string]: unknown }) => void;
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

    // Mapeia Pricing para PricingFlagsAsCost
    const pricingFlags: PricingFlagsAsCost = {
        icmsAsCost: pricing.considerICMSasCost,
        pisCofinsAsCost: pricing.considerPISCOFINSasCost,
        ipiAsCost: pricing.considerIPIasCost,
        issAsCost: pricing.considerISSasCost,
    };

    const costConsiderado = buildConsideredCost(totals, pricingFlags);
    const precoSugerido = pricing.method === "MARKUP"
        ? priceFromMarkup(costConsiderado, pricing.markupPct)
        : priceFromMargin(costConsiderado, pricing.marginPct);

    // Atualiza apenas quando o precoSugerido mudar, evitando loop de render
    useEffect(() => {
        setMeta((prev: any) => {
            if (prev?.precoSugerido === precoSugerido) return prev;
            return { ...prev, precoSugerido };
        });
    }, [precoSugerido]);

    const card = "bg-card border-border rounded-2xl border p-4";
    const input = "px-3 py-2 rounded-xl border border-border bg-input text-fg text-sm outline-none transition focus:ring-2 focus:ring-ring/40";

    return (
        <section className={card}>
            <h3 className="font-semibold mb-3">Preço & Margem</h3>

            <div className="flex flex-col md:flex-row gap-3">
                <div className="space-y-1">
                    <label className="text-xs opacity-70">Método</label>
                    <select
                        className={input}
                        value={pricing.method}
                        onChange={(e) => setPricing({ ...pricing, method: e.target.value as PriceMethod })}
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
                            checked={pricing[k as keyof PricingType] as boolean}
                            onChange={(e) => setPricing({ ...pricing, [k]: e.target.checked })}
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
