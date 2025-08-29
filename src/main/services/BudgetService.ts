import { z } from 'zod'
import { BudgetModel, Budget } from '../models/Budget'

// ------------------------------
// Validation schemas
// ------------------------------

const budgetItemSchema = z.object({
  categoria: z.string(),
  codigo: z.string().optional(),
  nome: z.string(),
  un: z.string(),
  qtd: z.number(),
  preco: z.number()
})

const budgetSchema = z.object({
  rev: z.number().default(0),
  numero: z.string(),
  cliente: z.string(),
  projeto: z.string(),
  valor: z.number(),
  status: z.string(),
  emissao: z.string(),
  validade: z.string(),
  resp: z.string(),
  margem: z.number(),
  slaDias: z.number().nullable().optional(),
  enviado: z.boolean().optional(),
  respondeuEm: z.string().nullable().optional(),
  items: z.array(budgetItemSchema).optional()
})

// ------------------------------
// Service implementation
// ------------------------------

export class BudgetService {
  static async getAllBudgets(): Promise<Budget[]> {
    try {
      return await BudgetModel.findAll()
    } catch (error) {
      console.error('Error fetching budgets:', error)
      throw new Error('Failed to fetch budgets')
    }
  }

  static async getBudgetById(id: number): Promise<Budget | null> {
    try {
      return await BudgetModel.findById(id)
    } catch (error) {
      console.error(`Error fetching budget with id ${id}:`, error)
      throw new Error('Failed to fetch budget')
    }
  }

  static async createBudget(data: unknown): Promise<Budget> {
    try {
      const validated = budgetSchema.parse(data)
      return await BudgetModel.create(validated)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Dados inválidos: ${error.issues.map((e) => e.message).join(', ')}`)
      }
      console.error('Error creating budget:', error)
      throw error
    }
  }

  static async updateBudget(id: number, data: unknown): Promise<Budget | null> {
    try {
      const validated = budgetSchema.partial().parse(data)
      return await BudgetModel.update(id, validated)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Dados inválidos: ${error.issues.map((e) => e.message).join(', ')}`)
      }
      console.error(`Error updating budget with id ${id}:`, error)
      throw error
    }
  }

  static async deleteBudget(id: number): Promise<boolean> {
    try {
      return await BudgetModel.delete(id)
    } catch (error) {
      console.error(`Error deleting budget with id ${id}:`, error)
      throw error
    }
  }
}

