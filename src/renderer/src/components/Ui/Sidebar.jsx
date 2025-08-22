// components/Ui/Sidebar.tsx
import React from 'react'
import {
  LayoutDashboard,
  FileText,
  Wrench,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Factory,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useUIStore } from '../../store/uiStore'

function NavItem({ icon: Icon, text, to, badge, end = false, isDark, collapsed }) {
  return (
    <NavLink
      to={to}
      {...(end ? { end: true } : {})}
      className={({ isActive }) => {
        const base =
          'group w-full flex items-center gap-3 px-3 py-2 rounded-xl transition outline-none'

        const inactive = isDark
          ? 'text-neutral-300 hover:bg-neutral-800 hover:text-neutral-50'
          : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
        const activeCls = isDark
          ? 'bg-neutral-800 text-neutral-50'
          : 'bg-neutral-200 text-neutral-900'
        return `${base} ${isActive ? activeCls : inactive}`
      }}
      title={collapsed ? text : undefined} // tooltip quando colapsada
      aria-label={text}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {/* Esconde o texto quando colapsada */}
      <span
        className={`text-sm whitespace-nowrap transition-all ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}
      >
        {text}
      </span>
      {badge && !collapsed && (
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium ${isDark ? 'bg-neutral-100 text-neutral-900' : 'bg-neutral-900 text-neutral-100'}`}
        >
          {badge}
        </span>
      )}
    </NavLink>
  )
}

export default function Sidebar({
  isDark = true,
  projetos = [],
  orcamentos = [],
  basePath = '',
  className = '',
  collapsed = false // 👈 nova prop
}) {
  const prefix = basePath.replace(/\/$/, '')
  const { toggleSidebar } = useUIStore()

  const projetosAtivos = Array.isArray(projetos)
    ? projetos.filter((p) => ['producao', 'instalacao'].includes(p.status)).length
    : 0

  const orcamentosBadge = Array.isArray(orcamentos)
    ? orcamentos.filter((o) => ['analise', 'pendente'].includes(o.status)).length
    : 0

  const items = [
    { key: 'dashboard', text: 'Dashboard', icon: LayoutDashboard, to: `${prefix}/`, end: true },
    {
      key: 'orcamentos',
      text: 'Orçamentos',
      icon: FileText,
      to: `/vendas/orcamentos`,
      badge: orcamentosBadge || undefined
    },
    {
      key: 'projetos',
      text: 'Projetos',
      icon: Wrench,
      to: `${prefix}/projetos`,
      badge: projetosAtivos ? String(projetosAtivos) : undefined
    },
    { key: 'estoque', text: 'BOM & Estoque', icon: Package, to: `${prefix}/estoque` },
    { key: 'compras', text: 'Compras', icon: ShoppingCart, to: `${prefix}/compras` },
    { key: 'clientes', text: 'Clientes', icon: Users, to: `${prefix}/clientes` }
  ]

  return (
    <aside
      className={`h-full ${collapsed ? 'w-16' : 'w-64'} flex-shrink-0 p-4 border-r
                  ${
                    isDark
                      ? 'bg-neutral-900 text-neutral-100 border-neutral-800'
                      : 'bg-white text-neutral-900 border-neutral-200'
                  }
                  transition-[width] duration-200 ease-in-out flex flex-col ${className}`}
    >
      {/* Logo */}
      <div className="flex items-center mb-6 px-2 select-none">
        <Factory className={`h-6 w-6 ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`} />
        {!collapsed && <h1 className="text-lg font-semibold">ERP Máquinas</h1>}
      </div>

      {/* Navegação principal */}
      <nav className="flex-grow space-y-2">
        {items.map((item) => (
          <NavItem key={item.key} {...item} isDark={isDark} collapsed={collapsed} />
        ))}
      </nav>

      {/* Rodapé */}
      <div className={`pt-4 mt-4 border-t ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
        <NavItem
          icon={Settings}
          text="Configurações"
          to={`${prefix}/configuracoes`}
          isDark={isDark}
          collapsed={collapsed}
        />
      </div>
    </aside>
  )
}

Sidebar.propTypes = {
  isDark: PropTypes.bool,
  projetos: PropTypes.array,
  orcamentos: PropTypes.array,
  basePath: PropTypes.string,
  className: PropTypes.string,
  collapsed: PropTypes.bool
}
