export type Severity = 'info' | 'warning' | 'error'

export interface AppError {
  code: string
  message: string
  details?: unknown
  traceId?: string
  severity: Severity
  retryable?: boolean
}

export interface BackendErrorShape {
  code?: string
  message?: string
  messageKey?: string
  details?: unknown
  traceId?: string
  status?: number
}

