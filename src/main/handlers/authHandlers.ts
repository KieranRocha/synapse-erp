import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { AuthService } from '../services/AuthService'
import { IPCLogger } from '../utils/ipcLogger'
import { AppError } from '../utils/AppError'

const authService = new AuthService()

export function registerAuthHandlers() {
  // Login handler
  ipcMain.handle(
    'auth:login',
    async (_event: IpcMainInvokeEvent, email: string, password: string) => {
      try {
        IPCLogger.logRequest('auth:login', [email])

        if (!email || !password) {
          throw AppError.validationRequired('E-mail e senha')
        }

        const result = await authService.authenticate(email, password)

        if (!result) {
          throw AppError.invalidCredentials()
        }

        IPCLogger.logResponse('auth:login', { userId: result.user.id }, 0)
        return result
      } catch (error) {
        IPCLogger.logError('auth:login', error as Error, 0)

        // Se é um AppError, serializa corretamente para preservar propriedades
        if (error instanceof AppError) {
          const payload = error.toJSON()
          return { __appError: payload }
        }

        throw error
      }
    }
  )

  // Validate token handler
  ipcMain.handle('auth:validate', async (_event: IpcMainInvokeEvent, token: string) => {
    try {
      if (!token) {
        return null
      }

      const user = await authService.validateToken(token)

      if (user) {
        IPCLogger.logResponse('auth:validate', { userId: user.id }, 0)
      } else {
        IPCLogger.logResponse('auth:validate', null, 0)
      }

      return user
    } catch (error) {
      IPCLogger.logError('auth:validate', error as Error, 0)
      return null
    }
  })

  // Logout handler (mainly for cleanup)
  ipcMain.handle('auth:logout', async (_event: IpcMainInvokeEvent) => {
    try {
      IPCLogger.logRequest('auth:logout', [])
      // Here you could add cleanup logic if needed (e.g., blacklist tokens)
      return { success: true }
    } catch (error) {
      IPCLogger.logError('auth:logout', error as Error, 0)
      throw error
    }
  })

  // Get current user profile
  ipcMain.handle('auth:profile', async (_event: IpcMainInvokeEvent, token: string) => {
    try {
      if (!token) {
        throw AppError.validationRequired('Token')
      }

      const user = await authService.validateToken(token)

      if (!user) {
        throw AppError.tokenInvalid()
      }

      return user
    } catch (error) {
      IPCLogger.logError('auth:profile', error as Error, 0)
      if (error instanceof AppError) {
        const payload = error.toJSON()
        return { __appError: payload }
      }
      throw error
    }
  })

  // Request password reset
  ipcMain.handle('auth:requestPasswordReset', async (_event: IpcMainInvokeEvent, email: string) => {
    try {
      IPCLogger.logRequest('auth:requestPasswordReset', [email])

      if (!email) {
        throw AppError.validationRequired('E-mail')
      }

      const result = await authService.requestPasswordReset(email)

      IPCLogger.logResponse('auth:requestPasswordReset', { userId: result.user.id }, 0)
      return result
    } catch (error) {
      IPCLogger.logError('auth:requestPasswordReset', error as Error, 0)

      if (error instanceof AppError) {
        const payload = error.toJSON()
        return { __appError: payload }
      }

      throw error
    }
  })

  // Validate password reset token
  ipcMain.handle('auth:validatePasswordResetToken', async (_event: IpcMainInvokeEvent, token: string) => {
    try {
      if (!token) {
        return null
      }

      const user = await authService.validatePasswordResetToken(token)
      
      if (user) {
        IPCLogger.logResponse('auth:validatePasswordResetToken', { userId: user.id }, 0)
      } else {
        IPCLogger.logResponse('auth:validatePasswordResetToken', null, 0)
      }

      return user
    } catch (error) {
      IPCLogger.logError('auth:validatePasswordResetToken', error as Error, 0)
      return null
    }
  })

  // Reset password with token
  ipcMain.handle('auth:resetPassword', async (_event: IpcMainInvokeEvent, token: string, newPassword: string) => {
    try {
      IPCLogger.logRequest('auth:resetPassword', [token])

      if (!token || !newPassword) {
        throw AppError.validationRequired('Token e nova senha')
      }

      const success = await authService.resetPassword(token, newPassword)

      IPCLogger.logResponse('auth:resetPassword', { success }, 0)
      return { success }
    } catch (error) {
      IPCLogger.logError('auth:resetPassword', error as Error, 0)

      if (error instanceof AppError) {
        const payload = error.toJSON()
        return { __appError: payload }
      }

      throw error
    }
  })

  console.log('Auth handlers registered')
}
