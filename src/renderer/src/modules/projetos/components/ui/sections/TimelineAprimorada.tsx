import React from 'react'
import { Calendar, Clock, CheckCircle, AlertTriangle, ArrowRight, Play, Target, Flag } from 'lucide-react'
import type { ProjetoDetalhado } from '../../types/projetoTypes'
import { formatDate, CHART_COLORS } from '../../../utils/chartUtils'

interface TimelineAprimoradaProps {
  projeto: ProjetoDetalhado
}

interface TimelineEvent {
  id: string
  title: string
  date: Date | null
  status: 'completed' | 'current' | 'upcoming' | 'overdue'
  icon: React.ReactNode
  description: string
  color: string
  bgColor: string
}

export function TimelineAprimorada({ projeto }: TimelineAprimoradaProps) {
  const today = new Date()

  const createTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = []

    // Projeto criado
    if (projeto.created_at) {
      events.push({
        id: 'created',
        title: 'Projeto Criado',
        date: projeto.created_at,
        status: 'completed',
        icon: <Play className="w-4 h-4" />,
        description: 'Projeto foi criado no sistema',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      })
    }

    // Data de início
    if (projeto.startDate) {
      const isOverdue = projeto.startDate < today && projeto.status === 'DRAFT'
      const isCurrent = projeto.startDate <= today && projeto.status !== 'DRAFT'
      const status = isOverdue ? 'overdue' : isCurrent ? 'completed' : 'upcoming'

      events.push({
        id: 'start',
        title: 'Início do Projeto',
        date: projeto.startDate,
        status,
        icon: <Play className="w-4 h-4" />,
        description: 'Data planejada para início dos trabalhos',
        color: status === 'overdue' ? 'text-red-600' : 
               status === 'completed' ? 'text-green-600' : 'text-orange-600',
        bgColor: status === 'overdue' ? 'bg-red-100' : 
                 status === 'completed' ? 'bg-green-100' : 'bg-orange-100'
      })
    }

    // Status enviado
    if (projeto.status === 'SENT' || projeto.status === 'APPROVED' || projeto.status === 'REJECTED') {
      events.push({
        id: 'sent',
        title: 'Proposta Enviada',
        date: projeto.updated_at, // Usando updated_at como aproximação
        status: 'completed',
        icon: <ArrowRight className="w-4 h-4" />,
        description: 'Proposta foi enviada para aprovação',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      })
    }

    // Status aprovado/rejeitado
    if (projeto.status === 'APPROVED') {
      events.push({
        id: 'approved',
        title: 'Proposta Aprovada',
        date: projeto.updated_at,
        status: 'completed',
        icon: <CheckCircle className="w-4 h-4" />,
        description: 'Cliente aprovou a proposta',
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      })
    } else if (projeto.status === 'REJECTED') {
      events.push({
        id: 'rejected',
        title: 'Proposta Rejeitada',
        date: projeto.updated_at,
        status: 'completed',
        icon: <AlertTriangle className="w-4 h-4" />,
        description: 'Cliente rejeitou a proposta',
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      })
    }

    // Data de entrega
    if (projeto.deliveryDate) {
      const isOverdue = projeto.deliveryDate < today && projeto.status !== 'APPROVED'
      const isCurrent = projeto.deliveryDate >= today && projeto.status === 'APPROVED'
      const isCompleted = projeto.status === 'APPROVED' && projeto.deliveryDate >= today
      
      let status: TimelineEvent['status'] = 'upcoming'
      if (isOverdue) status = 'overdue'
      else if (isCompleted) status = 'current'

      events.push({
        id: 'delivery',
        title: 'Entrega Prevista',
        date: projeto.deliveryDate,
        status,
        icon: <Target className="w-4 h-4" />,
        description: 'Data prevista para entrega do projeto',
        color: status === 'overdue' ? 'text-red-600' : 
               status === 'current' ? 'text-green-600' : 'text-purple-600',
        bgColor: status === 'overdue' ? 'bg-red-100' : 
                 status === 'current' ? 'bg-green-100' : 'bg-purple-100'
      })
    }

    return events.sort((a, b) => {
      if (!a.date) return 1
      if (!b.date) return -1
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })
  }

  const events = createTimelineEvents()

  const getProgressPercentage = (): number => {
    if (events.length === 0) return 0
    
    const completedEvents = events.filter(e => e.status === 'completed').length
    return Math.round((completedEvents / events.length) * 100)
  }

  const getNextMilestone = () => {
    return events.find(e => e.status === 'upcoming' || e.status === 'current')
  }

  const getDaysUntilNext = () => {
    const next = getNextMilestone()
    if (!next || !next.date) return null
    
    const diffTime = new Date(next.date).getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const progress = getProgressPercentage()
  const nextMilestone = getNextMilestone()
  const daysUntilNext = getDaysUntilNext()

  return (
    <div className="space-y-6">
      {/* Cards de Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border-border rounded-2xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs opacity-70">Progresso Geral</p>
              <p className="text-lg font-semibold text-fg">{progress}%</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex-1 bg-muted rounded-full h-2">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-card border-border rounded-2xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs opacity-70">Próximo Marco</p>
              <p className="text-sm font-semibold text-fg truncate">
                {nextMilestone?.title || 'Nenhum'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border-border rounded-2xl border p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${
              daysUntilNext === null ? 'bg-gray-500/20 text-gray-600' :
              daysUntilNext < 0 ? 'bg-red-500/20 text-red-600' :
              daysUntilNext <= 7 ? 'bg-orange-500/20 text-orange-600' :
              'bg-green-500/20 text-green-600'
            }`}>
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs opacity-70">Prazo</p>
              <p className="text-lg font-semibold text-fg">
                {daysUntilNext === null ? '—' :
                 daysUntilNext < 0 ? 'Atrasado' :
                 daysUntilNext === 0 ? 'Hoje' :
                 `${daysUntilNext} dias`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Visual */}
      <section className="bg-card border-border rounded-2xl border p-6">
        <div className="flex items-center gap-2 pb-4 border-b border-border mb-6">
          <div className="p-1 rounded-lg bg-purple-500/20">
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-fg">Timeline do Projeto</h3>
        </div>

        {events.length > 0 ? (
          <div className="relative">
            {/* Linha principal */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-green-200"></div>

            <div className="space-y-6">
              {events.map((event, index) => (
                <div key={event.id} className="relative flex items-start gap-4 group">
                  {/* Ícone do evento */}
                  <div className={`
                    relative z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center
                    transition-all duration-300 group-hover:scale-110
                    ${event.status === 'completed' ? 'bg-green-100 border-green-300 text-green-600' :
                      event.status === 'current' ? 'bg-blue-100 border-blue-300 text-blue-600' :
                      event.status === 'overdue' ? 'bg-red-100 border-red-300 text-red-600' :
                      'bg-gray-100 border-gray-300 text-gray-600'}
                  `}>
                    {event.icon}
                  </div>

                  {/* Conteúdo do evento */}
                  <div className="flex-1 min-w-0 pb-6">
                    <div className={`
                      p-4 rounded-xl border transition-all duration-300 group-hover:shadow-md
                      ${event.status === 'completed' ? 'bg-green-50 border-green-200' :
                        event.status === 'current' ? 'bg-blue-50 border-blue-200' :
                        event.status === 'overdue' ? 'bg-red-50 border-red-200' :
                        'bg-gray-50 border-gray-200'}
                    `}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-semibold ${event.color}`}>
                          {event.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          {event.status === 'completed' && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                          {event.status === 'overdue' && (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          )}
                          {event.status === 'current' && (
                            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-fg opacity-80 mb-2">
                        {event.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs opacity-70">
                          {formatDate(event.date)}
                        </span>
                        
                        {event.status === 'current' && daysUntilNext !== null && (
                          <span className={`text-xs px-2 py-1 rounded-full ${event.bgColor} ${event.color}`}>
                            {daysUntilNext === 0 ? 'Hoje' : 
                             daysUntilNext > 0 ? `Em ${daysUntilNext} dias` : 
                             `${Math.abs(daysUntilNext)} dias atrás`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Marco final */}
            <div className="relative flex items-center gap-4 mt-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white">
                <Flag className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-fg">Projeto Finalizado</h4>
                <p className="text-sm opacity-70">
                  Entrega completa e encerramento do projeto
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma data informada para este projeto</p>
          </div>
        )}
      </section>

      {/* Resumo de Datas */}
      <section className="bg-card border-border rounded-2xl border p-6">
        <div className="flex items-center gap-2 pb-4 border-b border-border mb-4">
          <div className="p-1 rounded-lg bg-indigo-500/20">
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-fg">Resumo de Datas</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/20 rounded-xl">
              <span className="text-sm opacity-70">Criado em:</span>
              <span className="font-medium text-fg">{formatDate(projeto.created_at)}</span>
            </div>
            
            {projeto.startDate && (
              <div className="flex justify-between items-center p-3 bg-muted/20 rounded-xl">
                <span className="text-sm opacity-70">Início previsto:</span>
                <span className="font-medium text-fg">{formatDate(projeto.startDate)}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/20 rounded-xl">
              <span className="text-sm opacity-70">Última atualização:</span>
              <span className="font-medium text-fg">{formatDate(projeto.updated_at)}</span>
            </div>
            
            {projeto.deliveryDate && (
              <div className="flex justify-between items-center p-3 bg-muted/20 rounded-xl">
                <span className="text-sm opacity-70">Entrega prevista:</span>
                <span className="font-medium text-fg">{formatDate(projeto.deliveryDate)}</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}