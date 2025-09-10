import React from 'react'
import {
  Edit,
  Copy,
  Share2,
  FileDown,
  CheckCircle,
  Clock3,
  AlertCircle,
  XCircle,
  Archive,
  Send
} from 'lucide-react'
import type { ProjetoDetalhado } from '../../types/projetoTypes'

interface ProjetoHeaderProps {
  projeto: ProjetoDetalhado
  onEdit?: () => void
  onDuplicate?: () => void
  onArchive?: () => void
  onExport?: () => void
  onShare?: () => void
}

export function ProjetoHeader({
  projeto,
  onEdit,
  onDuplicate,
  onArchive,
  onExport,
  onShare
}: ProjetoHeaderProps) {
  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return {
          icon: Edit,
          color: 'bg-orange-500/20 text-orange-600 border-orange-500/30',
          label: 'Rascunho'
        }
      case 'SENT':
        return {
          icon: Send,
          color: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
          label: 'Enviado'
        }
      case 'APPROVED':
        return {
          icon: CheckCircle,
          color: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
          label: 'Aprovado'
        }
      case 'REJECTED':
        return {
          icon: XCircle,
          color: 'bg-red-500/20 text-red-600 border-red-500/30',
          label: 'Rejeitado'
        }
      case 'ARCHIVED':
        return {
          icon: Archive,
          color: 'bg-neutral-500/20 text-neutral-600 border-neutral-500/30',
          label: 'Arquivado'
        }
      default:
        return {
          icon: AlertCircle,
          color: 'bg-neutral-500/20 text-neutral-600 border-neutral-500/30',
          label: status
        }
    }
  }

  const statusConfig = getStatusConfig(projeto.status)
  const StatusIcon = statusConfig.icon

  return (
    <div className="bg-bg p-4">
      <div className="flex items-center justify-between">

        {/* Informações básicas */}
        <div className="flex items-center gap-6">
          <div>
            <div className='flex gap-4 justify-center items-center'>
              <h1 className="text-4xl font-bold text-fg capitalize">
                {projeto.name}
              </h1>
              <div>
                <div className={`inline-flex items-center px-2 py-1 rounded-xl text-xs font-medium border ${statusConfig.color}`}>
                  {statusConfig.label}
                </div>

              </div>

            </div>
            <p className="text-xs opacity-70 mt-1">
              #{projeto.numero}
            </p>

            <div className="flex items-center gap-4 mt-1">
              <span className="text-sm opacity-70">
                Total: <strong className="text-emerald-600">{formatCurrency(projeto.totalFinal)}</strong>
              </span>
              {projeto.margemLiquida && (
                <span className="text-sm opacity-70">
                  Margem: <strong className={
                    projeto.margemLiquida > 20 ? 'text-emerald-600' :
                      projeto.margemLiquida > 10 ? 'text-orange-600' : 'text-red-600'
                  }>{projeto.margemLiquida.toFixed(1)}%</strong>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">


          </div>


        </div>

        {/* Ações */}
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border badge badge-analise  rounded-lg hover:bg-muted transition-colors"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>

          <button
            onClick={onDuplicate}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Copy className="w-4 h-4" />
            Duplicar
          </button>

          <button
            onClick={onShare}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Compartilhar
          </button>

          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-emerald-500/30  text-emerald-600 rounded-lg hover:bg-muted transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>
    </div>
  )
}