# 📡 Guia Completo: Trabalhando com IPC no Electron

## 🏗️ **Arquitetura IPC do Projeto**

```
Frontend (Renderer Process)
    ↕️ window.api.clients.*
Preload Script (Bridge)
    ↕️ ipcRenderer.invoke()
Main Process (Backend)
    ↕️ ipcMain.handle()
Database Layer (PostgreSQL)
```

## 🔧 **Como IPC Funciona no Projeto**

### **1. Main Process (Backend)**
```typescript
// src/main/handlers/clientHandlers.ts
ipcMain.handle('clients:getAll', async () => {
  try {
    return await ClientService.getAllClients()
  } catch (error) {
    throw error // Erro será enviado para o frontend
  }
})
```

### **2. Preload Script (Bridge)**
```typescript
// src/preload/index.ts
const api = {
  clients: {
    getAll: () => ipcRenderer.invoke('clients:getAll'),
    create: (data) => ipcRenderer.invoke('clients:create', data)
  }
}
```

### **3. Frontend (Renderer)**
```typescript
// Qualquer componente React
const clients = await window.api.clients.getAll()
```

## 🚀 **Padrões de Uso no Desenvolvimento**

### **A. Operações CRUD Básicas**

```typescript
// ✅ LISTAR - Sem parâmetros
const clients = await window.api.clients.getAll()

// ✅ BUSCAR - Com ID
const client = await window.api.clients.getById(123)

// ✅ CRIAR - Com dados
const newClient = await window.api.clients.create({
  tipoPessoa: 'PJ',
  razaoSocial: 'Empresa XYZ',
  cpfCnpj: '12345678000199'
  // ... outros campos
})

// ✅ ATUALIZAR - Com ID + dados parciais
const updated = await window.api.clients.update(123, {
  email: 'novo@email.com',
  telefone: '11999999999'
})

// ✅ DELETAR - Com ID
const success = await window.api.clients.delete(123)

// ✅ PESQUISAR - Com termo
const results = await window.api.clients.search('empresa')
```

### **B. Trabalhando com Loading States**

```typescript
const [clients, setClients] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  const fetchClients = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await window.api.clients.getAll()
      setClients(data)
      
    } catch (err) {
      setError(err.message)
      console.error('Erro IPC:', err)
    } finally {
      setLoading(false)
    }
  }

  fetchClients()
}, [])
```

### **C. Formulários com Validação**

```typescript
// NovoClientePage.tsx
import { clienteSchema } from './schemas/clienteSchema'

const handleSubmit = async (formData) => {
  try {
    // Validar dados ANTES de enviar
    const validData = clienteSchema.parse(formData)
    
    // Enviar via IPC
    const newClient = await window.api.clients.create(validData)
    
    // Sucesso
    toast.success('Cliente criado com sucesso!')
    navigate('/clientes')
    
  } catch (error) {
    if (error.name === 'ZodError') {
      // Erros de validação local
      setFormErrors(error.issues)
    } else {
      // Erros do backend (via IPC)
      toast.error(error.message)
    }
  }
}
```

## 🛠️ **Adicionando Novas Operações IPC**

### **1. Criar Handler no Main Process**

```typescript
// src/main/handlers/clientHandlers.ts
export function registerClientHandlers() {
  // ... handlers existentes

  // ✨ NOVA OPERAÇÃO
  ipcMain.handle('clients:countByType', async (_, type: 'PJ' | 'PF') => {
    try {
      return await ClientService.countByType(type)
    } catch (error) {
      console.error('Error in clients:countByType:', error)
      throw error
    }
  })
}
```

### **2. Adicionar Método no Service**

```typescript
// src/main/services/ClientService.ts
export class ClientService {
  // ... métodos existentes

  static async countByType(type: 'PJ' | 'PF'): Promise<number> {
    try {
      return await ClientModel.countByType(type)
    } catch (error) {
      console.error('Error counting clients by type:', error)
      throw new Error('Failed to count clients')
    }
  }
}
```

### **3. Atualizar Model**

```typescript
// src/main/models/Client.ts
export class ClientModel {
  // ... métodos existentes

  static async countByType(type: 'PJ' | 'PF'): Promise<number> {
    const result = await db(this.table)
      .where({ tipo_pessoa: type })
      .count('id as count')
      .first()
    
    return parseInt(result.count)
  }
}
```

### **4. Expor no Preload**

```typescript
// src/preload/index.ts
const api = {
  clients: {
    // ... métodos existentes
    countByType: (type: 'PJ' | 'PF') => ipcRenderer.invoke('clients:countByType', type)
  }
}
```

