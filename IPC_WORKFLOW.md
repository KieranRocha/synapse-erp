# 🔄 Workflow de Desenvolvimento com IPC

## 🚀 **Fluxo de Trabalho Completo**

### **1. Planejamento da Feature**
```typescript
// Exemplo: Adicionar relatório de clientes por região

// ✅ PLANEJAR ESTRUTURA
interface ClientReport {
  region: string
  clientCount: number
  totalRevenue: number
}

// ✅ DEFINIR API
'reports:clientsByRegion' -> Promise<ClientReport[]>
```

### **2. Implementar Backend (Main Process)**

#### **A. Criar/Atualizar Model**
```typescript
// src/main/models/Client.ts
export class ClientModel {
  static async getReportByRegion(): Promise<ClientReport[]> {
    return db(this.table)
      .select('uf as region')
      .count('id as clientCount')
      .sum('limite_credito as totalRevenue')
      .groupBy('uf')
      .orderBy('clientCount', 'desc')
  }
}
```

#### **B. Criar/Atualizar Service**
```typescript
// src/main/services/ClientService.ts
export class ClientService {
  static async getClientReport(): Promise<ClientReport[]> {
    try {
      return await ClientModel.getReportByRegion()
    } catch (error) {
      console.error('Error generating client report:', error)
      throw new Error('Failed to generate client report')
    }
  }
}
```

#### **C. Adicionar Handler**
```typescript
// src/main/handlers/clientHandlers.ts
export function registerClientHandlers() {
  // ... handlers existentes

  // Novo handler
  ipcMain.handle('reports:clientsByRegion', withLogging('reports:clientsByRegion', async () => {
    return await ClientService.getClientReport()
  }))
}
```

### **3. Atualizar Preload (Bridge)**
```typescript
// src/preload/index.ts
const api = {
  clients: {
    // ... métodos existentes
  },
  reports: {
    clientsByRegion: () => ipcRenderer.invoke('reports:clientsByRegion')
  }
}

// src/preload/index.d.ts
declare global {
  interface Window {
    api: {
      clients: {
        // ... métodos existentes
      }
      reports: {
        clientsByRegion: () => Promise<ClientReport[]>
      }
    }
  }
}
```

### **4. Implementar Frontend**

#### **A. Criar Hook Customizado**
```typescript
// src/renderer/src/hooks/useReports.ts
export function useReports() {
  const [reportData, setReportData] = useState<ClientReport[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getClientsByRegion = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await window.api.reports.clientsByRegion()
      setReportData(data)
      
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    reportData,
    loading,
    error,
    getClientsByRegion
  }
}
```

#### **B. Criar Componente**
```typescript
// src/renderer/src/pages/Reports/ClientReportPage.tsx
import { useReports } from '../../hooks/useReports'

const ClientReportPage = () => {
  const { reportData, loading, error, getClientsByRegion } = useReports()

  useEffect(() => {
    getClientsByRegion()
  }, [getClientsByRegion])

  if (loading) return <div>Gerando relatório...</div>
  if (error) return <div>Erro: {error}</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Relatório de Clientes por Região</h1>
      
      <div className="grid gap-4">
        {reportData.map(region => (
          <div key={region.region} className="p-4 border rounded">
            <h3 className="font-semibold">{region.region || 'Sem região'}</h3>
            <p>Clientes: {region.clientCount}</p>
            <p>Receita: R$ {region.totalRevenue?.toFixed(2) || '0.00'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ClientReportPage
```

## 🧪 **Testes e Debug**

### **1. Testar Backend (Main Process)**
```typescript
// Adicionar ao src/main/index.ts temporariamente
app.whenReady().then(async () => {
  // ... código existente

  // 🧪 TESTE DEBUG
  if (process.env.NODE_ENV === 'development') {
    setTimeout(async () => {
      try {
        console.log('🧪 Testing client report...')
        const report = await ClientService.getClientReport()
        console.log('✅ Report generated:', report)
      } catch (error) {
        console.error('❌ Report test failed:', error)
      }
    }, 3000)
  }
})
```

### **2. Testar Frontend (Console)**
```typescript
// No DevTools Console
await window.api.reports.clientsByRegion()

// Ou usar o hook de debug
const { testOperation } = useIPCDebug()
await testOperation('reports:clientsByRegion', () => 
  window.api.reports.clientsByRegion()
)
```

