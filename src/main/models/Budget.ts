import { prisma } from '../database'
import { Budget as PrismaBudget, BudgetItem as PrismaBudgetItem } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

// ------------------------------
// Budget & BudgetItem interfaces
// ------------------------------

export interface BudgetItem {
  id: number
  categoria: string
  codigo: string | null
  nome: string
  un: string
  qtd: number
  preco: number
}

export interface Budget {
  id: number
  rev: number
  numero: string
  cliente: string
  projeto: string
  valor: number
  status: string
  emissao: string
  validade: string
  resp: string
  margem: number
  slaDias: number | null
  enviado: boolean
  respondeuEm: string | null
  created_at: Date
  updated_at: Date
  items?: BudgetItem[]
}

// ------------------------------
// Serialization helpers
// ------------------------------

function serializeItem(item: PrismaBudgetItem): BudgetItem {
  return {
    ...item,
    codigo: item.codigo ?? null,
    qtd: Number(item.qtd),
    preco: Number(item.preco)
  }
}

function serializeBudget(budget: PrismaBudget & { items?: PrismaBudgetItem[] }): Budget {
  return {
    id: budget.id,
    rev: budget.rev,
    numero: budget.numero,
    cliente: budget.cliente,
    projeto: budget.projeto,
    valor: Number(budget.valor),
    status: budget.status,
    emissao: budget.emissao.toISOString().split('T')[0],
    validade: budget.validade.toISOString().split('T')[0],
    resp: budget.resp,
    margem: Number(budget.margem),
    slaDias: budget.slaDias ?? null,
    enviado: budget.enviado,
    respondeuEm: budget.respondeuEm
      ? budget.respondeuEm.toISOString().split('T')[0]
      : null,
    created_at: budget.created_at,
    updated_at: budget.updated_at,
    items: budget.items?.map(serializeItem)
  }
}

// ------------------------------
// Model implementation
// ------------------------------

export class BudgetModel {
  static async findAll(): Promise<Budget[]> {
    const budgets = await prisma.budget.findMany({
      include: { items: true },
      orderBy: { created_at: 'desc' }
    })
    return budgets.map(serializeBudget)
  }

  static async findById(id: number): Promise<Budget | null> {
    const budget = await prisma.budget.findUnique({
      where: { id },
      include: { items: true }
    })
    return budget ? serializeBudget(budget) : null
  }

  static async create(
    budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'> & { items?: Omit<BudgetItem, 'id'>[] }
  ): Promise<Budget> {
    const items = budget.items?.map((item) => ({
      categoria: item.categoria,
      codigo: item.codigo ?? undefined,
      nome: item.nome,
      un: item.un,
      qtd: new Decimal(item.qtd),
      preco: new Decimal(item.preco)
    }))

    const data = {
      ...budget,
      emissao: new Date(budget.emissao),
      validade: new Date(budget.validade),
      respondeuEm: budget.respondeuEm ? new Date(budget.respondeuEm) : null,
      valor: new Decimal(budget.valor),
      margem: new Decimal(budget.margem),
      items: items ? { create: items } : undefined
    }

    const created = await prisma.budget.create({ data, include: { items: true } })
    return serializeBudget(created)
  }

  static async update(
    id: number,
    budget: Partial<Omit<Budget, 'id' | 'created_at' | 'updated_at' | 'items'>>
  ): Promise<Budget | null> {
    try {
      const data: any = {
        ...budget,
        valor: budget.valor !== undefined ? new Decimal(budget.valor) : undefined,
        margem: budget.margem !== undefined ? new Decimal(budget.margem) : undefined
      }

      const updated = await prisma.budget.update({
        where: { id },
        data: {
          ...data,
          emissao: budget.emissao ? new Date(budget.emissao) : undefined,
          validade: budget.validade ? new Date(budget.validade) : undefined,
          respondeuEm: budget.respondeuEm
            ? new Date(budget.respondeuEm)
            : undefined
        },
        include: { items: true }
      })
      return serializeBudget(updated)
    } catch (error) {
      return null
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      await prisma.budget.delete({ where: { id } })
      return true
    } catch (error) {
      return false
    }
  }
}

