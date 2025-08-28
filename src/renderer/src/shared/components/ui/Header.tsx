import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  RefreshCw,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/********************
 * TEMA (CSS-first v4)
 * Toggle controlado via atributo data-theme no <html>.
 ********************/
type Theme = "light" | "dark" | "system";

function resolveTheme(t: Theme) {
  if (t === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return t;
}

function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    (localStorage.getItem("theme") as Theme) || "system"
  );

  useEffect(() => {
    const resolved = resolveTheme(theme);
    document.documentElement.setAttribute("data-theme", resolved);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (resolveTheme(t) === "dark" ? "light" : "dark"));

  return { theme, setTheme, toggle, resolved: resolveTheme(theme) };
}

/********************
 * Tipos
 ********************/
interface BreadcrumbItem {
  path: string;
  label: string;
  routeExists: boolean;
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  searchTerm?: string;
  setSearchTerm?: (v: string) => void;
  currentPage?: string; // ex.: "vendas/orcamentos/novo"
}

/********************
 * Componente
 ********************/
export default function Header({
  title,
  subtitle,
  searchTerm = "",
  setSearchTerm,
  currentPage = "",
}: HeaderProps) {
  const navigate = useNavigate();
  const { resolved, toggle } = useTheme();

  const [notifications, setNotifications] = useState(3);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 900);
  };

  const showBack = currentPage !== "dashboard";
  const canGoBack = (window.history?.state?.idx ?? 0) > 0;
  const handleBack = () => (canGoBack ? navigate(-1) : navigate("/", { replace: true }));

  const ROUTE_LABELS: Record<string, string> = {
    "/": "Início",
    "/vendas": "Vendas",
    "/vendas/orcamentos": "Orçamentos",
    "/vendas/orcamentos/novo": "Novo",
    "/vendas/orcamentos/detalhe": "Detalhes",
    "/projetos": "Projetos",
    "/estoque": "BOM & Estoque",
    "/compras": "Compras",
    "/clientes": "Clientes",
    "/configuracoes": "Configurações",
  };

  const toTitle = (slug: string) =>
    slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const segments = useMemo(
    () =>
      currentPage && currentPage !== "dashboard" && currentPage !== "/"
        ? currentPage.split("/").filter(Boolean)
        : [],
    [currentPage]
  );

  const crumbs: BreadcrumbItem[] = [];
  let acc = "";
  for (let i = 0; i < segments.length; i++) {
    acc += `/${segments[i]}`;
    const label = ROUTE_LABELS[acc] ?? toTitle(segments[i]);
    crumbs.push({ path: acc, label, routeExists: true });
  }

  const searchPlaceholder = useMemo(() => {
    switch (currentPage) {
      case "vendas/orcamentos":
      case "orcamentos":
        return "Buscar orçamentos...";
      case "projetos":
        return "Buscar projetos...";
      default:
        return "Buscar...";
    }
  }, [currentPage]);

  return (
    <header className="border-b border-border bg-card shadow-sm p-4 flex items-center justify-between backdrop-blur-md">
      {/* ESQUERDA: Voltar + Título + Breadcrumb */}
      <div className="flex flex-col gap-1 min-w-0">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center mt-1 text-xs ml-12">
          <ol className="flex items-center flex-wrap gap-1 text-muted-foreground">
            {/* Home */}
            <li>
              <button
                onClick={() => navigate("/")}
                className="hover:text-fg transition-colors"
              >
                {ROUTE_LABELS["/"]}
              </button>
            </li>

            {crumbs.map((c, idx) => {
              const isLast = idx === crumbs.length - 1;
              return (
                <React.Fragment key={`${idx}-${c.path}`}>
                  <ChevronRight size={14} className="text-muted-foreground" />
                  <li>
                    {isLast ? (
                      <span aria-current="page" className="text-fg">
                        {c.label}
                      </span>
                    ) : (
                      <button
                        onClick={() => navigate(c.path)}
                        className="hover:text-fg transition-colors cursor-pointer"
                      >
                        {c.label}
                      </button>
                    )}
                  </li>
                </React.Fragment>
              );
            })}
          </ol>
        </nav>

        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={handleBack}
              className="inline-flex items-center justify-center rounded-full p-2 transition-colors hover:bg-muted text-fg"
              title="Voltar"
              aria-label="Voltar"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <div className="min-w-0">
            <h2 className="text-xl font-semibold truncate text-fg">{title}</h2>
            {subtitle && (
              <p className="text-sm truncate text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* DIREITA: Ações */}
      <div className="flex items-center gap-4">
        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className={`p-2 rounded-full transition-all hover:bg-muted ${isRefreshing ? "animate-spin" : ""
            }`}
          title="Atualizar"
          aria-label="Atualizar"
        >
          <RefreshCw className="text-muted-foreground" size={18} />
        </button>

        {/* Busca */}
        <div className="relative hidden md:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm?.(e.target.value)}
            className="bg-muted/60 border border-input text-fg placeholder:text-muted-foreground rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-64 transition-colors"
          />
        </div>

        {/* Tema */}
        <button
          onClick={toggle}
          className="p-2 rounded-full transition-colors hover:bg-muted"
          title={resolved === "dark" ? "Tema claro" : "Tema escuro"}
          aria-label="Trocar tema"
        >
          {resolved === "dark" ? (
            <Sun className="text-yellow-400" size={18} />
          ) : (
            <Moon className="text-muted-foreground" size={18} />
          )}
        </button>

        {/* Notificações */}
        <button
          className="relative p-2 rounded-full hover:bg-muted"
          onClick={() => setNotifications(0)}
          title="Notificações"
          aria-label="Notificações"
        >
          <Bell className="text-fg" size={20} />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 h-5 min-w-[1.25rem] rounded-full bg-primary text-primary-foreground text-[10px] leading-5 flex items-center justify-center font-medium">
              {notifications}
            </span>
          )}
        </button>

        {/* Usuário */}
        <div className="flex items-center gap-3 border-l border-border pl-4">
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold">
            AD
          </div>
          <div>
            <p className="font-semibold text-sm text-fg">Administrador</p>
            <p className="text-xs text-muted-foreground">admin@empresa.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}
