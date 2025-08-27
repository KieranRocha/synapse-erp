import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      clients: {
        getAll: () => Promise<any[]>
        getById: (id: number) => Promise<any | null>
        create: (clientData: any) => Promise<any>
        update: (id: number, clientData: any) => Promise<any | null>
        delete: (id: number) => Promise<boolean>
        search: (searchTerm: string) => Promise<any[]>
      }
    }
  }
}
