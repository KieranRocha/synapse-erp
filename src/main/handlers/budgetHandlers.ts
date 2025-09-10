import { ipcMain } from 'electron'
import { withLogging } from '../utils/ipcLogger'
import { BudgetService } from '../services/BudgetService'
import { validateUserAccess } from '../utils/authHelper'

export function registerBudgetHandlers() {
  ipcMain.handle(
    'budgets:getAll',
    withLogging('budgets:getAll', async (_, token: string) => {
      const { tenantId } = await validateUserAccess(token)
      return await BudgetService.getAllBudgets(tenantId)
    })
  )

  ipcMain.handle(
    'budgets:getById',
    withLogging('budgets:getById', async (_, token: string, id: number) => {
      const { tenantId } = await validateUserAccess(token)
      return await BudgetService.getBudgetById(tenantId, id)
    })
  )

  ipcMain.handle(
    'budgets:search',
    withLogging('budgets:search', async (_, token: string, term: string) => {
      const { tenantId } = await validateUserAccess(token)
      return await BudgetService.searchBudgets(tenantId, term)
    })
  )

  ipcMain.handle(
    'budgets:create',
    withLogging('budgets:create', async (_, token: string, payload) => {
      const { tenantId } = await validateUserAccess(token)
      return await BudgetService.createBudget(tenantId, payload)
    })
  )

  ipcMain.handle(
    'budgets:update',
    withLogging('budgets:update', async (_, token: string, id: number, payload) => {
      const { tenantId } = await validateUserAccess(token)
      return await BudgetService.updateBudget(tenantId, id, payload)
    })
  )

  ipcMain.handle(
    'budgets:delete',
    withLogging('budgets:delete', async (_, token: string, id: number) => {
      const { tenantId } = await validateUserAccess(token)
      return await BudgetService.deleteBudget(tenantId, id)
    })
  )

  console.log('Budget IPC handlers registered with logging')
}

