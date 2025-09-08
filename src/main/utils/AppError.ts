import { ErrorCode } from './ErrorCodes'

export type Severity = 'info' | 'warning' | 'error'

export interface AppErrorData {
  code: ErrorCode
  message?: string
  details?: unknown
  traceId?: string
  severity?: Severity
  retryable?: boolean
  status?: number
}

export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly details?: unknown
  public readonly traceId: string
  public readonly severity: Severity
  public readonly retryable: boolean
  public readonly status: number

  constructor(data: AppErrorData) {
    // Use a message or fallback to code
    super(data.message || data.code)
    
    this.name = 'AppError'
    this.code = data.code
    this.details = data.details
    this.traceId = data.traceId || this.generateTraceId()
    this.severity = data.severity || this.getDefaultSeverity(data.code)
    this.retryable = data.retryable || this.getDefaultRetryable(data.code)
    this.status = data.status || this.getDefaultStatus(data.code)

    // Ensure proper prototype chain
    Object.setPrototypeOf(this, AppError.prototype)
  }

  private generateTraceId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private getDefaultSeverity(code: ErrorCode): Severity {
    // Auth errors are usually warnings (user can fix)
    if (code.startsWith('AUTH_')) {
      if (code === ErrorCode.AUTH_API_UNAVAILABLE) return 'error'
      if (code === ErrorCode.AUTH_SESSION_EXPIRED) return 'info'
      return 'warning'
    }
    
    // Validation errors are warnings
    if (code.startsWith('VALIDATION_')) return 'warning'
    
    // Network/Server errors are errors
    if (code.startsWith('NETWORK_') || code.startsWith('SERVER_') || code.startsWith('DB_')) {
      return 'error'
    }
    
    // Default to error for safety
    return 'error'
  }

  private getDefaultRetryable(code: ErrorCode): boolean {
    // Network and server issues are usually retryable
    if (code.startsWith('NETWORK_') || code.startsWith('SERVER_') || code.startsWith('DB_')) {
      return true
    }
    
    // Some auth errors are retryable after waiting
    if (code === ErrorCode.AUTH_TOO_MANY_ATTEMPTS || code === ErrorCode.AUTH_ACCOUNT_LOCKED) {
      return true
    }
    
    // Most other errors are not retryable
    return false
  }

  private getDefaultStatus(code: ErrorCode): number {
    // Auth errors
    if (code === ErrorCode.AUTH_INVALID_CREDENTIALS || code === ErrorCode.AUTH_TOKEN_INVALID) {
      return 401
    }
    if (code === ErrorCode.PERMISSION_DENIED) {
      return 403
    }
    if (code === ErrorCode.NOT_FOUND) {
      return 404
    }
    if (code === ErrorCode.CONFLICT) {
      return 409
    }
    if (code === ErrorCode.UNPROCESSABLE || code.startsWith('VALIDATION_')) {
      return 422
    }
    if (code === ErrorCode.RATE_LIMITED || code === ErrorCode.AUTH_TOO_MANY_ATTEMPTS) {
      return 429
    }
    if (code.startsWith('SERVER_') || code.startsWith('DB_')) {
      return 500
    }
    if (code.startsWith('NETWORK_')) {
      return 503
    }
    
    // Default to 500 for unhandled cases
    return 500
  }

  // Convert to plain object for JSON serialization
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      traceId: this.traceId,
      severity: this.severity,
      retryable: this.retryable,
      status: this.status,
    }
  }

  // Static factory methods for common errors
  static invalidCredentials(details?: unknown): AppError {
    return new AppError({
      code: ErrorCode.AUTH_INVALID_CREDENTIALS,
      message: 'Credenciais inválidas',
      details,
      severity: 'warning',
      status: 401
    })
  }

  static emailNotFound(email: string): AppError {
    return new AppError({
      code: ErrorCode.AUTH_EMAIL_NOT_FOUND,
      message: 'E-mail não encontrado',
      details: { email },
      severity: 'warning',
      status: 401
    })
  }

  static tokenInvalid(details?: unknown): AppError {
    return new AppError({
      code: ErrorCode.AUTH_TOKEN_INVALID,
      message: 'Token inválido',
      details,
      severity: 'info',
      status: 401
    })
  }

  static tokenExpired(details?: unknown): AppError {
    return new AppError({
      code: ErrorCode.AUTH_TOKEN_EXPIRED,
      message: 'Token expirado',
      details,
      severity: 'info',
      status: 401
    })
  }

  static validationRequired(field: string): AppError {
    return new AppError({
      code: ErrorCode.VALIDATION_REQUIRED,
      message: `Campo obrigatório: ${field}`,
      details: { field },
      severity: 'warning',
      status: 422
    })
  }

  static userNotFound(userId: string): AppError {
    return new AppError({
      code: ErrorCode.NOT_FOUND,
      message: 'Usuário não encontrado',
      details: { userId },
      severity: 'warning',
      status: 404
    })
  }

  static permissionDenied(action?: string): AppError {
    return new AppError({
      code: ErrorCode.PERMISSION_DENIED,
      message: action ? `Acesso negado: ${action}` : 'Acesso negado',
      details: { action },
      severity: 'warning',
      status: 403
    })
  }

  static databaseUnavailable(originalError?: unknown): AppError {
    return new AppError({
      code: ErrorCode.DB_UNAVAILABLE,
      message: 'Banco de dados indisponível',
      details: originalError,
      severity: 'error',
      retryable: true,
      status: 503
    })
  }
}