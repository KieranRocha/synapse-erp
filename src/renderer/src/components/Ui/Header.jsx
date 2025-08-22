import React, { useState } from 'react'
import { Search, Bell, RefreshCw, Sun, Moon } from 'lucide-react'
import PropTypes from 'prop-types'

/**
 * Header persistente do ERP
 * Props:
 *  - title: string
 *  - subtitle: string
 *  - searchTerm: string
 *  - setSearchTerm: func
 *  - isDark: bool
 *  - setIsDark: func
 *  - currentPage: string (usado para placeholder dinâmico)
 */
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

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const getSearchPlaceholder = () => {
    switch (currentPage) {
      case 'orcamentos':
        return 'Buscar orçamentos...'
      case 'projetos':
        return 'Buscar projetos...'
      default:
        return 'Buscar...'
    }
  }

  return (
    <header
      className={`${isDark ? 'border-gray-700 bg-neutral-900/80' : 'border-gray-200 bg-white/80'} 
                border-b shadow-sm p-4 flex items-center justify-between 
                backdrop-blur-md`}
    >
      <div>
        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {title}
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className={`p-2 rounded-full transition-all ${
            isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          } ${isRefreshing ? 'animate-spin' : ''}`}
          title="Atualizar"
        >
          <RefreshCw className={isDark ? 'text-gray-400' : 'text-gray-600'} size={18} />
        </button>

        {/* Busca */}
        <div className="relative hidden md:block">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              isDark ? 'text-gray-400' : 'text-gray-400'
            }`}
            size={18}
          />
          <input
            type="text"
            placeholder={getSearchPlaceholder()}
            value={searchTerm}
            onChange={(e) => setSearchTerm?.(e.target.value)}
            className={`${
              isDark ? ' border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-200 '
            } border rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-colors`}
          />
        </div>

        {/* Tema */}
        <button
          onClick={() => setIsDark?.(!isDark)}
          className={`p-2 rounded-full transition-colors ${
            isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          }`}
          title={isDark ? 'Tema claro' : 'Tema escuro'}
        >
          {isDark ? (
            <Sun className="text-yellow-400" size={18} />
          ) : (
            <Moon className="text-gray-600" size={18} />
          )}
        </button>

        {/* Notificações */}
        <button
          className={`relative p-2 rounded-full  ${
            isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          }`}
          onClick={() => setNotifications(0)}
          title="Notificações"
        >
          <Bell className={isDark ? 'text-gray-400' : 'text-gray-600'} size={20} />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              {notifications}
            </span>
          )}
        </button>

        {/* Usuário */}
        <div
          className={`flex items-center gap-3 border-l ${isDark ? 'border-gray-700' : 'border-gray-200'} pl-4`}
        >
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
            AD
          </div>
          <div>
            <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Administrador
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              admin@empresa.com
            </p>
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
