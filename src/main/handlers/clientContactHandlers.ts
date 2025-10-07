import { ipcMain } from 'electron'
import { ClientContactService } from '../services/ClientContactService'
import { withLogging } from '../utils/ipcLogger'
import { validateUserAccess } from '../utils/authHelper'

export function registerClientContactHandlers() {
  // Get all contacts for a client
  ipcMain.handle(
    'clientContacts:getAll',
    withLogging('clientContacts:getAll', async (_, token: string, clientId: number) => {
      const { tenantId } = await validateUserAccess(token)
      return await ClientContactService.getClientContacts(tenantId, clientId)
    })
  )

  // Get contact by ID
  ipcMain.handle(
    'clientContacts:getById',
    withLogging('clientContacts:getById', async (_, token: string, id: number) => {
      const { tenantId } = await validateUserAccess(token)
      return await ClientContactService.getContactById(tenantId, id)
    })
  )

  // Create new contact
  ipcMain.handle(
    'clientContacts:create',
    withLogging(
      'clientContacts:create',
      async (_, token: string, clientId: number, contactData) => {
        const { tenantId } = await validateUserAccess(token)
        return await ClientContactService.createContact(tenantId, clientId, contactData)
      }
    )
  )

  // Update contact
  ipcMain.handle(
    'clientContacts:update',
    withLogging(
      'clientContacts:update',
      async (_, token: string, clientId: number, id: number, contactData) => {
        const { tenantId } = await validateUserAccess(token)
        return await ClientContactService.updateContact(tenantId, clientId, id, contactData)
      }
    )
  )

  // Delete contact
  ipcMain.handle(
    'clientContacts:delete',
    withLogging('clientContacts:delete', async (_, token: string, clientId: number, id: number) => {
      const { tenantId } = await validateUserAccess(token)
      return await ClientContactService.deleteContact(tenantId, clientId, id)
    })
  )

  // Set primary contact
  ipcMain.handle(
    'clientContacts:setPrimary',
    withLogging(
      'clientContacts:setPrimary',
      async (_, token: string, clientId: number, id: number) => {
        const { tenantId } = await validateUserAccess(token)
        return await ClientContactService.setPrimaryContact(tenantId, clientId, id)
      }
    )
  )

  console.log('✅ Client Contact IPC handlers registered with logging')
}
