import { ipcMain } from 'electron'
import { SellerService } from '../services/SellerService'
import { withLogging } from '../utils/ipcLogger'
import { validateUserAccess } from '../utils/authHelper'

export function registerSellerHandlers() {
  // Get all sellers
  ipcMain.handle(
    'sellers:getAll',
    withLogging('sellers:getAll', async (_, token: string) => {
      const { tenantId } = await validateUserAccess(token)
      return await SellerService.getAllSellers(tenantId)
    })
  )

  // Get active sellers only
  ipcMain.handle(
    'sellers:getActive',
    withLogging('sellers:getActive', async (_, token: string) => {
      const { tenantId } = await validateUserAccess(token)
      return await SellerService.getActiveSellers(tenantId)
    })
  )

  // Get seller by ID
  ipcMain.handle(
    'sellers:getById',
    withLogging('sellers:getById', async (_, token: string, id: number) => {
      const { tenantId } = await validateUserAccess(token)
      return await SellerService.getSellerById(tenantId, id)
    })
  )

  // Create new seller
  ipcMain.handle(
    'sellers:create',
    withLogging('sellers:create', async (_, token: string, sellerData) => {
      const { tenantId } = await validateUserAccess(token)
      return await SellerService.createSeller(tenantId, sellerData)
    })
  )

  // Update seller
  ipcMain.handle(
    'sellers:update',
    withLogging('sellers:update', async (_, token: string, id: number, sellerData) => {
      const { tenantId } = await validateUserAccess(token)
      return await SellerService.updateSeller(tenantId, id, sellerData)
    })
  )

  // Delete seller
  ipcMain.handle(
    'sellers:delete',
    withLogging('sellers:delete', async (_, token: string, id: number) => {
      const { tenantId } = await validateUserAccess(token)
      return await SellerService.deleteSeller(tenantId, id)
    })
  )

  // Deactivate seller
  ipcMain.handle(
    'sellers:deactivate',
    withLogging('sellers:deactivate', async (_, token: string, id: number) => {
      const { tenantId } = await validateUserAccess(token)
      return await SellerService.deactivateSeller(tenantId, id)
    })
  )

  // Activate seller
  ipcMain.handle(
    'sellers:activate',
    withLogging('sellers:activate', async (_, token: string, id: number) => {
      const { tenantId } = await validateUserAccess(token)
      return await SellerService.activateSeller(tenantId, id)
    })
  )

  console.log('✅ Seller IPC handlers registered with logging')
}