### **5. Atualizar Types**

```typescript
// src/preload/index.d.ts
declare global {
  interface Window {
    api: {
      clients: {
        // ... métodos existentes
        countByType: (type: 'PJ' | 'PF') => Promise<number>
      }
    }
  }
}
```

### **6. Usar no Frontend**

```typescript
// Qualquer componente
const [pjCount, setPjCount] = useState(0)
const [pfCount, setPfCount] = useState(0)

useEffect(() => {
  const loadCounts = async () => {
    const [pj, pf] = await Promise.all([
      window.api.clients.countByType('PJ'),
      window.api.clients.countByType('PF')
    ])
    
    setPjCount(pj)
    setPfCount(pf)
  }
  
  loadCounts()
}, [])
```

## 🎯 **Boas Práticas IPC**

### **A. Nomenclatura Consistente**
```typescript
// ✅ BOM - Padrão namespace:action
'clients:getAll'
'clients:create'
'clients:update'
'orcamentos:getAll'
'orcamentos:create'

// ❌ EVITAR - Inconsistente
'getAllClients'
'client-create'
'updateClientData'
```

### **B. Tratamento de Erros**
```typescript
// ✅ MAIN PROCESS - Sempre catch e re-throw
ipcMain.handle('clients:create', async (_, data) => {
  try {
    return await ClientService.createClient(data)
  } catch (error) {
    console.error('Handler error:', error)
    throw error // Re-throw para o frontend
  }
})

// ✅ FRONTEND - Sempre try/catch
try {
  const result = await window.api.clients.create(data)
} catch (error) {
  // Tratar erro específico
  if (error.message.includes('já existe')) {
    toast.error('Cliente já cadastrado!')
  } else {
    toast.error('Erro interno. Tente novamente.')
  }
}
```

### **C. Performance com Batch Operations**
```typescript
// ✅ BOM - Uma operação batch
const results = await window.api.clients.createBatch([
  client1, client2, client3
])

// ❌ EVITAR - Múltiplas chamadas IPC
const results = await Promise.all([
  window.api.clients.create(client1),
  window.api.clients.create(client2),
  window.api.clients.create(client3)
])
```

### **D. Validação em Camadas**
```typescript
// 1️⃣ FRONTEND - Validação UX
const validData = clienteSchema.parse(formData)

// 2️⃣ SERVICE - Validação Business
export class ClientService {
  static async createClient(data) {
    const validData = clienteSchema.parse(data) // Re-validar
    // ... lógica de negócio
  }
}

// 3️⃣ DATABASE - Constraints
CREATE TABLE clients (
  cpf_cnpj VARCHAR(14) UNIQUE NOT NULL
)
```

## 🔍 **Debugging IPC**

### **A. Logs Estruturados**
```typescript
// Main Process
ipcMain.handle('clients:create', async (_, data) => {
  console.log('📥 IPC clients:create received:', {
    tipoPessoa: data.tipoPessoa,
    razaoSocial: data.razaoSocial,
    timestamp: new Date().toISOString()
  })
  
  try {
    const result = await ClientService.createClient(data)
    console.log('✅ IPC clients:create success:', result.id)
    return result
  } catch (error) {
    console.error('❌ IPC clients:create failed:', error.message)
    throw error
  }
})
```

### **B. DevTools**
```typescript
// Frontend - Verificar APIs disponíveis
console.log('Available APIs:', Object.keys(window.api))
console.log('Client APIs:', Object.keys(window.api.clients))

// Testar operação manual
window.api.clients.getAll().then(console.log)
```

### **C. Timeout Protection**
```typescript
// Wrapper com timeout
const withTimeout = (promise, ms = 5000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('IPC timeout')), ms)
    )
  ])
}

// Uso
const clients = await withTimeout(window.api.clients.getAll())
```

## 📊 **Monitoramento de Performance**
```typescript
// Performance tracking
const trackIPC = async (operation, fn) => {
  const start = performance.now()
  try {
    const result = await fn()
    const duration = performance.now() - start
    console.log(`🚀 IPC ${operation}: ${duration.toFixed(2)}ms`)
    return result
  } catch (error) {
    const duration = performance.now() - start
    console.error(`💥 IPC ${operation} failed after ${duration.toFixed(2)}ms:`, error)
    throw error
  }
}

// Uso
const clients = await trackIPC('clients:getAll', () => 
  window.api.clients.getAll()
)
```