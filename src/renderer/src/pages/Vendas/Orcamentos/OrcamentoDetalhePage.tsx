import React, { useMemo, useState, useEffect } from "react";
import { create } from "zustand";
import {
  Factory,
  LayoutDashboard,
  FileText,
  Wrench,
  Package,
  Users,
  Settings,
  RefreshCw,
  Bell,
  Sun,
  Moon,
  FileDown,
  Mail,
  Copy,
  Share2,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

/********************
 * THEME & TOAST (Zustand)
 ********************/
const useThemeStore = create<{ isDark: boolean; toggle: () => void }>((set) => ({
  isDark: true,
  toggle: () => set((s) => ({ isDark: !s.isDark })),
}));

interface ToastItem { id: string; message: string }
const useToastStore = create<{ toasts: ToastItem[]; push: (m: string) => void; remove: (id: string) => void }>((set) => ({
  toasts: [],
  push: (message) => set((s) => ({ toasts: [...s.toasts, { id: crypto.randomUUID(), message }] })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

function ToastViewport() {
  const { toasts, remove } = useToastStore();
  useEffect(() => {
    const timers = toasts.map((t) => setTimeout(() => remove(t.id), 2200));
    return () => timers.forEach(clearTimeout);
  }, [toasts, remove]);
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
 * HELPERS & TYPES
 ********************/
const currency = (v = 0) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const pct = (v = 0) => `${v.toFixed(2)}%`;
const dateBR = (d: string | number | Date) => new Date(d).toLocaleDateString("pt-BR");
const num = (v: string | number | boolean | null | undefined): number => {
  if (v === null || v === undefined) return 0;
  const converted = Number(v);
  return Number.isFinite(converted) ? converted : 0;
};

type Status = "em análise" | "aprovado" | "reprovado" | "vencido";

type Item = {
  id: string;
  categoria: string;
  codigo?: string;
  nome: string;
  un: string;
  qtd: number;
  preco: number;
};

type Finance = {
  descontoPct: number;
  descontoValor: number;
  frete: number;
  outrosCustos: number;
  issPct: number;
  icmsPct: number;
  pisPct: number;
  cofinsPct: number;
};

type OrcamentoDetalhe = {
  id: number;
  numero: string;
  cliente: string;
  projeto: string;
  responsavel: string;
  emissao: string;
  validade: string;
  status: Status;
  margem: number; // 0-1
  condPgto: string;
  entrega: string;
  garantia: string;
  observacoes?: string;
  slaDias: number;
  enviado: boolean;
  respondeuEm?: string | null;
  rev: number;
  itens: Item[];
  fin: Finance;
  anexos?: { id: string; nome: string; tipo: string }[];
  historico?: { data: string; tipo: string; desc: string }[];
};

/********************
 * CÁLCULO FINANCEIRO (PURO)
 ********************/
function computeTotals({ items, descontoPct, descontoValor, frete, outrosCustos, issPct, icmsPct, pisPct, cofinsPct }: { items: Item[] } & Finance) {
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

/********************
 * MOCK — DETALHE
 ********************/
const MOCK_DETALHE: OrcamentoDetalhe = {
  id: 19,
  numero: "ORC-00019",
  cliente: "Metal Forte",
  projeto: "Guindaste Colunar - Cap. 2t",
  responsavel: "Ana",
  emissao: "2025-08-17",
  validade: "2025-09-01",
  status: "em análise",
  margem: 0.25,
  condPgto: "30/60/90 (Boleto)",
  entrega: "FOB - 30 dias após aprovação",
  garantia: "12 meses contra defeitos de fabricação",
  observacoes: "Preços válidos para pagamento dentro do prazo e sem retenções.",
  slaDias: 2,
  enviado: true,
  respondeuEm: null,
  rev: 0,
  itens: [
    { id: crypto.randomUUID(), categoria: "Máquinas & Equipamentos", codigo: "EQ-2001", nome: "Coluna metálica 6m - ASTM A36", un: "un", qtd: 1, preco: 68000 },
    { id: crypto.randomUUID(), categoria: "Materiais / Matéria-prima", codigo: "MP-3110", nome: "Chapas 1/2\" oxicorte", un: "kg", qtd: 500, preco: 18.9 },
    { id: crypto.randomUUID(), categoria: "Consumíveis", codigo: "CS-0901", nome: "Eletrodos E7018", un: "cx", qtd: 3, preco: 780 },
    { id: crypto.randomUUID(), categoria: "Serviços", codigo: "SV-1200", nome: "Pintura epóxi PU", un: "m²", qtd: 120, preco: 35 },
    { id: crypto.randomUUID(), categoria: "Mão de Obra", codigo: "MO-0100", nome: "Soldador nível II", un: "h", qtd: 80, preco: 65 },
    { id: crypto.randomUUID(), categoria: "Ferramentas & Acessórios", codigo: "FR-5520", nome: "Talha elétrica 2t (importada)", un: "un", qtd: 1, preco: 14500 },
  ],
  fin: { descontoPct: 3, descontoValor: 0, frete: 2500, outrosCustos: 1800, issPct: 3, icmsPct: 12, pisPct: 1.65, cofinsPct: 7.6 },
  anexos: [
    { id: crypto.randomUUID(), nome: "Desenho Guindaste - Vista Geral.pdf", tipo: "pdf" },
    { id: crypto.randomUUID(), nome: "Memorial de Cálculo - V1.xlsx", tipo: "xlsx" },
  ],
  historico: [
    { data: "2025-08-17T09:15:00", tipo: "criado", desc: "Orçamento criado por Ana" },
    { data: "2025-08-17T09:40:00", tipo: "enviado", desc: "Proposta enviada por e-mail ao cliente" },
    { data: "2025-08-19T16:05:00", tipo: "interacao", desc: "Cliente solicitou detalhamento de pintura" },
  ],
};

/********************
 * UI — ELEMENTOS COMUNS
 ********************/
function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    "aprovado": "bg-green-500/10 text-green-300 border-green-400/40",
    "reprovado": "bg-red-500/10 text-red-300 border-red-400/40",
    "vencido": "bg-yellow-500/10 text-yellow-300 border-yellow-400/40",
    "em análise": "bg-blue-500/10 text-blue-300 border-blue-400/40",
  };
  return <span className={`px-3 py-1 rounded-lg text-xs border ${map[status]}`}>{status}</span>;
}

function SectionCard({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  const { isDark } = useThemeStore();
  return (
    <section className={`${isDark ? "bg-neutral-900 border-neutral-800" : "bg-neutral-50 border-neutral-200"} rounded-2xl border p-4`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}

function KeyRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-3 text-sm">
      <div className="opacity-70">{label}</div>
      <div className="col-span-2 font-medium truncate">{value}</div>
    </div>
  );
}

/********************
 * LISTAS & TABELAS
 ********************/
function ItemsTable({ itens }: { itens: Item[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-700/20">
      <table className="min-w-full text-sm">
        <thead className="text-left border-b border-neutral-700/30">
          <tr>
            <th className="px-4 py-3">Cód.</th>
            <th className="px-4 py-3">Descrição</th>
            <th className="px-4 py-3">Categoria</th>
            <th className="px-4 py-3">Un</th>
            <th className="px-4 py-3">Qtd</th>
            <th className="px-4 py-3">Preço</th>
            <th className="px-4 py-3">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((r) => (
            <tr key={r.id} className="border-b border-neutral-700/10">
              <td className="px-4 py-3 opacity-80">{r.codigo || "—"}</td>
              <td className="px-4 py-3 font-medium truncate max-w-[360px]" title={r.nome}>{r.nome}</td>
              <td className="px-4 py-3 opacity-80">{r.categoria}</td>
              <td className="px-4 py-3">{r.un}</td>
              <td className="px-4 py-3">{r.qtd}</td>
              <td className="px-4 py-3">{currency(r.preco)}</td>
              <td className="px-4 py-3 font-medium">{currency(r.qtd * r.preco)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TotalsPanel({ fin, items }: { fin: Finance; items: Item[] }) {
  const t = useMemo(() => computeTotals({ items, ...fin }), [items, fin]);

  function Row(props: { k: string; v: string; strong?: boolean }) {
    const { k, v, strong } = props;
    const cls = "flex items-center justify-between" + (strong ? " font-semibold" : "");
    return (
      <div className={cls}>
        <span className="opacity-70">{k}</span>
        <span>{v}</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-700/30 p-4 space-y-2">
      <Row k="Subtotal" v={currency(t.subtotal)} />
      <Row k="Descontos" v={"- " + currency(t.descontoTotal)} />
      <Row k="Base" v={currency(t.base)} />
      <Row k="ISS" v={currency(t.iss)} />
      <Row k="ICMS" v={currency(t.icms)} />
      <Row k="PIS" v={currency(t.pis)} />
      <Row k="COFINS" v={currency(t.cofins)} />
      <Row k="Adicionais" v={currency(t.adicionais)} />
      <div className="border-t border-neutral-700/30 pt-2">
        <Row k="Total do Orçamento" v={currency(t.total)} strong />
      </div>
    </div>
  );
}

function Timeline({ events }: { events?: { data: string; tipo: string; desc: string }[] }) {
  const eventsList = events || [];
  return (
    <ol className="relative border-s border-neutral-700/30 pl-5 space-y-4">
      {eventsList.map((e, idx) => (
        <li key={idx} className="ms-2">
          <div className="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-neutral-700/40 bg-neutral-900" />
          <p className="text-xs opacity-70">{new Date(e.data).toLocaleString("pt-BR")}</p>
          <p className="text-sm font-medium">{e.tipo}</p>
          <p className="text-sm opacity-80">{e.desc}</p>
        </li>
      ))}
      {eventsList.length === 0 && <li className="text-sm opacity-70">Sem eventos.</li>}
    </ol>
  );
}

/********************
 * LAYOUT — SIDEBAR & HEADER
 ********************/

function HeaderBarShell({ title, subtitle, onBack }: { title: string; subtitle: string; onBack?: () => void }) {
  const { isDark, toggle } = useThemeStore();
  const [notifications, setNotifications] = useState(2);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const btnIcon = `p-2 rounded-full transition ${isDark ? "hover:bg-neutral-800" : "hover:bg-neutral-200"}`;
  return (
    <header className={`${isDark ? "bg-neutral-950" : "bg-neutral-50"} border-b ${isDark ? "border-neutral-800" : "border-neutral-200"} px-4 py-3 flex items-center justify-between sticky top-0 z-20`}>
      <div className="flex items-start gap-3">
        <button onClick={onBack} className={`${btnIcon} mt-0.5`} title="Voltar"><ArrowLeft size={16} /></button>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-xs opacity-60">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setIsRefreshing(true); setTimeout(() => setIsRefreshing(false), 800); }}
          className={btnIcon}
          title="Atualizar"
        >
          <RefreshCw className={`${isRefreshing ? "animate-spin" : ""} opacity-80`} size={16} />
        </button>
        <button onClick={toggle} className={btnIcon} title="Tema">
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button onClick={() => setNotifications(0)} className={btnIcon} title="Notificações">
          <div className="relative">
            <Bell size={18} className="opacity-80" />
            {notifications > 0 && (
              <span className={`absolute -top-1 -right-1 ${isDark ? "bg-neutral-100 text-neutral-900" : "bg-neutral-900 text-neutral-100"} text-[10px] rounded-full h-4 w-4 flex items-center justify-center`}>
                {notifications}
              </span>
            )}
          </div>
        </button>
      </div>
    </header>
  );
}

/********************
 * PÁGINA — DETALHES (somente consulta)
 ********************/
export default function OrcamentoDetalhePage() {
  const { isDark } = useThemeStore();
  const pushToast = useToastStore((s) => s.push);

  // Permite abrir por querystring: ?id=19 ou ?num=ORC-00019 (mock)
  const [orc, setOrc] = useState<OrcamentoDetalhe>(MOCK_DETALHE);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const id = q.get("id");
    const num = q.get("num");
    if ((id && +id === MOCK_DETALHE.id) || (num && num === MOCK_DETALHE.numero)) {
      setOrc(MOCK_DETALHE);
    }
  }, []);

  const t = useMemo(() => computeTotals({ items: orc.itens, ...orc.fin }), [orc]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${location.origin}${location.pathname}?num=${orc.numero}`);
      pushToast("Link copiado");
    } catch {
      pushToast("Não foi possível copiar");
    }
  };

  const ActionBar = (
    <div className="flex items-center gap-2">
      <button onClick={() => pushToast("Gerar PDF (mock)")} className="px-3 py-2 rounded-xl border border-neutral-700/40 bg-transparent text-sm hover:bg-neutral-100/5 transition"><FileDown className="w-4 h-4 inline mr-1" /> PDF</button>
      <button onClick={() => pushToast("Enviar por e-mail (mock)")} className="px-3 py-2 rounded-xl border border-neutral-700/40 bg-transparent text-sm hover:bg-neutral-100/5 transition"><Mail className="w-4 h-4 inline mr-1" /> E-mail</button>
      <button onClick={onCopy} className="px-3 py-2 rounded-xl border border-neutral-700/40 bg-transparent text-sm hover:bg-neutral-100/5 transition"><Copy className="w-4 h-4 inline mr-1" /> Copiar link</button>
      <button onClick={() => pushToast("Compartilhar (mock)")} className="px-3 py-2 rounded-xl border border-neutral-700/40 bg-transparent text-sm hover:bg-neutral-100/5 transition"><Share2 className="w-4 h-4 inline mr-1" /> Compartilhar</button>
    </div>
  );

  return (
    <div className={isDark ? "bg-neutral-950 text-neutral-100" : "bg-neutral-50 text-neutral-900"}>
      <div className="flex min-h-screen">
        {/* Sidebar */}


        <main className="max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 space-y-6">
          {/* Cabeçalho do Orçamento */}
          <div className={`${isDark ? "bg-neutral-900 border-neutral-800" : "bg-neutral-50 border-neutral-200"} rounded-2xl border p-4`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl md:text-2xl font-semibold">{orc.projeto}</h1>
                  <StatusBadge status={orc.status} />
                </div>
                <p className="text-sm opacity-80">Cliente: <span className="font-medium">{orc.cliente}</span></p>
                <p className="text-xs opacity-60">Emissão: {dateBR(orc.emissao)} • Validade: {dateBR(orc.validade)} • Resp.: {orc.responsavel}</p>
              </div>
              {ActionBar}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* COLUNA 1-2 — Detalhes & Itens */}
            <div className="lg:col-span-2 space-y-6">
              <SectionCard title="Dados comerciais">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <KeyRow label="Nº Orçamento" value={orc.numero} />
                  <KeyRow label="Status" value={<StatusBadge status={orc.status} />} />
                  <KeyRow label="Condição de Pagamento" value={orc.condPgto} />
                  <KeyRow label="Entrega" value={orc.entrega} />
                  <KeyRow label="Garantia" value={orc.garantia} />
                  <KeyRow label="SLA interno (dias)" value={String(orc.slaDias)} />
                </div>
                {orc.observacoes && (
                  <div className="mt-3 text-sm">
                    <p className="opacity-70 mb-1">Observações</p>
                    <p className="leading-relaxed">{orc.observacoes}</p>
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Itens do orçamento">
                <ItemsTable itens={orc.itens} />
              </SectionCard>

              <SectionCard title="Histórico & Interações">
                <Timeline events={orc.historico || []} />
              </SectionCard>
            </div>

            {/* COLUNA 3 — Resumo & Parâmetros */}
            <div className="lg:col-span-1 space-y-6">
              <SectionCard title="Resumo financeiro">
                <TotalsPanel fin={orc.fin} items={orc.itens} />
              </SectionCard>

              <SectionCard title="Parâmetros aplicados">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between"><span className="opacity-70">Desc. (%)</span><span>{pct(num(orc.fin.descontoPct))}</span></div>
                  <div className="flex justify-between"><span className="opacity-70">Desc. (R$)</span><span>{currency(num(orc.fin.descontoValor))}</span></div>
                  <div className="flex justify-between"><span className="opacity-70">Frete</span><span>{currency(num(orc.fin.frete))}</span></div>
                  <div className="flex justify-between"><span className="opacity-70">Outros</span><span>{currency(num(orc.fin.outrosCustos))}</span></div>
                  <div className="flex justify-between"><span className="opacity-70">ISS</span><span>{pct(num(orc.fin.issPct))}</span></div>
                  <div className="flex justify-between"><span className="opacity-70">ICMS</span><span>{pct(num(orc.fin.icmsPct))}</span></div>
                  <div className="flex justify-between"><span className="opacity-70">PIS</span><span>{pct(num(orc.fin.pisPct))}</span></div>
                  <div className="flex justify-between"><span className="opacity-70">COFINS</span><span>{pct(num(orc.fin.cofinsPct))}</span></div>
                </div>
              </SectionCard>

              <SectionCard title="Anexos">
                <ul className="space-y-2 text-sm">
                  {(orc.anexos || []).map((a) => (
                    <li key={a.id} className="flex items-center justify-between">
                      <span className="truncate mr-3">{a.nome}</span>
                      <button onClick={() => pushToast(`Baixar ${a.nome} (mock)`)} className="px-2 py-1 rounded-lg border border-neutral-700/30 text-xs hover:bg-neutral-100/5 transition">Baixar</button>
                    </li>
                  ))}
                  {(orc.anexos || []).length === 0 && <li className="opacity-70">Sem anexos</li>}
                </ul>
              </SectionCard>

              <SectionCard title="Indicadores rápidos">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-neutral-700/30 p-3">
                    <p className="text-xs opacity-70">Ticket (total)</p>
                    <p className="text-lg font-semibold">{currency(t.total)}</p>
                  </div>
                  <div className="rounded-xl border border-neutral-700/30 p-3">
                    <p className="text-xs opacity-70">Margem alvo</p>
                    <p className="text-lg font-semibold">{pct(orc.margem * 100)}</p>
                  </div>
                  <div className="rounded-xl border border-neutral-700/30 p-3">
                    <p className="text-xs opacity-70">Dias até vencer</p>
                    <p className="text-lg font-semibold">{Math.max(0, Math.ceil((new Date(orc.validade).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}</p>
                  </div>
                  <div className="rounded-xl border border-neutral-700/30 p-3">
                    <p className="text-xs opacity-70">Revisões</p>
                    <p className="text-lg font-semibold">{orc.rev}</p>
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>

          <div className="text-xs opacity-70">*Somente consulta — ações de edição/duplicação podem ser adicionadas em uma versão de &quot;Editar&quot;.</div>
        </main>
        <ToastViewport />
      </div>
    </div>

  );
}

/********************
 * SELF TESTS — cálculo financeiro
 ********************/
(function runSelfTests() {
  try {
    const items: Item[] = [
      { id: "a", categoria: "X", nome: "A", un: "un", qtd: 2, preco: 100 },
      { id: "b", categoria: "Y", nome: "B", un: "un", qtd: 3, preco: 50 },
    ];
    const fin: Finance = { descontoPct: 10, descontoValor: 20, frete: 30, outrosCustos: 0, issPct: 5, icmsPct: 12, pisPct: 1.65, cofinsPct: 7.6 };
    const t = computeTotals({ items, ...fin });
    console.assert(t.subtotal === 350, "Subtotal incorreto");
    console.assert(Math.abs(t.descontoTotal - 55) < 0.0001 && Math.abs(t.base - 295) < 0.0001, "Base/Desconto incorretos");
    console.info("✅ Self-tests (detalhe orçamento) passaram.");
  } catch (e) {
    console.warn("⚠️ Self-tests (detalhe orçamento) problema:", e);
  }
})();

