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
      },
      budgets: {
        getAll: () => Promise<any[]>
        getById: (id: number) => Promise<any | null>
        create: (payload: any) => Promise<any>
        update: (id: number, payload: any) => Promise<any | null>
        delete: (id: number) => Promise<boolean>
        search: (searchTerm: string) => Promise<any[]>
      }
    }
    electronAPI?: {
      notifyAuthState: (isAuthenticated: boolean) => Promise<void>
      login: (email: string, password: string) => Promise<{ user: any; token: string }>
      logout: () => Promise<{ success: boolean }>
      validate: (token: string) => Promise<any | null>
      profile: (token: string) => Promise<any | null>
    }
  }
}
