import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { AuthService } from '../services/AuthService'
import { IPCLogger } from '../utils/ipcLogger'

const authService = new AuthService()

export function registerAuthHandlers() {
  // Login handler
  ipcMain.handle('auth:login', async (_event: IpcMainInvokeEvent, email: string, password: string) => {
    try {
      IPCLogger.logRequest('auth:login', [email])
      
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios')
      }

      const result = await authService.authenticate(email, password)
      
      if (!result) {
        throw new Error('Credenciais inválidas')
      }

      IPCLogger.logResponse('auth:login', { userId: result.user.id }, 0)
      return result
    } catch (error) {
      IPCLogger.logError('auth:login', error as Error, 0)
      throw error
    }
  })

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
        throw new Error('Token não fornecido')
      }

      const user = await authService.validateToken(token)
      
      if (!user) {
        throw new Error('Token inválido ou expirado')
      }

      return user
    } catch (error) {
      IPCLogger.logError('auth:profile', error as Error, 0)
      throw error
    }
  })

  console.log('Auth handlers registered')
}