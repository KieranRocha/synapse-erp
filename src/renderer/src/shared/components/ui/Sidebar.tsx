// components/Ui/Sidebar.tsx
import React from "react";
import {
  LayoutDashboard,
  FileText,
  Wrench,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Factory,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";
// mantém se for usar colapso global depois
import { useUIStore } from "../../store/uiStore";

type NavItemProps = {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  to: string;
  badge?: string | number;
  end?: boolean;
  collapsed?: boolean;
};

function NavItem({ icon: Icon, text, to, badge, end = false, collapsed }: NavItemProps) {
  return (
    <NavLink
      to={to}
      {...(end ? { end: true } : {})}
      title={collapsed ? text : undefined}
      aria-label={text}
      className={({ isActive }) => {
        const base =
          "group w-full flex items-center gap-3 px-3 py-2 rounded-lg transition outline-none border border-transparent";
        const inactive =
          // texto 70% + hover com muted/foreground via tokens
          "text-fg/70 hover:bg-fg/10 hover:text-fg";
        const active =
          // realce com mix do primary + leve ring na cor de foco
          "bg-fg/20 text-fg ";
        return `${base} ${isActive ? active : inactive}`;
      }}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {/* Esconde o texto quando colapsada */}
      <span
        className={`text-sm whitespace-nowrap transition-all ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
          }`}
      >
        {text}
      </span>

      {badge && !collapsed && (
        // usa o sistema de badges do teu CSS (tokens)
        <span className="ml-auto badge badge-primary">{badge}</span>
      )}
    </NavLink>
  );
}

export default function Sidebar({
  projetos = [],
  orcamentos = [],
  basePath = "",
  className = "",
  collapsed = false,
}: {
  projetos?: Array<{ status?: string }>;
  orcamentos?: Array<{ status?: string }>;
  basePath?: string;
  className?: string;
  collapsed?: boolean;
}) {
  const prefix = basePath.replace(/\/$/, "");
  // reservado se quiser ligar com store global:
  const { toggleSidebar } = useUIStore();

  const projetosAtivos = Array.isArray(projetos)
    ? projetos.filter((p) => ["producao", "instalacao"].includes(`${p.status}`.toLowerCase())).length
    : 0;

  const orcamentosBadge = Array.isArray(orcamentos)
    ? orcamentos.filter((o) => ["analise", "pendente"].includes(`${o.status}`.toLowerCase())).length
    : 0;

  const items: Array<NavItemProps & { key: string }> = [
    { key: "dashboard", text: "Dashboard", icon: LayoutDashboard, to: `${prefix}/`, end: true },
    {
      key: "orcamentos",
      text: "Orçamentos",
      icon: FileText,
      to: `/vendas/orcamentos`,
      badge: orcamentosBadge || undefined,
    },
    {
      key: "projetos",
      text: "Projetos",
      icon: Wrench,
      to: `${prefix}/projetos`,
      badge: projetosAtivos ? String(projetosAtivos) : undefined,
    },
    { key: "estoque", text: "BOM & Estoque", icon: Package, to: `${prefix}/estoque` },
    { key: "compras", text: "Compras", icon: ShoppingCart, to: `${prefix}/compras` },
    { key: "clientes", text: "Clientes", icon: Users, to: `${prefix}/clientes` },
  ];

  return (
    <aside
      className={[
        "h-full",
        collapsed ? "w-16" : "w-64",
        "flex-shrink-0 p-4 border-r transition-[width] duration-200 ease-in-out flex flex-col",
        // superfícies e bordas via tokens
        "bg-card text-fg border-border",
        className,
      ].join(" ")}
    >
      {/* Logo */}
      <div className="flex items-center mb-6 px-2 select-none">
        <Factory className="h-6 w-6" />
        {!collapsed && <h1 className="ml-2 text-lg font-semibold">ERP Máquinas</h1>}
      </div>

      {/* Navegação principal */}
      <nav className="flex-grow space-y-2">
        {items.map((item) => {
          const { key, ...itemProps } = item;
          return <NavItem key={key} {...itemProps} collapsed={collapsed} />;
        })}
      </nav>

      {/* Rodapé */}
      <div className="pt-4 mt-4 border-t border-border">
        <NavItem icon={Settings} text="Configurações" to={`${prefix}/configuracoes`} collapsed={collapsed} />
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  projetos: PropTypes.array,
  orcamentos: PropTypes.array,
  basePath: PropTypes.string,
  className: PropTypes.string,
  collapsed: PropTypes.bool,
};