### **3. Teste Completo (E2E)**
```typescript
// src/renderer/src/pages/Debug/IPCTestPage.tsx
const IPCTestPage = () => {
  const [results, setResults] = useState({})

  const runTests = async () => {
    const tests = [
      ['clients:getAll', () => window.api.clients.getAll()],
      ['clients:search', () => window.api.clients.search('test')],
      ['reports:clientsByRegion', () => window.api.reports.clientsByRegion()]
    ]

    const results = {}

    for (const [name, test] of tests) {
      try {
        const start = performance.now()
        const result = await test()
        const duration = performance.now() - start

        results[name] = {
          success: true,
          duration: duration.toFixed(2),
          resultCount: Array.isArray(result) ? result.length : 1
        }
      } catch (error) {
        results[name] = {
          success: false,
          error: error.message
        }
      }
    }

    setResults(results)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">IPC Tests</h1>
      
      <button 
        onClick={runTests}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Run All Tests
      </button>

      <div className="grid gap-2">
        {Object.entries(results).map(([test, result]) => (
          <div key={test} className="p-3 border rounded">
            <h3 className="font-mono text-sm">{test}</h3>
            {result.success ? (
              <p className="text-green-600">
                ✅ Success ({result.duration}ms) - {result.resultCount} items
              </p>
            ) : (
              <p className="text-red-600">❌ Error: {result.error}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

## 📊 **Monitoramento de Performance**

### **1. Performance Tracking Hook**
```typescript
// src/renderer/src/hooks/usePerformance.ts
export function usePerformance() {
  const [metrics, setMetrics] = useState<Record<string, number[]>>({})

  const trackOperation = useCallback(async (
    name: string,
    operation: () => Promise<any>
  ) => {
    const start = performance.now()
    
    try {
      const result = await operation()
      const duration = performance.now() - start
      
      setMetrics(prev => ({
        ...prev,
        [name]: [...(prev[name] || []), duration]
      }))
      
      return result
    } catch (error) {
      const duration = performance.now() - start
      
      setMetrics(prev => ({
        ...prev,
        [`${name}_error`]: [...(prev[`${name}_error`] || []), duration]
      }))
      
      throw error
    }
  }, [])

  const getStats = useCallback((operation: string) => {
    const times = metrics[operation] || []
    if (times.length === 0) return null

    return {
      count: times.length,
      avg: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      last: times[times.length - 1]
    }
  }, [metrics])

  return {
    metrics,
    trackOperation,
    getStats
  }
}
```

### **2. Performance Dashboard**
```typescript
const PerformanceDashboard = () => {
  const { metrics, getStats } = usePerformance()

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">IPC Performance</h2>
      
      {Object.keys(metrics).map(operation => {
        const stats = getStats(operation)
        if (!stats) return null

        return (
          <div key={operation} className="mb-4 p-3 border rounded">
            <h3 className="font-mono text-sm">{operation}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span>Calls: {stats.count}</span>
              <span>Avg: {stats.avg.toFixed(2)}ms</span>
              <span>Min: {stats.min.toFixed(2)}ms</span>
              <span>Max: {stats.max.toFixed(2)}ms</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

## 🔄 **Workflow de Updates**

### **1. Hotfix de IPC**
```bash
# 1. Identificar problema no handler
# 2. Corrigir no src/main/handlers/
# 3. Testar com npm run dev
# 4. Commit específico para IPC
git add src/main/handlers/clientHandlers.ts
git commit -m "fix(ipc): correção no handler clients:search"
```

### **2. Nova Feature IPC**
```bash
# 1. Branch para feature
git checkout -b feature/client-reports

# 2. Implementar backend → preload → frontend
# 3. Testar em desenvolvimento
# 4. Commit organizado
git add .
git commit -m "feat(ipc): adicionar relatórios de cliente"

# 5. Merge para main
git checkout main
git merge feature/client-reports
```

### **3. Refactor de IPC**
```bash
# Quando reorganizar handlers ou mudar estrutura
git checkout -b refactor/ipc-handlers

# Mover/renomear handlers mantendo compatibilidade
# Deprecar handlers antigos gradualmente
# Testar todas as operações

git commit -m "refactor(ipc): reorganizar handlers por módulo"
```

## 🎯 **Checklist de Release**

### **Antes de fazer deploy:**
- [ ] Todos os handlers têm tratamento de erro
- [ ] Logs de IPC funcionando corretamente  
- [ ] Operações críticas testadas (CRUD de clientes)
- [ ] Performance aceitável (< 500ms para operações comuns)
- [ ] Validação de dados nos services
- [ ] Types atualizados no preload
- [ ] Documentação de novas APIs atualizada

### **Monitoramento pós-deploy:**
- [ ] Verificar logs de erro do main process
- [ ] Monitorar performance das operações IPC
- [ ] Confirmar que database migrations rodaram
- [ ] Testar operações em ambiente de produção