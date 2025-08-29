import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

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
    create: (budgetData: any) => ipcRenderer.invoke('budgets:create', budgetData),
    update: (id: number, budgetData: any) => ipcRenderer.invoke('budgets:update', id, budgetData),
    delete: (id: number) => ipcRenderer.invoke('budgets:delete', id)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
