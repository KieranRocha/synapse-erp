import { ErrorCode, AllErrorCodes } from './codes'
import { getMessage } from './messages'
import type { AppError, BackendErrorShape, Severity } from './types'

function normalizeCode(raw?: string, status?: number, hint?: string): string {
  // Backend now sends structured codes, so prefer those first
  const code = raw && AllErrorCodes.has(raw) ? (raw as string) : undefined
  if (code) return code
  
  // Fallback heuristics for legacy or external errors
  switch (status) {
    case 400: return ErrorCode.UNPROCESSABLE
    case 401: return ErrorCode.AUTH_INVALID_CREDENTIALS
    case 403: return ErrorCode.PERMISSION_DENIED
    case 404: return ErrorCode.NOT_FOUND
    case 409: return ErrorCode.CONFLICT
    case 422: return ErrorCode.UNPROCESSABLE
    case 429: return ErrorCode.RATE_LIMITED
  }
  if (status && status >= 500 && status <= 599) {
    // Database hints
    if (hint && /db|database|prisma|pgsql|postgres|mysql|sqlite|ECONNREFUSED/i.test(hint)) {
      return ErrorCode.DB_UNAVAILABLE
    }
    return ErrorCode.SERVER_ERROR
  }
  // Network conditions
  if (hint && /offline|NetworkError|Failed to fetch|ENOTFOUND|ECONNRESET/i.test(hint)) {
    return ErrorCode.NETWORK_OFFLINE
  }
  return ErrorCode.UNKNOWN
}

export function fromUnknown(error: unknown): AppError {
  console.log('🔍 [fromUnknown] Processing error:', error)
  console.log('🔍 [fromUnknown] Error type:', typeof error)
  console.log('🔍 [fromUnknown] Error instanceof Error:', error instanceof Error)
  
  // If it's already our AppError (from backend AppError.toJSON()), pass-through
  if (error && typeof error === 'object' && 'code' in error && 'message' in error && 'severity' in error) {
    console.log('✅ [fromUnknown] Detected structured AppError')
    const appErr = error as AppError
    // Ensure we have all required fields
    return {
      code: appErr.code,
      message: appErr.message,
      details: appErr.details,
      traceId: appErr.traceId || `frontend-${Date.now()}`,
      severity: appErr.severity || 'error',
      retryable: appErr.retryable || false,
    }
  }

  let shape: BackendErrorShape | undefined
  let status: number | undefined
  let rawMessage: string | undefined
  let traceId: string | undefined
  let backendCode: string | undefined

  if (typeof error === 'string') {
    rawMessage = error
  } else if (error instanceof Error) {
    rawMessage = error.message
    // Check if this is our backend AppError disguised as Error
    backendCode = (error as any).code
    status = typeof (error as any).status === 'number' ? (error as any).status : undefined
    traceId = typeof (error as any).traceId === 'string' ? (error as any).traceId : undefined
    shape = (error as any).cause && typeof (error as any).cause === 'object' ? (error as any).cause : undefined
  } else if (error && typeof error === 'object') {
    shape = error as BackendErrorShape
    rawMessage = (shape.messageKey as string) || shape.message || undefined
    backendCode = shape.code
    status = shape.status
    traceId = shape.traceId
  }

  // Prefer backend code over message-based detection
  const hint = [rawMessage, JSON.stringify(shape ?? {})].filter(Boolean).join(' ')
  const code = normalizeCode(backendCode || shape?.code || shape?.messageKey, status, hint)
  const { message, severity, retryable } = getMessage(code)
  
  console.log('🔍 [fromUnknown] Processing fallback path:')
  console.log('  - backendCode:', backendCode)
  console.log('  - rawMessage:', rawMessage)
  console.log('  - status:', status)
  console.log('  - final code:', code)
  console.log('  - final message:', message)
  
  // Use backend message if it's not a code, otherwise use our localized message
  const finalMessage = rawMessage && !AllErrorCodes.has(rawMessage) ? rawMessage : message

  const result = {
    code,
    message: finalMessage,
    details: shape?.details,
    traceId: traceId || `frontend-${Date.now()}`,
    severity: severity as Severity,
    retryable,
  }
  
  console.log('🔍 [fromUnknown] Final result:', result)
  return result
}

export function formatForToast(err: AppError): { level: 'success' | 'info' | 'warning' | 'error'; text: string } {
  const level = err.severity === 'info' ? 'info' : err.severity === 'warning' ? 'warning' : 'error'
  return { level, text: err.message }
}

// Helper: show a toast using the existing useToast() API shape
// Usage inside a component:
//   const toast = useToast()
//   const appErr = fromUnknown(e)
//   emitToastForError(toast, appErr)
export function emitToastForError(toast: { success: Function; info: Function; warning: Function; error: Function }, err: AppError) {
  console.log('🎯 [emitToastForError] Called with error:', err)
  const { level, text } = formatForToast(err)
  console.log('🎯 [emitToastForError] Toast level:', level, 'message:', text)
  
  if (level === 'info') {
    console.log('🎯 [emitToastForError] Calling toast.info')
    return toast.info(text)
  }
  if (level === 'warning') {
    console.log('🎯 [emitToastForError] Calling toast.warning')
    return toast.warning(text)
  }
  console.log('🎯 [emitToastForError] Calling toast.error')
  return toast.error(text)
}

