import { AuthService } from '../services/AuthService'
import { AppError } from './AppError'

const authService = new AuthService()

export async function extractTenantFromRequest(token?: string): Promise<string> {
  if (!token) {
    throw AppError.validationRequired('Token de autenticação')
  }

  try {
    const decoded = authService.verifyToken(token)
    return decoded.tenantId
  } catch (error) {
    throw AppError.tokenInvalid(error)
  }
}

export async function validateUserAccess(token: string): Promise<{ tenantId: string, userId: string }> {
  if (!token) {
    throw AppError.validationRequired('Token de autenticação')
  }

  try {
    const user = await authService.validateToken(token)
    if (!user) {
      throw AppError.userNotFound('token-user')
    }

    return {
      tenantId: user.tenantId,
      userId: user.id
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error // Re-throw AppError as-is
    }
    throw AppError.permissionDenied(error instanceof Error ? error.message : 'erro desconhecido')
  }
}