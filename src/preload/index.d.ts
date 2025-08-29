import { ElectronAPI } from '@electron-toolkit/preload'
import type { Budget } from '../renderer/src/shared/types'

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
      budgets: {
        getAll: () => Promise<Budget[]>
        getById: (id: number) => Promise<Budget | null>
        create: (budgetData: any) => Promise<Budget>
        update: (id: number, budgetData: any) => Promise<Budget | null>
        delete: (id: number) => Promise<boolean>
      }
    }
  }
}
