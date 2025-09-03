/// <reference types="vite/client" />

interface Window {
  api: {
    clients: {
      getAll: () => Promise<any[]>
      getById: (id: number) => Promise<any>
      create: (clientData: any) => Promise<any>
      update: (id: number, clientData: any) => Promise<any>
      delete: (id: number) => Promise<boolean>
      search: (searchTerm: string) => Promise<any[]>
    }
    budgets: {
      getAll: () => Promise<any[]>
      getById: (id: number) => Promise<any>
      search: (searchTerm: string) => Promise<any[]>
      create: (payload: any) => Promise<any>
      update: (id: number, payload: any) => Promise<any>
      delete: (id: number) => Promise<boolean>
    }
  }
}