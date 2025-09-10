import { useState, useCallback } from 'react'

interface IPCState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

// Hook genérico para operações IPC
export function useIPC<T = any>() {
  const [state, setState] = useState<IPCState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const execute = useCallback(async (
    operation: () => Promise<T>,
    options?: {
      onSuccess?: (data: T) => void
      onError?: (error: Error) => void
      silent?: boolean // Não atualiza loading state
    }
  ) => {
    if (!options?.silent) {
      setState(prev => ({ ...prev, loading: true, error: null }))
    }

    try {
      const data = await operation()
      
      setState({ data, loading: false, error: null })
      options?.onSuccess?.(data)
      
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }))
      
      options?.onError?.(error as Error)
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    execute,
    reset
  }
}

// Hook específico para operações de Cliente
export function useClientIPC() {
  const { data: clients, loading, error, execute, reset } = useIPC<any[]>()

  const getAllClients = useCallback(() => {
    return execute(() => window.api.clients.getAll())
  }, [execute])

  const getClientById = useCallback((id: number) => {
    return execute(() => window.api.clients.getById(id))
  }, [execute])

  const createClient = useCallback((clientData: any) => {
    return execute(() => window.api.clients.create(clientData), {
      onSuccess: () => {
        // Recarregar lista após criar
        getAllClients()
      }
    })
  }, [execute, getAllClients])

  const updateClient = useCallback((id: number, clientData: any) => {
    return execute(() => window.api.clients.update(id, clientData), {
      onSuccess: () => {
        // Recarregar lista após atualizar
        getAllClients()
      }
    })
  }, [execute, getAllClients])

  const deleteClient = useCallback((id: number) => {
    return execute(() => window.api.clients.delete(id), {
      onSuccess: () => {
        // Recarregar lista após deletar
        getAllClients()
      }
    })
  }, [execute, getAllClients])

  const searchClients = useCallback((searchTerm: string) => {
    return execute(() => window.api.clients.search(searchTerm))
  }, [execute])

  return {
    clients,
    loading,
    error,
    getAllClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
    searchClients,
    reset
  }
}

// Hook para debugging IPC no frontend
export function useIPCDebug() {
  const logAPI = useCallback(() => {
    console.group('🔍 Available IPC APIs')
    console.log('window.api:', window.api)
    console.log('clients:', Object.keys(window.api.clients))
    console.groupEnd()
  }, [])

  const testOperation = useCallback(async (
    operationName: string, 
    operation: () => Promise<any>
  ) => {
    console.group(`🧪 Testing IPC: ${operationName}`)
    const start = performance.now()
    
    try {
      const result = await operation()
      const duration = performance.now() - start
      
      console.log('✅ Success:', result)
      console.log(`⏱️ Duration: ${duration.toFixed(2)}ms`)
      
      return result
    } catch (error) {
      const duration = performance.now() - start
      
      console.error('❌ Error:', error)
      console.log(`⏱️ Duration: ${duration.toFixed(2)}ms`)
      
      throw error
    } finally {
      console.groupEnd()
    }
  }, [])

  const testAllClientAPIs = useCallback(async () => {
    try {
      // Teste listar todos
      await testOperation('getAll', () => window.api.clients.getAll())
      
      // Teste busca
      await testOperation('search', () => window.api.clients.search('test'))
      
      // Teste busca por ID (pode falhar se não existir)
      try {
        await testOperation('getById', () => window.api.clients.getById(1))
      } catch (e) {
        console.log('ℹ️ getById test failed (expected if no client with ID 1)')
      }
      
      console.log('🎉 All basic IPC tests completed')
    } catch (error) {
      console.error('💥 IPC tests failed:', error)
    }
  }, [testOperation])

  return {
    logAPI,
    testOperation,
    testAllClientAPIs
  }
}