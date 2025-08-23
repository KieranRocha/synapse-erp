import React, { useEffect, useRef, useState } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import type { Item } from "../../types";
import { CATEGORIES } from "../../types";
import ItemRow from "../../components/ItemRow";
import ItemsDetails from "../../components/ItemsDetails";

export default function StepItens({ items, setItems, isDark }: { items: Item[]; setItems: React.Dispatch<React.SetStateAction<Item[]>>; isDark: boolean }) {
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
        <section className={`${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"} rounded-2xl border p-4`}>
            <h3 className="font-semibold mb-3">Itens do Orçamento</h3>
            {/* Tabs */}
            <div className="relative -mx-1 px-6">

                {/* scrollable rail */}
                <div ref={scrollerRef} className="flex gap-2 overflow-x-auto nice-scrollbar pr-4 pb-2 scroll-px-2 snap-x">
                    {CATEGORIES.map((c) => {
                        const active = tab === c.key;
                        return (
                            <button key={c.key} onClick={() => setTab(c.key)} className={`whitespace-nowrap snap-start rounded-xl px-3 py-1.5 text-sm border  ${active ? (isDark ? "border-blue-500/60 bg-blue-500/10 text-blue-300" : "border-blue-500/40 bg-blue-50 text-blue-700") : isDark ? "border-neutral-700/50 text-neutral-300 hover:bg-neutral-800" : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"}`} title={c.label}>
                                {c.label} · {subtotalBy(c.key).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </button>
                        );
                    })}
                </div>

                {/* arrows */}
                <button onClick={() => scrollByAmount(-160)} aria-label="Rolar para a esquerda" className={`absolute -left-1 top-1/2 -translate-y-1/2 hidden sm:flex h-7 w-7 items-center justify-center rounded-full border shadow-sm  ${canScrollLeft ? '' : 'opacity-0 pointer-events-none'} ${isDark ? 'bg-neutral-900/80 border-neutral-700 hover:bg-neutral-800' : 'bg-white/80 border-neutral-300 hover:bg-neutral-100'}`}>
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => scrollByAmount(160)} aria-label="Rolar para a direita" className={`absolute -right-1 top-1/2 -translate-y-1/2 hidden sm:flex h-7 w-7 items-center justify-center rounded-full border shadow-sm  ${canScrollRight ? '' : 'opacity-0 pointer-events-none'} ${isDark ? 'bg-neutral-900/80 border-neutral-700 hover:bg-neutral-800' : 'bg-white/80 border-neutral-300 hover:bg-neutral-100'}`}>
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
                            isDark={isDark}
                        />
                    ))}
            </div>


            <div className="mt-4 flex items-center gap-2">
                <button
                    onClick={add}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition ${isDark ? "border-neutral-700/50 text-neutral-200 hover:bg-neutral-800"
                        : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                        }`}
                >
                    <Plus className="w-4 h-4" /> Adicionar item
                </button>

                <button
                    onClick={() => setShowDetails((v) => !v)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition ${isDark ? "border-neutral-700/50 text-neutral-200 hover:bg-neutral-800"
                        : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                        }`}
                >
                    {showDetails ? "Ocultar detalhes" : `Ver detalhes (${items.length})`}
                </button>
            </div>

            {showDetails && (
                <div className="mt-4">
                    <ItemsDetails items={items} isDark={isDark} />
                </div>
            )}

        </section>
    );
}
