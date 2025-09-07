import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

console.log('🔄 Preload script loading...')

// Custom APIs for renderer
const api = {
  clients: {
    getAll: () => ipcRenderer.invoke('clients:getAll'),
    getById: (id: number) => ipcRenderer.invoke('clients:getById', id),
    create: (clientData: any) => ipcRenderer.invoke('clients:create', clientData),
    update: (id: number, clientData: any) => ipcRenderer.invoke('clients:update', id, clientData),
    delete: (id: number) => ipcRenderer.invoke('clients:delete', id),
    search: (searchTerm: string) => ipcRenderer.invoke('clients:search', searchTerm)
  },
  budgets: {
    getAll: () => ipcRenderer.invoke('budgets:getAll'),
    getById: (id: number) => ipcRenderer.invoke('budgets:getById', id),
    search: (searchTerm: string) => ipcRenderer.invoke('budgets:search', searchTerm),
    create: (payload: any) => ipcRenderer.invoke('budgets:create', payload),
    update: (id: number, payload: any) => ipcRenderer.invoke('budgets:update', id, payload),
    delete: (id: number) => ipcRenderer.invoke('budgets:delete', id)
  }
}

// Auth API
const authAPI = {
  notifyAuthState: (isAuthenticated: boolean) => ipcRenderer.invoke('auth:notify-state', isAuthenticated)
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
