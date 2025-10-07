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
      },
      sellers: {
        getAll: (token: string) => Promise<any[]>
        getActive: (token: string) => Promise<any[]>
        getById: (token: string, id: number) => Promise<any | null>
        create: (token: string, sellerData: any) => Promise<any>
        update: (token: string, id: number, sellerData: any) => Promise<any | null>
        delete: (token: string, id: number) => Promise<boolean>
        deactivate: (token: string, id: number) => Promise<any>
        activate: (token: string, id: number) => Promise<any>
      },
      clientContacts: {
        getAll: (token: string, clientId: number) => Promise<any[]>
        getById: (token: string, id: number) => Promise<any | null>
        create: (token: string, clientId: number, contactData: any) => Promise<any>
        update: (token: string, clientId: number, id: number, contactData: any) => Promise<any | null>
        delete: (token: string, clientId: number, id: number) => Promise<boolean>
        setPrimary: (token: string, clientId: number, id: number) => Promise<any>
      }
    }
    electronAPI?: {
      notifyAuthState: (isAuthenticated: boolean) => Promise<void>
      login: (email: string, password: string) => Promise<{ user: any; token: string }>
      logout: () => Promise<{ success: boolean }>
      validate: (token: string) => Promise<any | null>
      profile: (token: string) => Promise<any | null>
      requestPasswordReset: (email: string) => Promise<{ token: string; user: any }>
      validatePasswordResetToken: (token: string) => Promise<any | null>
      resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean }>
      invoke: (channel: string, ...args: any[]) => Promise<any>
    }
  }
}
