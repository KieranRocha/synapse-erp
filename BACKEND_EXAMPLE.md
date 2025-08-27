# Exemplo de Uso do Backend PostgreSQL

## Como usar as APIs de Cliente no Frontend

### 1. Criar um novo cliente

```typescript
// src/renderer/src/pages/Clientes/NovoClientePage.tsx
import { clienteSchema } from './schemas/clienteSchema'

const handleSubmit = async (data: z.infer<typeof clienteSchema>) => {
  try {
    const newClient = await window.api.clients.create(data)
    console.log('Cliente criado:', newClient)
    // Redirecionar ou mostrar sucesso
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    // Mostrar erro para o usuário
  }
}
```

### 2. Listar todos os clientes

```typescript
// src/renderer/src/pages/Clientes/ClientesPage.tsx
import { useEffect, useState } from 'react'

const ClientesPage = () => {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await window.api.clients.getAll()
        setClients(data)
      } catch (error) {
        console.error('Erro ao buscar clientes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  if (loading) return <div>Carregando...</div>

  return (
    <div>
      <h1>Clientes ({clients.length})</h1>
      {clients.map(client => (
        <div key={client.id}>
          <h3>{client.razao_social}</h3>
          <p>{client.email}</p>
          <p>{client.telefone}</p>
        </div>
      ))}
    </div>
  )
}
```

### 3. Buscar cliente específico

```typescript
const getClient = async (id: number) => {
  try {
    const client = await window.api.clients.getById(id)
    if (client) {
      console.log('Cliente encontrado:', client)
      return client
    } else {
      console.log('Cliente não encontrado')
      return null
    }
  } catch (error) {
    console.error('Erro ao buscar cliente:', error)
    return null
  }
}
```

### 4. Atualizar cliente

```typescript
const updateClient = async (id: number, updates: Partial<ClientData>) => {
  try {
    const updatedClient = await window.api.clients.update(id, updates)
    if (updatedClient) {
      console.log('Cliente atualizado:', updatedClient)
      return updatedClient
    }
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error)
  }
}
```

### 5. Deletar cliente

```typescript
const deleteClient = async (id: number) => {
  if (confirm('Tem certeza que deseja deletar este cliente?')) {
    try {
      const success = await window.api.clients.delete(id)
      if (success) {
        console.log('Cliente deletado com sucesso')
        // Atualizar lista de clientes
      }
    } catch (error) {
      console.error('Erro ao deletar cliente:', error)
    }
  }
}
```

### 6. Pesquisar clientes

```typescript
const searchClients = async (searchTerm: string) => {
  try {
    const results = await window.api.clients.search(searchTerm)
    console.log('Resultados da pesquisa:', results)
    return results
  } catch (error) {
    console.error('Erro na pesquisa:', error)
    return []
  }
}

// Exemplo de uso em um componente
const [searchTerm, setSearchTerm] = useState('')
const [searchResults, setSearchResults] = useState([])

const handleSearch = async (term: string) => {
  setSearchTerm(term)
  if (term.trim()) {
    const results = await searchClients(term)
    setSearchResults(results)
  } else {
    // Se termo vazio, buscar todos
    const allClients = await window.api.clients.getAll()
    setSearchResults(allClients)
  }
}
```

## Hook customizado para gerenciar clientes

```typescript
// src/renderer/src/hooks/useClients.ts
import { useState, useEffect } from 'react'

export const useClients = () => {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchClients = async () => {
    try {
      setLoading(true)
      const data = await window.api.clients.getAll()
      setClients(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createClient = async (clientData) => {
    try {
      const newClient = await window.api.clients.create(clientData)
      setClients(prev => [...prev, newClient])
      return newClient
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updateClient = async (id, updates) => {
    try {
      const updated = await window.api.clients.update(id, updates)
      if (updated) {
        setClients(prev => 
          prev.map(client => 
            client.id === id ? updated : client
          )
        )
      }
      return updated
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const deleteClient = async (id) => {
    try {
      const success = await window.api.clients.delete(id)
      if (success) {
        setClients(prev => prev.filter(client => client.id !== id))
      }
      return success
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const searchClients = async (term) => {
    try {
      setLoading(true)
      const results = await window.api.clients.search(term)
      setClients(results)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  return {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    searchClients
  }
}
```

## Exemplo de integração completa

```typescript
// src/renderer/src/pages/Clientes/ClientesPage.tsx
import React from 'react'
import { useClients } from '../hooks/useClients'

const ClientesPage = () => {
  const { 
    clients, 
    loading, 
    error, 
    createClient, 
    updateClient, 
    deleteClient, 
    searchClients 
  } = useClients()

  if (loading) return <div>Carregando clientes...</div>
  if (error) return <div>Erro: {error}</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clientes ({clients.length})</h1>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => {/* navegar para novo cliente */}}
        >
          Novo Cliente
        </button>
      </div>

      <div className="mb-4">
        <input 
          type="text" 
          placeholder="Pesquisar clientes..."
          className="w-full p-2 border rounded"
          onChange={(e) => searchClients(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {clients.map(client => (
          <div key={client.id} className="p-4 border rounded shadow">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{client.razao_social}</h3>
                {client.nome_fantasia && (
                  <p className="text-gray-600">{client.nome_fantasia}</p>
                )}
                <p className="text-sm">CPF/CNPJ: {client.cpf_cnpj}</p>
                <p className="text-sm">Email: {client.email}</p>
                <p className="text-sm">Telefone: {client.telefone}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                  onClick={() => {/* editar cliente */}}
                >
                  Editar
                </button>
                <button 
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  onClick={() => deleteClient(client.id)}
                >
                  Deletar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ClientesPage
```

## Status da Implementação

✅ **Backend Completo**
- ✅ PostgreSQL configurado
- ✅ Migrations criadas e executadas
- ✅ Models com CRUD completo
- ✅ Services com validação de dados
- ✅ IPC handlers registrados
- ✅ Preload APIs expostas
- ✅ TypeScript tipado

✅ **Pronto para usar**
- ✅ APIs disponíveis no `window.api.clients`
- ✅ Validação usando `clienteSchema`
- ✅ Tratamento de erros
- ✅ Busca e filtros

O backend está completamente funcional e pronto para integração com o frontend!