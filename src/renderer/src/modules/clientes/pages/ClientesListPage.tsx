import { useMemo, useState, useEffect } from "react";
import {
  Plus,
  FileDown,
  Mail,
  Search,
  Filter,
  ChevronDown,
  Eye,
  Edit,
  MoreVertical,
  Phone,
  Mail as MailIcon,
  MapPin,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/** ================================================================
 *  TYPES - Database Client Model
 *  ================================================================ */
interface DatabaseClient {
  id: number;
  tipo_pessoa: 'PJ' | 'PF';
  razao_social: string;
  nome_fantasia?: string;
  cpf_cnpj: string;
  indicador_ie: 'Contribuinte' | 'Isento' | 'Não Contribuinte';
  ie?: string;
  im?: string;
  suframa?: string;
  regime_trib: 'Simples Nacional' | 'Lucro Presumido' | 'Lucro Real';
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  pais?: string;
  email?: string;
  telefone?: string;
  responsavel?: string;
  cargo?: string;
  cond_pgto_padrao?: string;
  limite_credito?: number;
  vendedor_padrao?: string;
  transporte_padrao: 'CIF' | 'FOB';
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

// Mapped type for display
type Cliente = {
  id: number;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  cidade: string;
  uf: string;
  status: "ativo" | "inativo" | "pendente";
  valorTotal: number;
  ultimoPedido: string; // ISO
  categoria: "industrial" | "construcao" | "agro";
  nomeFantasia?: string;
  limiteCredito?: number;
};

/** ================================================================
 *  UTILS (CSS-first tokens)
 *  ================================================================ */
const currency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const dateBR = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");

type SortKey = "nome" | "-nome" | "valor" | "-valor" | "ultimo" | "-ultimo";

// Helper function to map database client to display client
const mapDatabaseClient = (dbClient: DatabaseClient): Cliente => {
  // Generate mock data for fields not in database yet
  const mockStatus: Cliente['status'] = Math.random() > 0.7 ? 'inativo' : Math.random() > 0.5 ? 'pendente' : 'ativo';
  const mockCategoria: Cliente['categoria'] = Math.random() > 0.66 ? 'agro' : Math.random() > 0.5 ? 'construcao' : 'industrial';
  const mockValorTotal = (dbClient.limite_credito || 0) * (1 + Math.random() * 3);
  const mockUltimoPedido = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString();

  return {
    id: dbClient.id,
    nome: dbClient.razao_social,
    cnpj: dbClient.cpf_cnpj,
    email: dbClient.email || '',
    telefone: dbClient.telefone || '',
    cidade: dbClient.cidade || '',
    uf: dbClient.uf || '',
    nomeFantasia: dbClient.nome_fantasia,
    limiteCredito: dbClient.limite_credito,
    // Mock data for fields not yet in database
    status: mockStatus,
    categoria: mockCategoria,
    valorTotal: mockValorTotal,
    ultimoPedido: mockUltimoPedido
  };
};

/** ================================================================
 *  PAGE
 *  ================================================================ */
export default function ClientesPage() {
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState({
    busca: "",
    status: "",
    categoria: "",
    cidade: "",
    uf: "",
  });
  const [sort, setSort] = useState<SortKey>("-ultimo");
  const [open, setOpen] = useState(false);
  
  // Backend state
  const [databaseClients, setDatabaseClients] = useState<DatabaseClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onNew = () => navigate("/clientes/novo");
  const onExport = () => console.log("Exportar (mock)");
  const onEmail = () => console.log("Enviar e-mail (mock)");

  // Load clients from backend
  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const clients = await window.api.clients.getAll();
      setDatabaseClients(clients);
      console.log('Clientes carregados do backend:', clients);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar clientes';
      setError(errorMessage);
      console.error('Erro ao carregar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load clients on component mount
  useEffect(() => {
    loadClients();
  }, []);

  // Convert database clients to display clients
  const clients = useMemo(() => {
    return databaseClients.map(mapDatabaseClient);
  }, [databaseClients]);

  // KPIs
  const kpis = useMemo(() => {
    const total = clients.length;
    const ativos = clients.filter((c) => c.status === "ativo").length;
    const valor = clients.reduce((s, c) => s + c.valorTotal, 0);
    const ticket = total ? valor / total : 0;
    const recentes30 = clients.filter(
      (c) => (Date.now() - new Date(c.ultimoPedido).getTime()) / 86400000 <= 30
    ).length;

    return {
      total,
      ativos,
      ticket,
      valor,
      recentes30,
      ativacaoPct: total ? (ativos / total) * 100 : 0,
    };
  }, [clients]);

  // FILTER
  const filtered = useMemo(() => {
    const term = filtros.busca.trim().toLowerCase();
    return clients.filter((c) => {
      const matchText =
        !term ||
        c.nome.toLowerCase().includes(term) ||
        c.cnpj.includes(term) ||
        c.email.toLowerCase().includes(term);

      const matchStatus = !filtros.status || c.status === filtros.status;
      const matchCat = !filtros.categoria || c.categoria === filtros.categoria;
      const matchCity = !filtros.cidade || c.cidade.toLowerCase().includes(filtros.cidade.toLowerCase());
      const matchUF = !filtros.uf || c.uf === filtros.uf.toUpperCase();

      return matchText && matchStatus && matchCat && matchCity && matchUF;
    });
  }, [filtros, clients]);

  // SORT
  const rows = useMemo(() => {
    const arr = [...filtered];
    const cmp = (a: Cliente, b: Cliente, key: SortKey) => {
      switch (key) {
        case "nome": return a.nome.localeCompare(b.nome);
        case "-nome": return b.nome.localeCompare(a.nome);
        case "valor": return a.valorTotal - b.valorTotal;
        case "-valor": return b.valorTotal - a.valorTotal;
        case "ultimo": return +new Date(a.ultimoPedido) - +new Date(b.ultimoPedido);
        case "-ultimo": return +new Date(b.ultimoPedido) - +new Date(a.ultimoPedido);
      }
    };
    arr.sort((a, b) => cmp(a, b, sort));
    return arr;
  }, [filtered, sort]);

  return (
    <div className="bg-bg">
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header local */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-fg">Clientes</h2>
            <p className="text-sm text-muted-foreground">
              Cadastro, histórico e relacionamento comercial
              {loading && <span className="ml-2 inline-flex items-center gap-1 text-blue-600"><Loader2 className="w-3 h-3 animate-spin" /> Carregando...</span>}
              {error && <span className="ml-2 text-red-600">Erro: {error}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {error && (
              <button 
                onClick={loadClients} 
                className="px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm hover:bg-red-100 transition"
              >
                🔄 Tentar Novamente
              </button>
            )}
            <button onClick={onNew} className="px-3 py-2 rounded-xl border border-input bg-card text-sm hover:bg-muted/50 transition">
              <Plus className="w-4 h-4 inline mr-1" /> Novo
            </button>
            <button onClick={onExport} className="px-3 py-2 rounded-xl border border-input bg-card text-sm hover:bg-muted/50 transition">
              <FileDown className="w-4 h-4 inline mr-1" /> Exportar
            </button>
            <button onClick={onEmail} className="px-3 py-2 rounded-xl border border-input bg-card text-sm hover:bg-muted/50 transition">
              <Mail className="w-4 h-4 inline mr-1" /> E-mail
            </button>
          </div>
        </div>

        {/* KPIs no padrão */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <KpiCard title="Total" value={kpis.total} />
          <KpiCard title="Ativos" value={kpis.ativos} />
          <KpiCard title="Ativação" value={`${kpis.ativacaoPct.toFixed(1)}%`} />
          <KpiCard title="Valor Total" value={currency(kpis.valor)} />
          <KpiCard title="Ticket Médio" value={currency(kpis.ticket)} />
          <KpiCard title="Ativos (30d)" value={kpis.recentes30} />
        </section>

        {/* FiltersBar no padrão */}
        <section className="rounded-2xl border border-border bg-card/70 backdrop-blur p-3 md:p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            {/* Busca */}
            <div className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2 border border-input bg-muted/50 text-fg">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                value={filtros.busca}
                onChange={(e) => setFiltros((s) => ({ ...s, busca: e.target.value }))}
                placeholder="Buscar por nome, CNPJ ou e-mail"
                className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
            </div>

            {/* Filtros principais */}
            <div className="flex items-center gap-2">
              <select
                value={filtros.status}
                onChange={(e) => setFiltros((s) => ({ ...s, status: e.target.value }))}
                className="px-3 py-2 rounded-xl border border-input bg-card text-sm text-fg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Status (todos)</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
                <option value="pendente">Pendentes</option>
              </select>

              <select
                value={filtros.categoria}
                onChange={(e) => setFiltros((s) => ({ ...s, categoria: e.target.value }))}
                className="px-3 py-2 rounded-xl border border-input bg-card text-sm text-fg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Categoria (todas)</option>
                <option value="industrial">Industrial</option>
                <option value="construcao">Construção</option>
                <option value="agro">Agropecuária</option>
              </select>

              <button
                onClick={() => setOpen((o) => !o)}
                className="px-3 py-2 rounded-xl text-sm inline-flex items-center gap-2 border border-input bg-card text-fg hover:bg-muted/50 transition"
                aria-expanded={open}
                aria-controls="filtros-avancados"
              >
                <Filter className="w-4 h-4" />
                Filtros
                <ChevronDown className={`w-4 h-4 transition ${open ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Ordenação */}
            <div className="flex items-center gap-2 md:ml-auto">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="px-3 py-2 rounded-xl border border-input bg-card text-sm text-fg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="-ultimo">Ordenar por: Último pedido (recente)</option>
                <option value="ultimo">Ordenar por: Último pedido (antigo)</option>
                <option value="-valor">Ordenar por: Valor (maior)</option>
                <option value="valor">Ordenar por: Valor (menor)</option>
                <option value="nome">Ordenar por: Nome (A–Z)</option>
                <option value="-nome">Ordenar por: Nome (Z–A)</option>
              </select>
            </div>
          </div>

          {open && (
            <div id="filtros-avancados" className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                value={filtros.cidade}
                onChange={(e) => setFiltros((s) => ({ ...s, cidade: e.target.value }))}
                placeholder="Cidade"
                className="px-3 py-2 rounded-xl border border-input bg-card text-sm text-fg focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                value={filtros.uf}
                onChange={(e) => setFiltros((s) => ({ ...s, uf: e.target.value.toUpperCase().slice(0, 2) }))}
                placeholder="UF"
                className="px-3 py-2 rounded-xl border border-input bg-card text-sm text-fg focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={2}
              />
              <input
                value={filtros.categoria}
                onChange={(e) => setFiltros((s) => ({ ...s, categoria: e.target.value }))}
                placeholder="Categoria (texto livre)"
                className="px-3 py-2 rounded-xl border border-input bg-card text-sm text-fg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
        </section>

        {/* Lista Responsiva: Cards (mobile) + Tabela (desktop) */}
        <section className="space-y-3">
          {/* Mobile Cards */}
          {!loading && !error && (
            <div className="grid gap-3 sm:hidden">
              {rows.map((c) => (
              <article key={c.id} className="rounded-2xl border border-border bg-card shadow-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-fg">{c.nome}</h3>
                    <p className="text-sm text-muted-foreground">{c.cnpj}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconBtn title="Ver">
                      <Eye size={16} className="text-muted-foreground" />
                    </IconBtn>
                    <IconBtn title="Editar">
                      <Edit size={16} className="text-muted-foreground" />
                    </IconBtn>
                    <IconBtn title="Mais">
                      <MoreVertical size={16} className="text-muted-foreground" />
                    </IconBtn>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MailIcon size={14} />
                    <span className="truncate">{c.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone size={14} />
                    <span>{c.telefone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin size={14} />
                    <span>{c.cidade}, {c.uf}</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={`badge ${statusToBadge(c.status)}`}>{labelStatus(c.status)}</span>
                  <span className={`badge ${categoriaToBadge(c.categoria)}`}>{labelCategoria(c.categoria)}</span>
                  <span className="ml-auto text-sm font-medium text-fg">
                    {currency(c.valorTotal)}
                  </span>
                </div>

                <div className="mt-1 text-xs text-muted-foreground">
                  Último pedido: {dateBR(c.ultimoPedido)}
                </div>
              </article>
              ))}
            </div>
          )}

          {/* Desktop Table */}
          {!loading && !error && (
            <div className="hidden sm:block rounded-2xl border border-border bg-card/70 backdrop-blur overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left border-b border-border bg-muted/40">
                  <tr>
                    <Th>Cliente</Th>
                    <Th>Contato</Th>
                    <Th>Localização</Th>
                    <Th>Status</Th>
                    <Th>Categoria</Th>
                    <Th className="text-right">Valor Total</Th>
                    <Th>Último Pedido</Th>
                    <Th className="text-center">Ações</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c, i) => (
                    <tr key={c.id} className={`border-b border-border/50 hover:bg-muted/30 transition ${i % 2 ? "bg-muted/5" : "bg-transparent"}`}>
                      <Td>
                        <div>
                          <div className="font-medium text-fg">{c.nome}</div>
                          <div className="text-xs text-muted-foreground">{c.cnpj}</div>
                        </div>
                      </Td>
                      <Td>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MailIcon size={14} />
                            <span className="truncate max-w-[220px]">{c.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone size={14} />
                            <span>{c.telefone}</span>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin size={14} />
                          <span>{c.cidade}, {c.uf}</span>
                        </div>
                      </Td>
                      <Td>
                        <span className={`badge ${statusToBadge(c.status)}`}>{labelStatus(c.status)}</span>
                      </Td>
                      <Td>
                        <span className={`badge ${categoriaToBadge(c.categoria)}`}>{labelCategoria(c.categoria)}</span>
                      </Td>
                      <Td className="text-right font-medium text-fg">{currency(c.valorTotal)}</Td>
                      <Td className="text-muted-foreground">{dateBR(c.ultimoPedido)}</Td>
                      <Td>
                        <div className="flex items-center justify-center gap-1">
                          <IconBtn title="Visualizar"><Eye size={16} className="text-muted-foreground" /></IconBtn>
                          <IconBtn title="Editar"><Edit size={16} className="text-muted-foreground" /></IconBtn>
                          <IconBtn title="Mais opções"><MoreVertical size={16} className="text-muted-foreground" /></IconBtn>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-48"></div>
                      <div className="h-3 bg-muted rounded w-32"></div>
                    </div>
                    <div className="h-8 bg-muted rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="text-center py-12 rounded-2xl border border-red-200 bg-red-50">
              <div className="text-red-800 font-medium mb-1">Erro ao carregar clientes</div>
              <div className="text-sm text-red-600 mb-4">{error}</div>
              <button 
                onClick={loadClients}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
              >
                🔄 Tentar Novamente
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && rows.length === 0 && (
            <div className="text-center py-12 rounded-2xl border border-border bg-card">
              <div className="text-fg font-medium mb-1">
                {clients.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum cliente encontrado'}
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                {clients.length === 0 
                  ? 'Comece cadastrando seu primeiro cliente.' 
                  : 'Ajuste filtros ou o termo de busca.'
                }
              </div>
              {clients.length === 0 && (
                <button 
                  onClick={onNew}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                >
                  <Plus className="w-4 h-4 inline mr-1" /> Cadastrar Primeiro Cliente
                </button>
              )}
            </div>
          )}
        </section>

        <div className="text-xs opacity-70 mt-6">
          *Dados carregados do PostgreSQL — Campos como status, categoria e valores são temporariamente simulados. Próximas integrações: pipeline, CRM, relatórios.
        </div>
      </main>
    </div>
  );
}

/** ================================================================
 *  ÁTOMOS (no teu padrão de tokens)
 *  ================================================================ */
function KpiCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-card backdrop-blur p-4">
      <p className="text-xs text-muted-foreground mb-1">{title}</p>
      <div className="text-xl font-semibold text-fg">{value}</div>
    </div>
  );
}

function IconBtn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <button title={title} className="p-2 rounded-xl hover:bg-muted/50 transition">
      {children}
    </button>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 font-medium text-muted-foreground whitespace-nowrap ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}

/** ================================================================
 *  BADGES (mapeamento para tuas classes globais)
 *  Requer no CSS global:
 *   .badge, .badge-success, .badge-danger, .badge-warning, .badge-primary, .badge-info
 *  ================================================================ */
function statusToBadge(s: Cliente["status"]) {
  if (s === "ativo") return "badge-success";
  if (s === "pendente") return "badge-warning";
  return "badge-danger";
}
function categoriaToBadge(c: Cliente["categoria"]) {
  if (c === "industrial") return "badge-primary";
  if (c === "construcao") return "badge-info";
  return "badge-warning";
}
function labelStatus(s: Cliente["status"]) {
  return s === "ativo" ? "Ativo" : s === "pendente" ? "Pendente" : "Inativo";
}
function labelCategoria(c: Cliente["categoria"]) {
  if (c === "industrial") return "Industrial";
  if (c === "construcao") return "Construção";
  return "Agropecuária";
}
