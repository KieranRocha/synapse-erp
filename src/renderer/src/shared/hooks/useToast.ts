import { toast } from 'sonner'
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react'
import React from 'react'

// Tipos para o toast
type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastOptions {
  duration?: number
  closeButton?: boolean

  position?:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top-center'
    | 'bottom-center'
}

interface ToastConfig {
  icon: React.ReactElement
  iconColor: string
  backgroundColor: string
  borderColor: string
  textColor?: string
}

// Configurações para cada tipo de toast
const toastConfigs: Record<ToastType, ToastConfig> = {
  success: {
    icon: React.createElement(CheckCircle2, { className: 'w-4 h-4' }),
    iconColor: 'text-emerald-500',
    backgroundColor: 'rgba(16, 185, 129, 0.5)',
    borderColor: 'rgb(16, 185, 129)',
    textColor: '#fff'
  },
  error: {
    icon: React.createElement(XCircle, { className: 'w-4 h-4' }),
    iconColor: 'text-red-400',
    backgroundColor: 'rgba(239, 68, 68, 0.5)',
    borderColor: 'rgb(239, 68, 68)',
    textColor: '#fff'
  },
  warning: {
    icon: React.createElement(AlertTriangle, { className: 'w-4 h-4' }),
    iconColor: 'text-yellow-500',
    backgroundColor: 'rgba(245, 158, 11, 0.5)',
    borderColor: 'rgb(245, 158, 11)',
    textColor: '#fff'
  },
  info: {
    icon: React.createElement(Info, { className: 'w-4 h-4' }),
    iconColor: 'text-blue-500',
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
    borderColor: 'rgb(59, 130, 246)',
    textColor: '#fff'
  }
}

// Configurações padrão
const defaultOptions: ToastOptions = {
  duration: 4000,
  closeButton: true,
  position: 'top-right'
}

export function useToast() {
  const showToast = (type: ToastType, message: string, options: ToastOptions = {}) => {
    const config = toastConfigs[type]
    const finalOptions = { ...defaultOptions, ...options }

    // Clone do ícone com a cor correta
    const iconWithColor = React.cloneElement(config.icon, {
      className: `w-4 h-4 ${config.iconColor}`
    })

    const toastStyle = {
      backgroundColor: config.backgroundColor,
      color: config.textColor, // text-gray-800
      border: `1px solid ${config.borderColor}`,
      backdropFilter: 'blur(8px)',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    }

    const toastFunction = {
      success: toast.success,
      error: toast.error,
      warning: toast.warning,
      info: toast.info
    }[type]

    return toastFunction(message, {
      position: finalOptions.position,
      icon: iconWithColor,
      duration: finalOptions.duration,
      closeButton: finalOptions.closeButton,
      style: toastStyle,
      classNames: {
        closeButton: 'hover:!bg-gray-200 !bg-gray-100 !text-gray-600 transition-colors',
        toast: 'backdrop-blur-md'
      }
    })
  }

  return {
    success: (message: string, options?: ToastOptions) => showToast('success', message, options),

    error: (message: string, options?: ToastOptions) => showToast('error', message, options),

    warning: (message: string, options?: ToastOptions) => showToast('warning', message, options),

    info: (message: string, options?: ToastOptions) => showToast('info', message, options),

    // Método genérico
    show: showToast
  }
}

// Hook simplificado para compatibilidade
export const useToastStore = () => {
  const toast = useToast()
  return toast.success // Retorna apenas success para compatibilidade
}

// Hook para configurações globais
export const configureToast = (options: Partial<ToastOptions>) => {
  Object.assign(defaultOptions, options)
}
