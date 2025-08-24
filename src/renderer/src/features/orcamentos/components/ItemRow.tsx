import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import type { Item } from "../types";
import { currency } from "../utils";


//!todo arrumar TAB, zerando itens, e modificar quantidade modifica valor sem precisar sair do campo
function toDecimalStringBR(v: number) {
    // "R$ 1.234,56" (com símbolo)
    return isFinite(v) ? `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "";
}

function toQuantityStringBR(v: number) {
    // "1.234,56" (sem símbolo, para quantidade)
    return isFinite(v) ? v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";
}
function parsePtNumber(str: string): number {
    // aceita “1.234,56” ou “1234.56”
    const s = (str || "").trim().replace(/\./g, "").replace(",", ".");
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
}

export default function ItemRow({
    item, onChange, onRemove, isDark,
}: { item: Item; onChange: (item: Item) => void; onRemove: () => void; isDark: boolean }) {
    const cell = `px-3 py-2 rounded-lg border text-sm outline-none transition ${isDark ? "border-neutral-800 bg-neutral-900 focus:ring-2 focus:ring-blue-600/40"
        : "border-neutral-300 bg-white focus:ring-2 focus:ring-blue-500/30"
        }`;

    // displays locais para UX suave (edita "cru" no foco, formata ao blur)
    const [qtdInput, setQtdInput] = useState<string>(toQuantityStringBR(item.qtd));
    const [precoInput, setPrecoInput] = useState<string>(toDecimalStringBR(item.preco));

    // sincroniza se o item vier atualizado de fora
    useEffect(() => { setQtdInput(toQuantityStringBR(item.qtd)); }, [item.qtd]);
    useEffect(() => { setPrecoInput(toDecimalStringBR(item.preco)); }, [item.preco]);

    const subtotal = useMemo(() => currency(item.qtd * item.preco), [item.qtd, item.preco]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
            {/* Descrição */}
            <input
                className={`sm:col-span-4 ${cell}`}
                placeholder="Descrição / Modelo (ex.: Motor trifásico 5cv)"
                value={item.nome}
                onChange={(e) => onChange({ ...item, nome: e.target.value })}
                aria-label="Descrição do item"
            />

            {/* Unidade */}
            <input
                className={`sm:col-span-2 ${cell}`}
                placeholder="Un. (ex.: un, kg, m)"
                value={item.un}
                onChange={(e) => onChange({ ...item, un: e.target.value })}
                aria-label="Unidade"
            />

            {/* Quantidade (formatação pt-BR ao sair) */}
            <input
                type="text"
                inputMode="decimal"
                className={`sm:col-span-2 ${cell} text-right`}
                placeholder="Qtd (ex.: 1,00)"
                value={qtdInput}
                onChange={(e) => setQtdInput(e.target.value)}
                onBlur={() => {
                    const n = parsePtNumber(qtdInput);
                    onChange({ ...item, qtd: n });
                    setQtdInput(toQuantityStringBR(n));
                }}
                onFocus={(e) => {
                    // tira máscara para edição fácil
                    const n = parsePtNumber(e.currentTarget.value);
                    e.currentTarget.select();
                    setQtdInput(n ? String(n).replace(".", ",") : "");
                }}
                aria-label="Quantidade"
            />

            {/* Preço unitário (BRL ao sair) */}
            <input
                type="text"
                inputMode="decimal"
                className={`sm:col-span-2 ${cell} text-right`}
                placeholder="R$ 0,00"
                value={precoInput}
                onChange={(e) => setPrecoInput(e.target.value)}
                onBlur={() => {
                    const n = parsePtNumber(precoInput);
                    onChange({ ...item, preco: n });
                    setPrecoInput(toDecimalStringBR(n)); // mostra R$ 1.234,56 (com R$ no campo)
                }}
                onFocus={(e) => {
                    const n = parsePtNumber(e.currentTarget.value);
                    e.currentTarget.select();
                    setPrecoInput(n ? String(n).replace(".", ",") : "");
                }}
                aria-label="Preço unitário"
            />

            {/* Subtotal (somente leitura, formatado com R$) */}
            <div className="sm:col-span-1 text-right text-sm font-medium" aria-label="Subtotal do item">
                {subtotal}
            </div>

            {/* Remover */}
            <div className="sm:col-span-1 flex sm:justify-end">
                <button
                    onClick={onRemove}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${isDark ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                        : "border-red-300 text-red-600 hover:bg-red-50"
                        }`}
                    aria-label="Remover item"
                    title="Remover item"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
