import React, { useState } from 'react'
import { Search, Bell, RefreshCw, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'

// Define the type for breadcrumb items
interface BreadcrumbItem {
  path: string
  label: string
  routeExists: boolean
}

export default function Header({
  title,
  subtitle,
  searchTerm,
  setSearchTerm,
  isDark,
  setIsDark,
  currentPage
}) {
  const [notifications, setNotifications] = useState(3)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const navigate = useNavigate()

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const getSearchPlaceholder = () => {
    switch (currentPage) {
      case 'vendas/orcamentos':
      case 'orcamentos':
        return 'Buscar orçamentos...'
      case 'projetos':
        return 'Buscar projetos...'
      default:
        return 'Buscar...'
    }
  }

  // Voltar
  const showBack = currentPage !== 'dashboard'
  const canGoBack = (window.history?.state?.idx ?? 0) > 0
  const handleBack = () => (canGoBack ? navigate(-1) : navigate('/', { replace: true }))

  // ===== Breadcrumb clicável =====
  const ROUTE_LABELS = {
    '/': 'Início',
    '/vendas': 'Vendas', // sem rota real → apenas rótulo
    '/vendas/orcamentos': 'Orçamentos',
    '/vendas/orcamentos/novo': 'Novo',
    '/vendas/orcamentos/detalhe': 'Detalhes',
    '/projetos': 'Projetos',
    '/estoque': 'BOM & Estoque',
    '/compras': 'Compras',
    '/clientes': 'Clientes',
    '/configuracoes': 'Configurações'
  }

  const toTitle = (slug: string) =>
    slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())

  const segments =
    currentPage && currentPage !== 'dashboard' && currentPage !== '/'
      ? currentPage.split('/').filter(Boolean)
      : []

  const crumbs: BreadcrumbItem[] = []
  let acc = ''
  for (let i = 0; i < segments.length; i++) {
    acc += `/${segments[i]}`
    const label = ROUTE_LABELS[acc as keyof typeof ROUTE_LABELS] ?? toTitle(segments[i])
    crumbs.push({ path: acc, label, routeExists: true })
  }

  // Debug info
  console.log('Breadcrumb Debug:', { currentPage, segments, crumbs })

  return (
    <header
      className={`${isDark ? 'border-gray-700 bg-neutral-900/80' : 'border-gray-200 bg-white/80'} 
                  border-b shadow-sm p-4 flex items-center justify-between 
                  backdrop-blur-md`}
    >
      {/* ESQUERDA: Voltar + Título + Breadcrumb */}
      <div className="flex flex-col gap-1 min-w-0 ">
        <nav aria-label="Breadcrumb" className="flex items-center mt-1 text-xs ml-12">
          <ol className="flex items-center flex-wrap gap-1">
            {/* Home (sempre clicável) */}
            <li>
              <button
                onClick={() => navigate('/')}
                className={`${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
              >
                {ROUTE_LABELS['/']}
              </button>
            </li>




            {crumbs.map((c, idx) => {
              const isLast = idx === crumbs.length - 1

              return (
                <React.Fragment key={`${idx}-${c.path}`}>
                  <ChevronRight size={14} className={`${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <li>
                    {isLast ? (
                      <span
                        aria-current="page"
                        className={`${isDark ? 'text-gray-200' : 'text-gray-800'}`}
                      >
                        {c.label}
                      </span>
                    ) : (
                      <button
                        onClick={() => navigate(c.path)}
                        className={`${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors  cursor-pointer`}
                      >
                        {c.label}
                      </button>
                    )}
                  </li>
                </React.Fragment>
              )
            })}
          </ol>
        </nav>
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={handleBack}
              className={`inline-flex items-center justify-center rounded-full p-2 transition-colors
                         ${isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
              title="Voltar"
              aria-label="Voltar"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <div className="min-w-0">
            <h2 className={`text-xl font-semibold truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {title}
            </h2>
            <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>
          </div>
        </div>

        {/* Breadcrumb */}

      </div>

      {/* DIREITA: Ações */}
      <div className="flex items-center gap-4">
        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className={`p-2 rounded-full transition-all ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            } ${isRefreshing ? 'animate-spin' : ''}`}
          title="Atualizar"
          aria-label="Atualizar"
        >
          <RefreshCw className={isDark ? 'text-gray-400' : 'text-gray-600'} size={18} />
        </button>

        {/* Busca */}
        <div className="relative hidden md:block">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}
            size={18}
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder={getSearchPlaceholder()}
            value={searchTerm}
            onChange={(e) => setSearchTerm?.(e.target.value)}
            className={`${isDark ? 'border-gray-700 text-gray-300 bg-neutral-900' : 'bg-gray-100 border-gray-200 text-gray-700'
              } border rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-colors`}
          />
        </div>

        {/* Tema */}
        <button
          onClick={() => setIsDark?.(!isDark)}
          className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          title={isDark ? 'Tema claro' : 'Tema escuro'}
          aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
        >
          {isDark ? <Sun className="text-yellow-400" size={18} /> : <Moon className="text-gray-600" size={18} />}
        </button>

        {/* Notificações */}
        <button
          className={`relative p-2 rounded-full  ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          onClick={() => setNotifications(0)}
          title="Notificações"
          aria-label="Notificações"
        >
          <Bell className={isDark ? 'text-neutral-100' : 'text-gray-600'} size={20} />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-neutral-100 text-gray-500 text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              {notifications}
            </span>
          )}
        </button>

        {/* Usuário */}
        <div className={`flex items-center gap-3 border-l ${isDark ? 'border-gray-700' : 'border-gray-200'} pl-4`}>
          <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center text-gray-500 font-semibold">AD</div>
          <div>
            <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>Administrador</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>admin@empresa.com</p>
          </div>
        </div>
      </div>
    </header>
  )
}

Header.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  searchTerm: PropTypes.string,
  setSearchTerm: PropTypes.func,
  isDark: PropTypes.bool,
  setIsDark: PropTypes.func,
  currentPage: PropTypes.string
}
