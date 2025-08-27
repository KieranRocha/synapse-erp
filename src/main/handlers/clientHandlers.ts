import { ipcMain } from 'electron'
import { ClientService } from '../services/ClientService'
import { withLogging } from '../utils/ipcLogger'

export function registerClientHandlers() {
  // Get all clients
  ipcMain.handle('clients:getAll', withLogging('clients:getAll', async () => {
    return await ClientService.getAllClients()
  }))

  // Get client by ID
  ipcMain.handle('clients:getById', withLogging('clients:getById', async (_, id: number) => {
    return await ClientService.getClientById(id)
  }))

  // Create new client
  ipcMain.handle('clients:create', withLogging('clients:create', async (_, clientData) => {
    return await ClientService.createClient(clientData)
  }))

  // Update client
  ipcMain.handle('clients:update', withLogging('clients:update', async (_, id: number, clientData) => {
    return await ClientService.updateClient(id, clientData)
  }))

  // Delete client
  ipcMain.handle('clients:delete', withLogging('clients:delete', async (_, id: number) => {
    return await ClientService.deleteClient(id)
  }))

  // Search clients
  ipcMain.handle('clients:search', withLogging('clients:search', async (_, searchTerm: string) => {
    return await ClientService.searchClients(searchTerm)
  }))

  console.log('✅ Client IPC handlers registered with logging')
}