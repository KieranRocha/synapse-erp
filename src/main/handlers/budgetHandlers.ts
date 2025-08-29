import { ipcMain } from 'electron'
import { BudgetService } from '../services/BudgetService'
import { withLogging } from '../utils/ipcLogger'

// Register IPC handlers for Budget operations
export function registerBudgetHandlers() {
  // Get all budgets
  ipcMain.handle(
    'budgets:getAll',
    withLogging('budgets:getAll', async () => {
      return await BudgetService.getAllBudgets()
    })
  )

  // Get budget by ID
  ipcMain.handle(
    'budgets:getById',
    withLogging('budgets:getById', async (_, id: number) => {
      return await BudgetService.getBudgetById(id)
    })
  )

  // Create new budget
  ipcMain.handle(
    'budgets:create',
    withLogging('budgets:create', async (_, data) => {
      return await BudgetService.createBudget(data)
    })
  )

  // Update budget
  ipcMain.handle(
    'budgets:update',
    withLogging('budgets:update', async (_, id: number, data) => {
      return await BudgetService.updateBudget(id, data)
    })
  )

  // Delete budget
  ipcMain.handle(
    'budgets:delete',
    withLogging('budgets:delete', async (_, id: number) => {
      return await BudgetService.deleteBudget(id)
    })
  )

  console.log('✅ Budget IPC handlers registered with logging')
}

