import { ipcMain } from 'electron'
import { withLogging } from '../utils/ipcLogger'
import { BudgetService } from '../services/BudgetService'

export function registerBudgetHandlers() {
  ipcMain.handle(
    'budgets:getAll',
    withLogging('budgets:getAll', async () => {
      return await BudgetService.getAllBudgets()
    })
  )

  ipcMain.handle(
    'budgets:getById',
    withLogging('budgets:getById', async (_, id: number) => {
      return await BudgetService.getBudgetById(id)
    })
  )

  ipcMain.handle(
    'budgets:search',
    withLogging('budgets:search', async (_, term: string) => {
      return await BudgetService.searchBudgets(term)
    })
  )

  ipcMain.handle(
    'budgets:create',
    withLogging('budgets:create', async (_, payload) => {
      return await BudgetService.createBudget(payload)
    })
  )

  ipcMain.handle(
    'budgets:update',
    withLogging('budgets:update', async (_, id: number, payload) => {
      return await BudgetService.updateBudget(id, payload)
    })
  )

  ipcMain.handle(
    'budgets:delete',
    withLogging('budgets:delete', async (_, id: number) => {
      return await BudgetService.deleteBudget(id)
    })
  )

  console.log('Budget IPC handlers registered with logging')
}

