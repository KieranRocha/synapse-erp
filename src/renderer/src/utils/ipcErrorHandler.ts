// Error handling utilities for IPC operations
export class IPCError extends Error {
  constructor(
    message: string,
    public code?: string,
    public channel?: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'IPCError'
  }
}

export interface IPCErrorInfo {
  message: string
  code?: string
  channel?: string
  timestamp: string
  userFriendly: string
}

// Error categorization and user-friendly messages
export class IPCErrorHandler {
  private static errorMap: Record<string, string> = {
    // Database errors
    'connection failed': 'Erro de conexão com o banco de dados',
    'timeout': 'Operação demorou muito para responder',
    'unique constraint': 'Este registro já existe',
    'not found': 'Registro não encontrado',
    
    // Validation errors
    'validation failed': 'Dados inválidos fornecidos',
    'required field': 'Campos obrigatórios não preenchidos',
    'invalid format': 'Formato de dados inválido',
    
    // Business logic errors
    'já existe': 'Este cliente já está cadastrado',
    'não encontrado': 'Cliente não encontrado',
    'permissão negada': 'Você não tem permissão para esta operação',
    
    // System errors
    'internal error': 'Erro interno do sistema',
    'service unavailable': 'Serviço temporariamente indisponível'
  }

  static handle(error: Error, channel?: string): IPCErrorInfo {
    const errorInfo: IPCErrorInfo = {
      message: error.message,
      code: this.extractErrorCode(error),
      channel,
      timestamp: new Date().toISOString(),
      userFriendly: this.getUserFriendlyMessage(error)
    }

    // Log error for debugging
    console.error('🚨 IPC Error:', errorInfo)

    return errorInfo
  }

  private static extractErrorCode(error: Error): string | undefined {
    // Try to extract error code from different sources
    if ('code' in error) return (error as any).code
    if ('errno' in error) return (error as any).errno
    if (error.message.includes('UNIQUE constraint')) return 'UNIQUE_CONSTRAINT'
    if (error.message.includes('NOT NULL')) return 'NOT_NULL_CONSTRAINT'
    return undefined
  }

  private static getUserFriendlyMessage(error: Error): string {
    const message = error.message.toLowerCase()

    // Check for known patterns
    for (const [pattern, friendlyMessage] of Object.entries(this.errorMap)) {
      if (message.includes(pattern.toLowerCase())) {
        return friendlyMessage
      }
    }

    // Default messages based on error types
    if (error.name === 'ZodError') {
      return 'Por favor, verifique os dados informados'
    }

    if (message.includes('network') || message.includes('connection')) {
      return 'Problema de conexão. Tente novamente.'
    }

    if (message.includes('timeout')) {
      return 'A operação demorou muito. Tente novamente.'
    }

    if (message.includes('permission') || message.includes('unauthorized')) {
      return 'Você não tem permissão para esta ação'
    }

    // Generic fallback
    return 'Ocorreu um erro inesperado. Tente novamente ou contate o suporte.'
  }

  // Retry logic for transient errors
  static shouldRetry(error: Error): boolean {
    const message = error.message.toLowerCase()
    
    const retryableErrors = [
      'timeout',
      'network',
      'connection',
      'temporary',
      'unavailable'
    ]

    return retryableErrors.some(pattern => message.includes(pattern))
  }

  // Get appropriate action for error
  static getRecommendedAction(error: Error): string {
    const message = error.message.toLowerCase()

    if (message.includes('já existe') || message.includes('unique')) {
      return 'Verifique se não há duplicatas e tente novamente'
    }

    if (message.includes('não encontrado') || message.includes('not found')) {
      return 'Verifique se o registro ainda existe'
    }

    if (message.includes('validation') || message.includes('invalid')) {
      return 'Corrija os dados do formulário'
    }

    if (this.shouldRetry(error)) {
      return 'Tente novamente em alguns instantes'
    }

    return 'Contate o suporte se o problema persistir'
  }
}

// Wrapper function for IPC calls with error handling
export async function safeIPCCall<T>(
  operation: () => Promise<T>,
  options?: {
    retries?: number
    retryDelay?: number
    onError?: (error: IPCErrorInfo) => void
    channel?: string
  }
): Promise<T> {
  const { retries = 1, retryDelay = 1000, onError, channel } = options || {}

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      const errorInfo = IPCErrorHandler.handle(lastError, channel)
      
      // Call error handler if provided
      onError?.(errorInfo)

      // Don't retry on last attempt or if error is not retryable
      if (attempt === retries || !IPCErrorHandler.shouldRetry(lastError)) {
        throw lastError
      }

      // Wait before retry
      if (retryDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }
  }

  throw lastError
}

// Toast notification helper for IPC errors
export function showIPCErrorToast(error: Error, channel?: string) {
  const errorInfo = IPCErrorHandler.handle(error, channel)
  
  // Use your toast library here (sonner, react-hot-toast, etc.)
  // Example with sonner (which is already in your dependencies):
  if (typeof window !== 'undefined' && 'toast' in window) {
    (window as any).toast.error(errorInfo.userFriendly, {
      description: IPCErrorHandler.getRecommendedAction(error),
      duration: 5000
    })
  } else {
    // Fallback to console
    console.error('Toast not available:', errorInfo)
  }
}