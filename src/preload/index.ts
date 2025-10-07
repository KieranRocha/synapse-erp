import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

console.log('🔄 Preload script loading...')

// Helper function to get auth token from localStorage
const getAuthToken = (): string => {
  const token = localStorage.getItem('auth-token')
  if (!token) {
    throw new Error('Token de autenticação não encontrado. Faça login novamente.')
  }
  return token
}

// Custom APIs for renderer
const api = {
  clients: {
    getAll: () => ipcRenderer.invoke('clients:getAll', getAuthToken()),
    getById: (id: number) => ipcRenderer.invoke('clients:getById', getAuthToken(), id),
    create: (clientData: any) => ipcRenderer.invoke('clients:create', getAuthToken(), clientData),
    update: (id: number, clientData: any) => ipcRenderer.invoke('clients:update', getAuthToken(), id, clientData),
    delete: (id: number) => ipcRenderer.invoke('clients:delete', getAuthToken(), id),
    search: (searchTerm: string) => ipcRenderer.invoke('clients:search', getAuthToken(), searchTerm)
  },
  budgets: {
    getAll: () => ipcRenderer.invoke('budgets:getAll', getAuthToken()),
    getById: (id: number) => ipcRenderer.invoke('budgets:getById', getAuthToken(), id),
    search: (searchTerm: string) => ipcRenderer.invoke('budgets:search', getAuthToken(), searchTerm),
    create: (payload: any) => ipcRenderer.invoke('budgets:create', getAuthToken(), payload),
    update: (id: number, payload: any) => ipcRenderer.invoke('budgets:update', getAuthToken(), id, payload),
    delete: (id: number) => ipcRenderer.invoke('budgets:delete', getAuthToken(), id)
  },
  sellers: {
    getAll: (token: string) => ipcRenderer.invoke('sellers:getAll', token),
    getActive: (token: string) => ipcRenderer.invoke('sellers:getActive', token),
    getById: (token: string, id: number) => ipcRenderer.invoke('sellers:getById', token, id),
    create: (token: string, sellerData: any) => ipcRenderer.invoke('sellers:create', token, sellerData),
    update: (token: string, id: number, sellerData: any) => ipcRenderer.invoke('sellers:update', token, id, sellerData),
    delete: (token: string, id: number) => ipcRenderer.invoke('sellers:delete', token, id),
    deactivate: (token: string, id: number) => ipcRenderer.invoke('sellers:deactivate', token, id),
    activate: (token: string, id: number) => ipcRenderer.invoke('sellers:activate', token, id)
  },
  clientContacts: {
    getAll: (token: string, clientId: number) => ipcRenderer.invoke('clientContacts:getAll', token, clientId),
    getById: (token: string, id: number) => ipcRenderer.invoke('clientContacts:getById', token, id),
    create: (token: string, clientId: number, contactData: any) => ipcRenderer.invoke('clientContacts:create', token, clientId, contactData),
    update: (token: string, clientId: number, id: number, contactData: any) => ipcRenderer.invoke('clientContacts:update', token, clientId, id, contactData),
    delete: (token: string, clientId: number, id: number) => ipcRenderer.invoke('clientContacts:delete', token, clientId, id),
    setPrimary: (token: string, clientId: number, id: number) => ipcRenderer.invoke('clientContacts:setPrimary', token, clientId, id)
  }
}

// Helper: invoke and unwrap AppError envelopes
async function invokeWithAppError<T = any>(channel: string, ...args: any[]): Promise<T> {
  const res: any = await ipcRenderer.invoke(channel, ...args)
  if (res && typeof res === 'object' && '__appError' in res) {
    const payload = (res as any).__appError
    // Lança o objeto cru vindo do backend (sem normalização/enriquecimento)
    throw payload
  }
  return res as T
}

// Auth API
const authAPI = {
  notifyAuthState: (isAuthenticated: boolean) => ipcRenderer.invoke('auth:notify-state', isAuthenticated),
  login: (email: string, password: string) => invokeWithAppError('auth:login', email, password),
  logout: () => invokeWithAppError('auth:logout'),
  validate: (token: string) => invokeWithAppError('auth:validate', token),
  profile: (token: string) => invokeWithAppError('auth:profile', token),
  requestPasswordReset: (email: string) => invokeWithAppError('auth:requestPasswordReset', email),
  validatePasswordResetToken: (token: string) => invokeWithAppError('auth:validatePasswordResetToken', token),
  resetPassword: (token: string, newPassword: string) => invokeWithAppError('auth:resetPassword', token, newPassword),
  invoke: (channel: string, ...args: any[]) => invokeWithAppError(channel, ...args)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
try {
  if (process.contextIsolated) {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('electronAPI', authAPI)
    console.log('✅ API exposed to main world successfully via contextBridge')
  } else {
    // @ts-ignore (define in dts)
    window.electron = electronAPI
    // @ts-ignore (define in dts)
    window.api = api
    // @ts-ignore (define in dts)
    window.electronAPI = authAPI
    console.log('✅ API attached to window object successfully (no context isolation)')
  }
} catch (error) {
  console.error('❌ Error setting up API:', error)
  // Fallback: try to set on window directly
  try {
    // @ts-ignore
    window.electron = electronAPI
    // @ts-ignore 
    window.api = api
    // @ts-ignore
    window.electronAPI = authAPI
    console.log('✅ API attached as fallback')
  } catch (fallbackError) {
    console.error('❌ Fallback also failed:', fallbackError)
  }
}
