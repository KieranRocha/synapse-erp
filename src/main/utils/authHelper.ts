import { AuthService } from '../services/AuthService'

const authService = new AuthService()

export async function extractTenantFromRequest(token?: string): Promise<string> {
  if (!token) {
    throw new Error('Token de autenticação não fornecido')
  }

  try {
    const decoded = authService.verifyToken(token)
    return decoded.tenantId
  } catch (error) {
    throw new Error('Token inválido ou expirado')
  }
}

export async function validateUserAccess(token: string): Promise<{ tenantId: string, userId: string }> {
  if (!token) {
    throw new Error('Token de autenticação não fornecido')
  }

  try {
    const user = await authService.validateToken(token)
    if (!user) {
      throw new Error('Usuário não encontrado ou inativo')
    }

    return {
      tenantId: user.tenantId,
      userId: user.id
    }
  } catch (error) {
    throw new Error('Acesso negado: ' + (error instanceof Error ? error.message : 'erro desconhecido'))
  }
}