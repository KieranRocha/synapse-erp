import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUIStore } from "../../../store/uiStore";
import { useToastStore } from "../../../store/toastStore";
import ToastViewport from "../../../components/Ui/ToastViewport";
import { MOCK_DETALHE } from "./mockOrcamentoDetalhe";
import {
  ArrowLeft,
  Save,
  FileDown,
  Mail,
  Copy,
  AlertCircle,
  ShieldCheck,
  Percent,
  Calendar,
  RefreshCw,
  Upload,
  X,
  Info,
  Tag as TagIcon,
} from "lucide-react";

// =========================
// Types
// =========================

type Status = "em análise" | "aprovado" | "reprovado" | "vencido";

type Errors = Partial<{
  cliente: string;
  projeto: string;
  responsavel: string;
  emissao: string;
  validade: string;
  margem: string;
  condPgto: string;
  entrega: string;
  garantia: string;
}>;

// =========================
// Helpers
// =========================

function formatCurrencyBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function daysUntil(dateISO: string) {
  const today = new Date();
  const target = new Date(dateISO);
  const diffMs = target.getTime() - new Date(today.toDateString()).getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

const STATUS_STYLES: Record<Status, string> = {
  "em análise": "bg-amber-500/10 text-amber-400 border border-amber-400/30",
  aprovado: "bg-emerald-500/10 text-emerald-400 border border-emerald-400/30",
  reprovado: "bg-rose-500/10 text-rose-400 border border-rose-400/30",
  vencido: "bg-neutral-500/10 text-neutral-400 border border-neutral-500/30",
};

// Minimal, dependency-free collapsible section
function Collapsible({
  title,
  children,
  defaultOpen = true,
}: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const { isDark } = useUIStore();

  const card = isDark
    ? "rounded-2xl border border-neutral-800 bg-neutral-900/60"
    : "rounded-2xl border border-neutral-200 bg-white";
  const header = isDark
    ? "flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-neutral-800"
    : "flex items-center justify-between px-4 py-3 bg-neutral-50 border-b border-neutral-200";

  return (
    <section className={`${card} overflow-hidden`}>
      <header className={header}>
        <h3 className="text-sm font-semibold tracking-wide">{title}</h3>
        <button
          onClick={() => setOpen(!open)}
          className="text-xs px-2 py-1 rounded-lg border border-neutral-600/40 hover:bg-neutral-800/40"
        >
          {open ? "Recolher" : "Expandir"}
        </button>
      </header>
      {open && <div className="p-4 grid grid-cols-1 gap-4">{children}</div>}
    </section>
  );
}


function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm mb-1">
      <span>{children}</span>
      {hint && (
        <span className="text-[11px] px-1.5 py-0.5 rounded-md border border-neutral-600/40 text-neutral-400">
          {hint}
        </span>
      )}
    </div>
  );
}

function StatusPill({ value }: { value: Status }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[value]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
      {value}
    </span>
  );
}

