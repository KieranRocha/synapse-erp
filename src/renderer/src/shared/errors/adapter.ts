import type { BackendErrorShape } from './types'

function tryParseJsonTail(message?: string): Partial<BackendErrorShape> | null {
  if (!message || typeof message !== 'string') return null
  const match = message.match(/\{[\s\S]*\}$/)
  if (!match) return null
  try {
    return JSON.parse(match[0]) as BackendErrorShape
  } catch {
    return null
  }
}

export function fromUnknown(error: unknown): Error & BackendErrorShape & { raw?: unknown } {
  console.error('🔥 RAW ERROR:', error)
  const isErr = error instanceof Error
  const anyErr = error as any

  // Base Error para manter compatibilidade com fluxos existentes
  const normalized: Error & BackendErrorShape & { raw?: unknown } = isErr
    ? (error as Error & BackendErrorShape)
    : Object.assign(new Error(String(error)), {})

  // Extrai campos (se dispon�veis)
  const direct: Partial<BackendErrorShape> = {
    code: anyErr?.code,
    message: (isErr ? (error as Error).message : anyErr?.message) || undefined,
    details: anyErr?.details,
    traceId: anyErr?.traceId,
    status: anyErr?.status
  }

  const causePayload =
    anyErr?.cause && typeof anyErr.cause === 'object'
      ? (anyErr.cause as Partial<BackendErrorShape>)
      : undefined
  const parsedFromMessage = tryParseJsonTail(direct.message)

  const best: Partial<BackendErrorShape> = {
    ...parsedFromMessage,
    ...causePayload,
    ...direct
  }

  if (best.code) (normalized as any).code = best.code
  if (best.message) normalized.message = best.message
  if (best.details !== undefined) (normalized as any).details = best.details
  if (best.traceId) (normalized as any).traceId = best.traceId
  if (best.status !== undefined) (normalized as any).status = best.status

  if (anyErr?.severity) (normalized as any).severity = anyErr.severity
  if (anyErr?.retryable !== undefined) (normalized as any).retryable = anyErr.retryable

  normalized.raw = error

  // Log estruturado e conciso
  console.error('?? IPC Error:', {
    code: (normalized as any).code,
    message: normalized.message,
    details: (normalized as any).details,
    traceId: (normalized as any).traceId,
    severity: (normalized as any).severity,
    retryable: (normalized as any).retryable,
    status: (normalized as any).status
  })

  return normalized
}

// Fun��es de toast removidas - apenas log no console
