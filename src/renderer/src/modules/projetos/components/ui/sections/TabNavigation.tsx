import React from 'react'
import { 
  FileText, 
  Package, 
  DollarSign, 
  BarChart3, 
  FolderOpen,
  History,
  LucideIcon
} from 'lucide-react'
import type { TabType } from '../../types/projetoTypes'

interface Tab {
  id: TabType
  label: string
  icon: LucideIcon
  badge?: string | number
}

interface TabNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  badges?: Partial<Record<TabType, string | number>>
  className?: string
}

const tabs: Tab[] = [
  { id: 'geral', label: 'Informações Gerais', icon: FileText },
  { id: 'itens', label: 'Itens & Escopo', icon: Package },
  { id: 'financeiro', label: 'Financeiro & Impostos', icon: DollarSign },
  { id: 'analise', label: 'Análise & Relatórios', icon: BarChart3 },
  { id: 'documentos', label: 'Documentos', icon: FolderOpen },
  { id: 'historico', label: 'Histórico', icon: History }
]

export function TabNavigation({
  activeTab,
  onTabChange,
  badges = {},
  className = ''
}: TabNavigationProps) {
  return (
    <div className={`${className} mb-4`}>
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const badge = badges[tab.id]
          const Icon = tab.icon

          return (
            <div key={tab.id} className="flex items-center">
              <button
                onClick={() => onTabChange(tab.id)}
                className={`
                  cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition whitespace-nowrap
                  ${isActive 
                    ? 'badge-analise' 
                    : 'border-border text-fg hover:bg-muted'
                  }
                `}
                title={tab.label}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                
                {badge && (
                  <span className={`
                    inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-medium rounded-full
                    ${isActive
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {badge}
                  </span>
                )}
              </button>
              
              {tabs.indexOf(tab) < tabs.length - 1 && (
                <div className="mx-2 h-px w-8 sm:w-12 bg-border/60" />
              )}
            </div>
          )
        })}
      </div>
      
      <div className="mt-2 h-1 rounded-full bg-muted">
        <div 
          className="h-full rounded-full bg-fg transition-all" 
          style={{ 
            width: `${((tabs.findIndex(t => t.id === activeTab) + 1) / tabs.length) * 100}%` 
          }} 
        />
      </div>
    </div>
  )
}