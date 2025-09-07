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
  }
}

// Auth API
const authAPI = {
  notifyAuthState: (isAuthenticated: boolean) => ipcRenderer.invoke('auth:notify-state', isAuthenticated),
  login: (email: string, password: string) => ipcRenderer.invoke('auth:login', email, password),
  logout: () => ipcRenderer.invoke('auth:logout'),
  validate: (token: string) => ipcRenderer.invoke('auth:validate', token),
  profile: (token: string) => ipcRenderer.invoke('auth:profile', token)
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