function KPI({ title, value, sub }: { title: string; value: string; sub?: string }) {
  const { isDark } = useUIStore();
  const kpiCard = isDark
    ? "rounded-xl ring-1 ring-neutral-800 bg-neutral-900/60 p-3"
    : "rounded-xl ring-1 ring-neutral-200 bg-white p-3";
  return (
    <div className={kpiCard}>
      <div className="text-[11px] uppercase tracking-wide text-neutral-400">{title}</div>
      <div className="text-lg font-semibold mt-0.5">{value}</div>
      {sub && <div className="text-xs text-neutral-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function Token({ text, onRemove }: { text: string; onRemove?: () => void }) {
  const { isDark } = useUIStore();
  const tokenCls = isDark
    ? "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs ring-1 ring-neutral-800 bg-neutral-900/40"
    : "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs ring-1 ring-neutral-200 bg-white";
  return (
    <span className={tokenCls}>
      <TagIcon className="h-3 w-3" />
      {text}
      {onRemove && (
        <button onClick={onRemove} className="hover:text-rose-400" aria-label={`Remover tag ${text}`}>
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

export default function OrcamentoEdicaoPagePlus() {
  const { isDark } = useUIStore();
  const pushToast = useToastStore((s: any) => s.push);
  const navigate = useNavigate();
  const { id } = useParams();

  // Backend loading/error state and snapshot
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [backend, setBackend] = useState<any>(null);

  // Base mock subtotal to permitir KPIs (troque para seu cálculo real)
  const subtotal = (MOCK_DETALHE as any)?.subtotal ?? 10000;

  // Form state
  const [cliente, setCliente] = useState(MOCK_DETALHE.cliente);
  const [projeto, setProjeto] = useState(MOCK_DETALHE.projeto);
  const [responsavel, setResponsavel] = useState(MOCK_DETALHE.responsavel);
  const [emissao, setEmissao] = useState(MOCK_DETALHE.emissao);
  const [validade, setValidade] = useState(MOCK_DETALHE.validade);
  const [status, setStatus] = useState<Status>(MOCK_DETALHE.status);
  const [margem, setMargem] = useState<number>(MOCK_DETALHE.margem); // fração, ex: 0.25 = 25%
  const [condPgto, setCondPgto] = useState(MOCK_DETALHE.condPgto);
  const [entrega, setEntrega] = useState(MOCK_DETALHE.entrega);
  const [garantia, setGarantia] = useState(MOCK_DETALHE.garantia);
  const [observacoes, setObservacoes] = useState(MOCK_DETALHE.observacoes || "");

  // Extras
  const [tags, setTags] = useState<string[]>([(MOCK_DETALHE as any)?.segmento || "Industrial"]);
  const [includeImpostos, setIncludeImpostos] = useState(false);
  const [aliquota, setAliquota] = useState(0.0);

  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const inputCls = useMemo(
    () =>
      "w-full p-2 rounded-xl border focus:outline-none focus:ring-2 transition " +
      (isDark
        ? "border-neutral-800 bg-neutral-900 text-neutral-100 placeholder-neutral-500 focus:ring-neutral-400/30"
        : "border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 focus:ring-neutral-500/20"),
    [isDark]
  );

  // Load budget by id and hydrate minimal fields
  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!id) {
        setError('ID do orçamento não informado');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const bid = Number(id);
        const data = await window.api.budgets.getById(bid);
        if (!mounted) return;
        if (!data) {
          setError('Orçamento não encontrado');
        } else {
          setBackend(data);
          // Mapear campos básicos
          setProjeto(data.name || '');
          setResponsavel((data.responsavel as any) || '');
          setEmissao(data.startDate ? new Date(data.startDate).toISOString().slice(0,10) : '');
          setValidade(data.deliveryDate ? new Date(data.deliveryDate).toISOString().slice(0,10) : '');
        }
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Erro ao carregar orçamento');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false };
  }, [id]);


  // Derived values
  const totalSemImposto = useMemo(() => subtotal * (1 + (margem || 0)), [subtotal, margem]);
  const totalComImposto = useMemo(() => (includeImpostos ? totalSemImposto * (1 + aliquota) : totalSemImposto), [includeImpostos, aliquota, totalSemImposto]);
  const markup = useMemo(() => (margem >= 0 && margem < 1 ? 1 / (1 - margem) - 1 : 0), [margem]);
  const diasRestantes = useMemo(() => (validade ? daysUntil(validade) : null), [validade]);

  // Dirty tracking
  useEffect(() => {
    setDirty(true);
  }, [cliente, projeto, responsavel, emissao, validade, status, margem, condPgto, entrega, garantia, observacoes, includeImpostos, aliquota]);

  // Warn on unload if dirty
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // Keyboard shortcuts: Ctrl+S to salvar, Esc para voltar
  const onSaveRef = useRef<() => void>();
  onSaveRef.current = handleSaveIPC;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSaveRef.current?.();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function validate(): boolean {
    const e: Errors = {};
    if (!cliente?.trim()) e.cliente = "Informe o cliente";
    if (!projeto?.trim()) e.projeto = "Informe o projeto";
    if (!responsavel?.trim()) e.responsavel = "Informe o responsável";
    if (!emissao) e.emissao = "Informe a data de emissão";
    if (!validade) e.validade = "Informe a validade";
    if (emissao && validade && new Date(validade) < new Date(emissao)) e.validade = "Validade não pode ser anterior à emissão";
    if (margem < 0 || margem >= 1) e.margem = "Margem deve ser entre 0 e 1 (ex.: 0.25 = 25%)";
    if (includeImpostos && (aliquota < 0 || aliquota > 1)) e.aliquota = "Alíquota deve ser entre 0 e 1" as any;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) {
      pushToast("Revise os campos destacados.");
      return;
    }
    setSaving(true);
    // Simula persistência
    setTimeout(() => {
      setSaving(false);
      setDirty(false);
      setLastSavedAt(new Date().toLocaleTimeString("pt-BR"));
      pushToast("Orçamento salvo (mock)");
      // Aqui você pode despachar para API/DB
      // console.log({ cliente, projeto, responsavel, emissao, validade, status, margem, condPgto, entrega, garantia, observacoes, tags, includeImpostos, aliquota });
    }, 550);
  }

  async function handleSaveIPC() {
    if (!validate()) {
      pushToast("Revise os campos destacados.");
      return;
    }
    try {
      setSaving(true);
      if (id) {
        await window.api.budgets.update(Number(id), {
          meta: {
            nome: projeto,
            responsavel,
            dataInicio: emissao || undefined,
            previsaoEntrega: validade || undefined,
            descricao: observacoes || undefined,
          }
        });
      } else {
        await new Promise((r) => setTimeout(r, 300));
      }
      setDirty(false);
      setLastSavedAt(new Date().toLocaleTimeString("pt-BR"));
      pushToast("Orçamento salvo");
    } catch (e) {
      pushToast("Erro ao salvar orçamento");
    } finally {
      setSaving(false);
    }
  }

  function onCancel() {
    if (dirty && !confirm("Existem alterações não salvas. Deseja realmente sair?")) return;
    navigate(-1);
  }

  function addTag(t: string) {
    const v = t.trim();
    if (!v) return;
    setTags((old) => (old.includes(v) ? old : [...old, v]));
  }

  function removeTag(t: string) {
    setTags((old) => old.filter((x) => x !== t));
  }

  function quickValidity(days: number) {
    if (!emissao) return;
    const d = new Date(emissao);
    d.setDate(d.getDate() + days);
    setValidade(d.toISOString().slice(0, 10));
  }

  const pageCls = isDark ? "bg-neutral-950 text-neutral-100" : "bg-neutral-50 text-neutral-900";
  const cardCls = isDark
    ? "rounded-2xl border border-neutral-800 bg-neutral-900/60"
    : "rounded-2xl border border-neutral-200 bg-white";
  return (
    <div className={pageCls}>
      {/* Loading / Error */}
      {loading && (
        <div className="max-w-6xl mx-auto w-full px-4 md:px-6 lg:px-8 py-2 text-sm text-neutral-400">Carregando orçamento...</div>
      )}
      {error && (
        <div className="max-w-6xl mx-auto w-full px-4 md:px-6 lg:px-8 py-2 text-sm text-rose-400">{error}</div>
      )}
      <main className="max-w-6xl mx-auto w-full px-4 md:px-6 lg:px-8 py-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onCancel()}
              className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-neutral-700/40 hover:bg-neutral-100/5"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-xl font-semibold leading-tight">Editar Orçamento</h1>
              <div className="flex items-center gap-2 mt-1">
                {backend && (
                  <span className="text-xs text-neutral-400">#{backend.numero} — {backend.name}</span>
                )}
                <StatusPill value={status} />
                {diasRestantes !== null && (
                  <span className={`text-xs px-2 py-0.5 rounded-lg border ${diasRestantes <= 0 ? "border-rose-500/40 text-rose-400" : "border-neutral-600/40 text-neutral-400"}`}>
                    {diasRestantes <= 0 ? "Vencido" : `${diasRestantes} dia(s) restantes`}
                  </span>
                )}
                {lastSavedAt && <span className="text-xs text-neutral-400">Última gravação: {lastSavedAt}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => pushToast("PDF gerado (mock)")}
              className="px-3 py-2 rounded-xl border border-neutral-700/40 hover:bg-neutral-100/5 text-sm inline-flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" /> PDF
            </button>
            <button
              onClick={() => pushToast("Compartilhado por e-mail (mock)")}
              className="px-3 py-2 rounded-xl border border-neutral-700/40 hover:bg-neutral-100/5 text-sm inline-flex items-center gap-2"
            >
              <Mail className="h-4 w-4" /> Enviar
            </button>
            <button
              onClick={() => pushToast("Duplicado (mock)")}
              className="px-3 py-2 rounded-xl border border-neutral-700/40 hover:bg-neutral-100/5 text-sm inline-flex items-center gap-2"
            >
              <Copy className="h-4 w-4" /> Duplicar
            </button>
            <button
              onClick={handleSaveIPC}
              className="px-4 py-2 rounded-xl border border-neutral-700/40 bg-transparent text-sm hover:bg-neutral-100/5 inline-flex items-center gap-2"
              disabled={saving}
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar
            </button>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-5">
            <Collapsible title="Informações Gerais" defaultOpen>
              <div>
                <Label>Cliente</Label>
                <input className={inputCls + (errors.cliente ? " border-rose-500/60" : "")} value={cliente} onChange={(e) => setCliente(e.target.value)} />
                {errors.cliente && <p className="text-xs text-rose-400 mt-1">{errors.cliente}</p>}
              </div>

              <div>
                <Label>Projeto</Label>
                <input className={inputCls + (errors.projeto ? " border-rose-500/60" : "")} value={projeto} onChange={(e) => setProjeto(e.target.value)} />
                {errors.projeto && <p className="text-xs text-rose-400 mt-1">{errors.projeto}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Responsável</Label>
                  <input className={inputCls + (errors.responsavel ? " border-rose-500/60" : "")} value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
                  {errors.responsavel && <p className="text-xs text-rose-400 mt-1">{errors.responsavel}</p>}
                </div>
                <div>
                  <Label>Status</Label>
                  <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as Status)}>
                    <option value="em análise">em análise</option>
                    <option value="aprovado">aprovado</option>
                    <option value="reprovado">reprovado</option>
                    <option value="vencido">vencido</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Emissão</Label>
                  <input type="date" className={inputCls + (errors.emissao ? " border-rose-500/60" : "")} value={emissao} onChange={(e) => setEmissao(e.target.value)} />
                  {errors.emissao && <p className="text-xs text-rose-400 mt-1">{errors.emissao}</p>}
                </div>
                <div>
                  <Label hint="atalhos 15/30/60">Validade</Label>
                  <div className="flex gap-2">
                    <input type="date" className={inputCls + (errors.validade ? " border-rose-500/60" : "")} value={validade} onChange={(e) => setValidade(e.target.value)} />
                    <div className="flex gap-1">
                      {[15, 30, 60].map((d) => (
                        <button key={d} onClick={() => quickValidity(d)} className="px-2 py-1 rounded-lg border border-neutral-700/40 text-xs hover:bg-neutral-100/5" type="button">
                          +{d}
                        </button>
                      ))}
                    </div>
                  </div>
                  {errors.validade && <p className="text-xs text-rose-400 mt-1">{errors.validade}</p>}
                </div>
              </div>
            </Collapsible>

            <Collapsible title="Condições Comerciais" defaultOpen>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Margem (fração)</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      max={0.95}
                      className={inputCls + (errors.margem ? " border-rose-500/60" : "")}
                      value={margem}
                      onChange={(e) => setMargem(Number(e.target.value))}
                    />
                    <Percent className="h-4 w-4 text-neutral-400" />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={0.95}
                    step={0.01}
                    value={Number.isFinite(margem) ? margem : 0}
                    onChange={(e) => setMargem(parseFloat(e.target.value))}
                    className="w-full mt-2"
                  />
                  {errors.margem && <p className="text-xs text-rose-400 mt-1">{errors.margem}</p>}
                </div>
                <div>
                  <Label>Condição de Pagamento</Label>
                  <select className={inputCls} value={condPgto} onChange={(e) => setCondPgto(e.target.value)}>
                    <option>30/70 - Pedido/Entrega</option>
                    <option>50/50 - Pedido/Entrega</option>
                    <option>À vista</option>
                    <option>30 dias</option>
                    <option>45 dias</option>
                    <option>Personalizada… (edite abaixo)</option>
                  </select>
                  <input className={inputCls + " mt-2"} value={condPgto} onChange={(e) => setCondPgto(e.target.value)} placeholder="Descreva a condição" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Entrega</Label>
                  <input className={inputCls} value={entrega} onChange={(e) => setEntrega(e.target.value)} />
                </div>
                <div>
                  <Label>Garantia</Label>
                  <input className={inputCls} value={garantia} onChange={(e) => setGarantia(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <input id="chk-imp" type="checkbox" checked={includeImpostos} onChange={(e) => setIncludeImpostos(e.target.checked)} />
                  <label htmlFor="chk-imp" className="text-sm">Incluir impostos no total</label>
                </div>
                <div className={`transition ${includeImpostos ? "opacity-100" : "opacity-50"}`}>
                  <Label>Alíquota (fração)</Label>
                  <input type="number" step="0.01" min={0} max={1} disabled={!includeImpostos} className={inputCls} value={aliquota} onChange={(e) => setAliquota(Number(e.target.value))} />
                </div>
              </div>
            </Collapsible>

            <Collapsible title="Observações & Anexos" defaultOpen>
              <div>
                <Label>Observações</Label>
                <textarea className={inputCls + " h-28"} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((t) => (
                    <Token key={t} text={t} onRemove={() => removeTag(t)} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className={inputCls}
                    placeholder="Digite e pressione Enter"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addTag("Urgente")}
                    className="px-3 py-2 rounded-xl border border-neutral-700/40 hover:bg-neutral-100/5 text-sm"
                  >
                    Sugerir: Urgente
                  </button>
                </div>
              </div>

              <div>
                <Label>Anexos</Label>
                <div className="border border-dashed border-neutral-700/40 rounded-2xl p-6 text-sm flex flex-col items-center justify-center gap-2">
                  <Upload className="h-5 w-5" />
                  Arraste arquivos aqui ou clique para selecionar (mock)
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-neutral-400">
                <Info className="h-4 w-4" />
                Use <b>Ctrl/⌘ + S</b> para salvar rapidamente. <b>Esc</b> para cancelar/voltar.
              </div>
            </Collapsible>
          </div>

          {/* Sidebar / KPIs */}
          <aside className="space-y-5">
            <div className="rounded-2xl border border-neutral-700/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold">Resumo Financeiro</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <KPI title="Subtotal" value={formatCurrencyBRL(subtotal)} />
                <KPI title="Margem" value={(margem * 100).toFixed(0) + "%"} sub={`Markup ${(markup * 100).toFixed(0)}%`} />
                <KPI title={includeImpostos ? "Total (c/ impostos)" : "Total Estimado"} value={formatCurrencyBRL(totalComImposto)} />
                <KPI title="Validade" value={validade ? new Date(validade).toLocaleDateString("pt-BR") : "—"} sub={diasRestantes !== null ? (diasRestantes <= 0 ? "VENCIDO" : `${diasRestantes} dias`) : undefined} />
              </div>
              <div className="mt-3 text-xs text-neutral-400 flex items-start gap-2">
                <AlertCircle className="h-4 w-4" />
                Ajuste a margem para simular o preço final. Conecte aqui seu cálculo real de composição de custos.
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-700/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4" />
                <h3 className="text-sm font-semibold">Checklist de Aprovação</h3>
              </div>
              <ul className="space-y-2 text-sm">
                {[
                  "Escopo revisado com o cliente",
                  "Tributação conferida",
                  "Prazo de entrega validado com PCP",
                  "Riscos mapeados",
                  "Anexos/documentos incluídos",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <input type="checkbox" className="scale-110" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-neutral-700/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4" />
                <h3 className="text-sm font-semibold">Auditoria</h3>
              </div>
              <div className="text-xs text-neutral-400 space-y-1">
                <div>Responsável: <span className="text-neutral-200">{responsavel || "—"}</span></div>
                <div>Emissão: {emissao ? new Date(emissao).toLocaleDateString("pt-BR") : "—"}</div>
                <div>Status atual: <span className="text-neutral-200">{status}</span></div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 inset-x-0 backdrop-blur bg-neutral-950/60 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <StatusPill value={status} />
            <span>Subtotal: <b>{formatCurrencyBRL(subtotal)}</b></span>
            <span>Total: <b>{formatCurrencyBRL(totalComImposto)}</b></span>
            {dirty && <span className="text-amber-400">• Alterações não salvas</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onCancel} className="px-3 py-2 rounded-xl border border-neutral-700/40 hover:bg-neutral-100/5 text-sm">Cancelar</button>
            <button onClick={handleSaveIPC} disabled={saving} className="px-4 py-2 rounded-xl border border-neutral-700/40 hover:bg-neutral-100/5 text-sm inline-flex items-center gap-2">
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar alterações
            </button>
          </div>
        </div>
      </div>

      <ToastViewport />
    </div>
  );
}
