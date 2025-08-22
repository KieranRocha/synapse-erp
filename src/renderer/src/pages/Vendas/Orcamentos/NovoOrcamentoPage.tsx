import React, { useMemo, useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle2, Save } from "lucide-react";
import { useUIStore } from "../../../store/uiStore";
import { useToastStore } from "../../../store/toastStore";

/********************
 * HELPERS
 ********************/
const currency = (v: number = 0) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const pct = (v: number = 0) => `${v.toFixed(2)}%`;
const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/********************
 * TOAST VIEWPORT (Zustand)
 ********************/
function ToastViewport() {
  const { toasts, remove } = useToastStore();
  useEffect(() => {
    const timers = toasts.map((t) => setTimeout(() => remove(t.id), 2200));
    return () => timers.forEach(clearTimeout);
  }, [toasts, remove]);
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-2 rounded-xl border border-neutral-700/40 bg-neutral-900/90 text-neutral-50 px-3 py-2 shadow-lg backdrop-blur"
        >
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span className="text-sm">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

/********************
 * CATEGORIAS & ITENS
 ********************/
const CATEGORIES = [
  { key: "maquinas", label: "Máquinas & Equipamentos" },
  { key: "materiais", label: "Materiais / Matéria-prima" },
  { key: "consumiveis", label: "Consumíveis" },
  { key: "insumos", label: "Insumos" },
  { key: "servicos", label: "Serviços" },
  { key: "maoObra", label: "Mão de Obra" },
  { key: "ferramentas", label: "Ferramentas & Acessórios" },
];

interface Item {
  id: string;
  nome: string;
  un: string;
  qtd: number;
  preco: number;
  categoria: string;
}

interface Fin {
  descontoPct: number;
  descontoValor: number;
  frete: number;
  outrosCustos: number;
  issPct: number;
  icmsPct: number;
  pisPct: number;
  cofinsPct: number;
}

function ItemRow({ item, onChange, onRemove, isDark }: { item: Item; onChange: (item: Item) => void; onRemove: () => void; isDark: boolean }) {
  const cell = `px-2 py-2 rounded-lg border ${isDark ? "border-neutral-800 bg-neutral-900" : "border-neutral-300 bg-white"}`;
  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <input className={`col-span-4 ${cell}`} placeholder="Descrição / Modelo" value={item.nome} onChange={(e) => onChange({ ...item, nome: e.target.value })} />
      <input className={`col-span-2 ${cell}`} placeholder="Unidade" value={item.un} onChange={(e) => onChange({ ...item, un: e.target.value })} />
      <input type="number" className={`col-span-2 ${cell}`} placeholder="Qtd" value={item.qtd} onChange={(e) => onChange({ ...item, qtd: num(e.target.value) })} />
      <input type="number" className={`col-span-2 ${cell}`} placeholder="Preço" value={item.preco} onChange={(e) => onChange({ ...item, preco: num(e.target.value) })} />
      <div className="col-span-1 text-right text-sm">{currency(item.qtd * item.preco)}</div>
      <button onClick={onRemove} className="col-span-1 justify-self-end p-2 rounded-lg border border-red-400/30 text-red-400 hover:bg-red-500/10">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function CategoryCard({ catKey, label, items, setItems, isDark }: { catKey: string; label: string; items: Item[]; setItems: React.Dispatch<React.SetStateAction<Item[]>>; isDark: boolean }) {
  const add = () => setItems((old) => [...old, { id: crypto.randomUUID(), nome: "", un: "un", qtd: 1, preco: 0, categoria: catKey }]);
  const update = (id: string, next: Item) => setItems((old) => old.map((it) => (it.id === id ? next : it)));
  const remove = (id: string) => setItems((old) => old.filter((it) => it.id !== id));
  const total = items.filter((i) => i.categoria === catKey).reduce((s, i) => s + i.qtd * i.preco, 0);

  const cardCls = `${isDark ? "bg-neutral-900 border-neutral-800" : "bg-neutral-50 border-neutral-200"} rounded-2xl border p-4`;
  return (
    <div className={cardCls}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm opacity-70">Categoria</p>
          <h3 className="font-semibold">{label}</h3>
        </div>
        <div className="text-right">
          <p className="text-xs opacity-70">Subtotal</p>
          <p className="font-semibold">{currency(total)}</p>
        </div>
      </div>
      <div className="space-y-2">
        {items.filter((i) => i.categoria === catKey).map((i) => (
          <ItemRow key={i.id} item={i} onChange={(n) => update(i.id, n)} onRemove={() => remove(i.id)} isDark={isDark} />
        ))}
      </div>
      <button onClick={add} className="mt-3 px-3 py-2 rounded-xl border border-neutral-700/40 bg-transparent text-sm hover:bg-neutral-100/5 transition">
        <Plus className="w-4 h-4 inline mr-1" /> Adicionar item
      </button>
    </div>
  );
}

/********************
 * CÁLCULO FINANCEIRO (PURO, TESTÁVEL)
 ********************/
function computeTotals({ items, descontoPct, descontoValor, frete, outrosCustos, issPct, icmsPct, pisPct, cofinsPct }: { items: Item[] } & Fin) {
  const subtotal = items.reduce((s, i) => s + num(i.qtd) * num(i.preco), 0);
  const desconto1 = subtotal * (num(descontoPct) / 100);
  const desconto2 = num(descontoValor);
  const descontoTotal = Math.min(subtotal, desconto1 + desconto2);
  const base = Math.max(0, subtotal - descontoTotal);
  const iss = base * (num(issPct) / 100);
  const icms = base * (num(icmsPct) / 100);
  const pis = base * (num(pisPct) / 100);
  const cofins = base * (num(cofinsPct) / 100);
  const adicionais = num(frete) + num(outrosCustos);
  const total = base + iss + icms + pis + cofins + adicionais;
  return { subtotal, desconto1, desconto2, descontoTotal, base, iss, icms, pis, cofins, adicionais, total };
}

// Quebra de impacto por item (proporcional ao subtotal)
function perItemImpact(items: Item[], fin: Fin) {
  const t = computeTotals({ items, ...fin });
  const parts = items.map((it) => {
    const bruto = num(it.qtd) * num(it.preco);
    const share = t.subtotal > 0 ? bruto / t.subtotal : 0;
    const descAlocado = share * t.descontoTotal;
    const baseItem = Math.max(0, bruto - descAlocado);
    const iss = baseItem * (num(fin.issPct) / 100);
    const icms = baseItem * (num(fin.icmsPct) / 100);
    const pis = baseItem * (num(fin.pisPct) / 100);
    const cofins = baseItem * (num(fin.cofinsPct) / 100);
    const total = baseItem + iss + icms + pis + cofins; // sem ratear frete/outros aqui
    return { id: it.id, nome: it.nome || "Item", categoria: it.categoria, bruto, share, desconto: descAlocado, base: baseItem, iss, icms, pis, cofins, total };
  });
  return { list: parts, totals: t };
}

/********************
 * FORM — NOVO ORÇAMENTO + RESUMO LATERAL
 ********************/
function SummarySidebar({ items, fin, isDark }: { items: Item[]; fin: Fin; isDark: boolean }) {
  const { list, totals } = useMemo(() => perItemImpact(items, fin), [items, fin]);
  const card = `${isDark ? "bg-neutral-900 border-neutral-800" : "bg-neutral-50 border-neutral-200"} rounded-2xl border p-4`;

  return (
    <aside className="space-y-4 lg:sticky lg:top-16">
      {/* Totais gerais */}
      <div className={card}>
        <h4 className="font-semibold mb-2">Resumo Financeiro</h4>
        <div className="text-sm space-y-1">
          <div className="flex justify-between"><span className="opacity-70">Subtotal</span><span>{currency(totals.subtotal)}</span></div>
          <div className="flex justify-between"><span className="opacity-70">Descontos</span><span>- {currency(totals.descontoTotal)}</span></div>
          <div className="flex justify-between"><span className="opacity-70">Base</span><span>{currency(totals.base)}</span></div>
          <div className="flex justify-between"><span className="opacity-70">ISS</span><span>{currency(totals.iss)}</span></div>
          <div className="flex justify-between"><span className="opacity-70">ICMS</span><span>{currency(totals.icms)}</span></div>
          <div className="flex justify-between"><span className="opacity-70">PIS</span><span>{currency(totals.pis)}</span></div>
          <div className="flex justify-between"><span className="opacity-70">COFINS</span><span>{currency(totals.cofins)}</span></div>
          <div className="flex justify-between"><span className="opacity-70">Adicionais</span><span>{currency(totals.adicionais)}</span></div>
          <div className="flex justify-between font-semibold border-t pt-2 mt-2 border-neutral-700/30"><span>Total</span><span>{currency(totals.total)}</span></div>
        </div>
      </div>

      {/* Impacto por item */}
      <div className={card}>
        <h4 className="font-semibold mb-2">Impacto por Item</h4>
        <div className="space-y-3 max-h-[60vh] overflow-auto pr-1">
          {list.length === 0 && <p className="text-sm opacity-70">Nenhum item adicionado</p>}
          {list.map((it) => (
            <div key={it.id} className="rounded-xl border border-neutral-700/20 p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium truncate max-w-[12rem]">{it.nome}</p>
                <span className="text-xs opacity-70">{(it.share * 100).toFixed(1)}%</span>
              </div>
              <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between"><span className="opacity-70">Bruto</span><span>{currency(it.bruto)}</span></div>
                <div className="flex justify-between"><span className="opacity-70">Desc. alocado</span><span>- {currency(it.desconto)}</span></div>
                <div className="flex justify-between"><span className="opacity-70">Base</span><span>{currency(it.base)}</span></div>
                <div className="flex justify-between"><span className="opacity-70">ISS</span><span>{currency(it.iss)}</span></div>
                <div className="flex justify-between"><span className="opacity-70">ICMS</span><span>{currency(it.icms)}</span></div>
                <div className="flex justify-between"><span className="opacity-70">PIS</span><span>{currency(it.pis)}</span></div>
                <div className="flex justify-between"><span className="opacity-70">COFINS</span><span>{currency(it.cofins)}</span></div>
              </div>
              <div className="flex justify-between font-medium mt-2 text-sm"><span>Total item</span><span>{currency(it.total)}</span></div>
            </div>
          ))}
        </div>
      </div>

      {/* Parâmetros aplicados */}
      <div className={card}>
        <h4 className="font-semibold mb-2">Parâmetros</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between"><span className="opacity-70">Desc. (%)</span><span>{pct(num(fin.descontoPct))}</span></div>
          <div className="flex justify-between"><span className="opacity-70">Desc. (R$)</span><span>{currency(num(fin.descontoValor))}</span></div>
          <div className="flex justify-between"><span className="opacity-70">Frete</span><span>{currency(num(fin.frete))}</span></div>
          <div className="flex justify-between"><span className="opacity-70">Outros</span><span>{currency(num(fin.outrosCustos))}</span></div>
          <div className="flex justify-between"><span className="opacity-70">ISS</span><span>{pct(num(fin.issPct))}</span></div>
          <div className="flex justify-between"><span className="opacity-70">ICMS</span><span>{pct(num(fin.icmsPct))}</span></div>
          <div className="flex justify-between"><span className="opacity-70">PIS</span><span>{pct(num(fin.pisPct))}</span></div>
          <div className="flex justify-between"><span className="opacity-70">COFINS</span><span>{pct(num(fin.cofinsPct))}</span></div>
        </div>
      </div>
    </aside>
  );
}

function NovoOrcamentoForm() {
  const { isDark } = useUIStore();
  const pushToast = useToastStore((s) => s.push);

  const [meta, setMeta] = useState({
    nome: "",
    cliente: "",
    responsavel: "",
    dataInicio: "",
    previsaoEntrega: "",
    descricao: "",
  });

  const [items, setItems] = useState<Item[]>([]);

  const [fin, setFin] = useState<Fin>({
    descontoPct: 0,
    descontoValor: 0,
    frete: 0,
    outrosCustos: 0,
    issPct: 0,
    icmsPct: 0,
    pisPct: 0,
    cofinsPct: 0,
  });

  const totals = useMemo(() => computeTotals({ items, ...fin }), [items, fin]);

  const input = `px-3 py-2 rounded-xl border ${isDark ? "border-neutral-800 bg-neutral-900" : "border-neutral-300 bg-white"}`;

  const onSave = () => {
    const errors: string[] = [];
    if (!meta.cliente.trim()) errors.push("Cliente é obrigatório");
    if (!meta.nome.trim()) errors.push("Nome do orçamento é obrigatório");
    if (meta.previsaoEntrega && meta.dataInicio && new Date(meta.previsaoEntrega) < new Date(meta.dataInicio)) {
      errors.push("Previsão não pode ser menor que a data de início");
    }
    if (items.length === 0) errors.push("Adicione pelo menos um item");
    if (errors.length) {
      pushToast(`Corrija: ${errors.join("; ")}`);
      return;
    }
    pushToast("Orçamento salvo (mock)");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Coluna principal (form) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Bloco — Metadados do Orçamento */}
        <div className={`${isDark ? "bg-neutral-900 border-neutral-800" : "bg-neutral-50 border-neutral-200"} rounded-2xl border p-4`}>
          <h3 className="font-semibold mb-3">Dados do Orçamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs opacity-70">Nome do Orçamento *</label>
              <input className={input} placeholder="Ex: Linha de Pintura - Setor A" value={meta.nome} onChange={(e) => setMeta({ ...meta, nome: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs opacity-70">Cliente *</label>
              <input className={input} placeholder="Empresa" value={meta.cliente} onChange={(e) => setMeta({ ...meta, cliente: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs opacity-70">Responsável</label>
              <input className={input} placeholder="Nome" value={meta.responsavel} onChange={(e) => setMeta({ ...meta, responsavel: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs opacity-70">Data de Início</label>
              <input type="date" className={input} value={meta.dataInicio} onChange={(e) => setMeta({ ...meta, dataInicio: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs opacity-70">Previsão de Entrega</label>
              <input type="date" className={input} value={meta.previsaoEntrega} onChange={(e) => setMeta({ ...meta, previsaoEntrega: e.target.value })} />
            </div>
            <div className="space-y-1 md:col-span-3">
              <label className="text-xs opacity-70">Descrição</label>
              <textarea rows={3} className={input} placeholder="Escopo, ambiente, requisitos técnicos" value={meta.descricao} onChange={(e) => setMeta({ ...meta, descricao: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Categorias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {CATEGORIES.map((c) => (
            <CategoryCard key={c.key} catKey={c.key} label={c.label} items={items} setItems={setItems} isDark={isDark} />
          ))}
        </div>

        {/* Financeiro */}
        <div className={`${isDark ? "bg-neutral-900 border-neutral-800" : "bg-neutral-50 border-neutral-200"} rounded-2xl border p-4`}>
          <h3 className="font-semibold mb-3">Impostos, Descontos & Custos</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs opacity-70">Desconto (%)</label>
              <input type="number" className={input} value={fin.descontoPct} onChange={(e) => setFin({ ...fin, descontoPct: num(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs opacity-70">Desconto (R$)</label>
              <input type="number" className={input} value={fin.descontoValor} onChange={(e) => setFin({ ...fin, descontoValor: num(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs opacity-70">Frete (R$)</label>
              <input type="number" className={input} value={fin.frete} onChange={(e) => setFin({ ...fin, frete: num(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs opacity-70">Custos Adicionais (R$)</label>
              <input type="number" className={input} value={fin.outrosCustos} onChange={(e) => setFin({ ...fin, outrosCustos: num(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs opacity-70">ISS (%)</label>
              <input type="number" className={input} value={fin.issPct} onChange={(e) => setFin({ ...fin, issPct: num(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs opacity-70">ICMS (%)</label>
              <input type="number" className={input} value={fin.icmsPct} onChange={(e) => setFin({ ...fin, icmsPct: num(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs opacity-70">PIS (%)</label>
              <input type="number" className={input} value={fin.pisPct} onChange={(e) => setFin({ ...fin, pisPct: num(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs opacity-70">COFINS (%)</label>
              <input type="number" className={input} value={fin.cofinsPct} onChange={(e) => setFin({ ...fin, cofinsPct: num(e.target.value) })} />
            </div>
          </div>
        </div>

        {/* Resumo inferior (rápido) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`${isDark ? "bg-neutral-900 border-neutral-800" : "bg-neutral-50 border-neutral-200"} rounded-2xl border p-4`}>
            <p className="text-xs opacity-70">Subtotal</p>
            <p className="text-2xl font-semibold">{currency(totals.subtotal)}</p>
          </div>
          <div className={`${isDark ? "bg-neutral-900 border-neutral-800" : "bg-neutral-50 border-neutral-200"} rounded-2xl border p-4`}>
            <p className="text-xs opacity-70">Descontos</p>
            <p className="text-sm">{pct(num(fin.descontoPct))} + {currency(num(fin.descontoValor))}</p>
            <p className="text-xl font-semibold mt-1">{currency(totals.descontoTotal)}</p>
          </div>
          <div className={`${isDark ? "bg-neutral-900 border-neutral-800" : "bg-neutral-50 border-neutral-200"} rounded-2xl border p-4`}>
            <p className="text-xs opacity-70">Impostos + Adicionais</p>
            <p className="text-sm">ISS {pct(num(fin.issPct))}, ICMS {pct(num(fin.icmsPct))}, PIS {pct(num(fin.pisPct))}, COFINS {pct(num(fin.cofinsPct))}</p>
            <p className="text-xl font-semibold mt-1">{currency(totals.iss + totals.icms + totals.pis + totals.cofins + totals.adicionais)}</p>
          </div>
          <div className={`md:col-span-3 ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-neutral-50 border-neutral-200"} rounded-2xl border p-4 flex items-center justify-between`}>
            <div>
              <p className="text-xs opacity-70">Total do Orçamento</p>
              <p className="text-2xl font-semibold">{currency(totals.total)}</p>
            </div>
            <button onClick={onSave} className="px-4 py-2 rounded-xl border border-neutral-700/40 bg-transparent text-sm hover:bg-neutral-100/5 transition">
              <Save className="w-4 h-4 inline mr-2" /> Salvar Orçamento
            </button>
          </div>
        </div>
      </div>

      {/* Coluna lateral (resumo) */}
      <div className="lg:col-span-1">
        <SummarySidebar items={items} fin={fin} isDark={isDark} />
      </div>
    </div>
  );
}

/********************
 * PAGE SHELL
 ********************/
export default function NovoOrcamentoPage() {
  const { isDark } = useUIStore();
  return (
    <div className={isDark ? "bg-neutral-950 text-neutral-100" : "bg-neutral-50 text-neutral-900"}>
      <main className="max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8">
        <NovoOrcamentoForm />
        <div className="text-xs opacity-70 mt-6">
          *Mock — Validações adicionais sugeridas: números únicos de orçamento, regras de status, integração com Estoque/Compras, upload de documentos.
        </div>
      </main>
      <ToastViewport />
    </div>
  );
}

/********************
 * SELF TESTS — cálculo financeiro + rateio por item
 ********************/
(function runSelfTests() {
  try {
    const items: Item[] = [
      { id: "a", qtd: 2, preco: 100, nome: "", un: "un", categoria: "" },
      { id: "b", qtd: 3, preco: 50, nome: "", un: "un", categoria: "" },
    ];
    const fin: Fin = { descontoPct: 10, descontoValor: 20, frete: 30, outrosCustos: 0, issPct: 5, icmsPct: 12, pisPct: 1.65, cofinsPct: 7.6 };
    const t = computeTotals({ items, ...fin });
    // Subtotal = 2*100 + 3*50 = 350
    console.assert(t.subtotal === 350, "Subtotal incorreto");
    // Desconto % = 35, fixo = 20 => descontoTotal = 55; base = 295
    console.assert(Math.abs(t.descontoTotal - 55) < 0.0001 && Math.abs(t.base - 295) < 0.0001, "Base/Desconto incorretos");

    // Rateio proporcional do desconto
    const { list } = perItemImpact(items, fin);
    const totDesc = list.reduce((s, i) => s + i.desconto, 0);
    console.assert(Math.abs(totDesc - t.descontoTotal) < 0.01, "Rateio de desconto não fecha");

    // Tributos por item somam tributos totais (tolerância)
    const sumImpostos = list.reduce((s, i) => s + i.iss + i.icms + i.pis + i.cofins, 0);
    const tribTotais = t.iss + t.icms + t.pis + t.cofins;
    console.assert(Math.abs(sumImpostos - tribTotais) < 0.01, "Soma de impostos por item não bate o total");

    console.info("✅ Self-tests (novo orçamento + resumo lateral) passaram.");
  } catch (e) {
    console.warn("⚠️ Self-tests (novo orçamento + resumo lateral) encontraram problema:", e);
  }
})();

