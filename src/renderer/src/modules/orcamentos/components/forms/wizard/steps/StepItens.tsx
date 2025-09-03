import React, { useEffect, useRef, useState } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import type { Item } from "../../../../utils/types";
import { CATEGORIES } from "../../../../utils/types";
import ItemRow from "../../../ui/ItemRow";
import ItemsDetails from "../../../ui/ItemsDetails";

export default function StepItens({ items, setItems }: { items: Item[]; setItems: React.Dispatch<React.SetStateAction<Item[]>> }) {
    const [tab, setTab] = useState<typeof CATEGORIES[number]["key"]>(CATEGORIES[0].key);

    const add = () => {
        const id = crypto.randomUUID();
        const categoriaLabel = CATEGORIES.find(c => c.key === tab)?.label || tab;
        const newItem: Item = { id, nome: "", un: "un", qtd: 1, preco: 0, categoria: categoriaLabel };

        // 👇 coloca o novo item no INÍCIO para que os antigos "fiquem embaixo"
        setItems((old) => [newItem, ...old]);
    }; const update = (id: string, next: Item) => setItems((old) => old.map((it) => (it.id === id ? next : it)));
    const remove = (id: string) => setItems((old) => old.filter((it) => it.id !== id));
    const subtotalBy = (key: string) => {
        const categoriaLabel = CATEGORIES.find(c => c.key === key)?.label || key;
        return items.filter((i) => i.categoria === categoriaLabel).reduce((s, i) => s + i.qtd * i.preco, 0);
    };

    // ===== Scroll helpers =====
    const scrollerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const updateArrows = () => {
        const el = scrollerRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };

    useEffect(() => {
        updateArrows();
        const el = scrollerRef.current;
        if (!el) return;
        el.addEventListener("scroll", updateArrows, { passive: true });
        const onResize = () => updateArrows();
        window.addEventListener("resize", onResize);
        return () => {
            el.removeEventListener("scroll", updateArrows);
            window.removeEventListener("resize", onResize);
        };
    }, []);

    const scrollByAmount = (dx: number) => scrollerRef.current?.scrollBy({ left: dx, behavior: "smooth" });

    return (
        <section className="bg-card border-border rounded-2xl border p-4">
            <h3 className="font-semibold mb-3">Itens do Orçamento</h3>
            {/* Tabs */}
            <div className="relative -mx-1 px-6">

                {/* scrollable rail */}
                <div ref={scrollerRef} className="flex gap-2 overflow-x-auto nice-scrollbar pr-4 pb-2 scroll-px-2 snap-x">
                    {CATEGORIES.map((c) => {
                        const active = tab === c.key;
                        return (
                            <button key={c.key} onClick={() => setTab(c.key)} className={`whitespace-nowrap snap-start border rounded-xl px-3 py-1.5 text-sm  ${active ? "badge-analise  " : "border-border text-fg hover:bg-muted"}`} title={c.label}>
                                {c.label} · {subtotalBy(c.key).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </button>
                        );
                    })}
                </div>

                {/* arrows */}
                <button onClick={() => scrollByAmount(-160)} aria-label="Rolar para a esquerda" className={`absolute -left-1 top-1/2 -translate-y-1/2 hidden sm:flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card/80 shadow-sm hover:bg-muted transition ${canScrollLeft ? '' : 'opacity-0 pointer-events-none'}`}>
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => scrollByAmount(160)} aria-label="Rolar para a direita" className={`absolute -right-1 top-1/2 -translate-y-1/2 hidden sm:flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card/80 shadow-sm hover:bg-muted transition ${canScrollRight ? '' : 'opacity-0 pointer-events-none'}`}>
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            <div className="mt-4 space-y-3">
                {items
                    .filter((i) => {
                        const categoriaLabel = CATEGORIES.find(c => c.key === tab)?.label || tab;
                        return i.categoria === categoriaLabel;
                    })
                    .map((i) => (
                        <ItemRow
                            key={i.id}
                            item={i}
                            onChange={(n) => update(i.id, n)}
                            onRemove={() => remove(i.id)}
                        />
                    ))}
            </div>


            <div className="mt-4 flex items-center gap-2">
                <button
                    onClick={add}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-fg text-sm transition hover:bg-muted"
                >
                    <Plus className="w-4 h-4" /> Adicionar item
                </button>

                <button
                    onClick={() => setShowDetails((v) => !v)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-fg text-sm transition hover:bg-muted"
                >
                    {showDetails ? "Ocultar detalhes" : `Ver detalhes (${items.length})`}
                </button>
            </div>

            {showDetails && (
                <div className="mt-4">
                    <ItemsDetails items={items} />
                </div>
            )}

        </section>
    );
}
