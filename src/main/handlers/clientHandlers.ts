import { ipcMain } from 'electron'
import { ClientService } from '../services/ClientService'
import { withLogging } from '../utils/ipcLogger'
import { validateUserAccess } from '../utils/authHelper'

export function registerClientHandlers() {
  // Get all clients
  ipcMain.handle('clients:getAll', withLogging('clients:getAll', async (_, token: string) => {
    const { tenantId } = await validateUserAccess(token)
    return await ClientService.getAllClients(tenantId)
  }))

  // Get client by ID
  ipcMain.handle('clients:getById', withLogging('clients:getById', async (_, token: string, id: number) => {
    const { tenantId } = await validateUserAccess(token)
    return await ClientService.getClientById(tenantId, id)
  }))

  // Create new client
  ipcMain.handle('clients:create', withLogging('clients:create', async (_, token: string, clientData) => {
    const { tenantId } = await validateUserAccess(token)
    return await ClientService.createClient(tenantId, clientData)
  }))

  // Update client
  ipcMain.handle('clients:update', withLogging('clients:update', async (_, token: string, id: number, clientData) => {
    const { tenantId } = await validateUserAccess(token)
    return await ClientService.updateClient(tenantId, id, clientData)
  }))

  // Delete client
  ipcMain.handle('clients:delete', withLogging('clients:delete', async (_, token: string, id: number) => {
    const { tenantId } = await validateUserAccess(token)
    return await ClientService.deleteClient(tenantId, id)
  }))

  // Search clients
  ipcMain.handle('clients:search', withLogging('clients:search', async (_, token: string, searchTerm: string) => {
    const { tenantId } = await validateUserAccess(token)
    return await ClientService.searchClients(tenantId, searchTerm)
  }))

  console.log('✅ Client IPC handlers registered with logging')
}