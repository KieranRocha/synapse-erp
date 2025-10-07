import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface SellerInput {
  nome: string
  email?: string
  telefone?: string
  celular?: string
  comissao?: number
  ativo?: boolean
  observacoes?: string
}

export class SellerService {
  // Buscar todos os vendedores do tenant
  static async getAllSellers(tenantId: string) {
    return await prisma.seller.findMany({
      where: { tenantId },
      orderBy: [
        { ativo: 'desc' },
        { nome: 'asc' }
      ]
    })
  }

  // Buscar apenas vendedores ativos
  static async getActiveSellers(tenantId: string) {
    return await prisma.seller.findMany({
      where: {
        tenantId,
        ativo: true
      },
      orderBy: { nome: 'asc' }
    })
  }

  // Buscar vendedor por ID
  static async getSellerById(tenantId: string, id: number) {
    const seller = await prisma.seller.findFirst({
      where: {
        id,
        tenantId
      }
    })

    if (!seller) {
      throw new Error('Vendedor não encontrado')
    }

    return seller
  }

  // Criar novo vendedor
  static async createSeller(tenantId: string, data: SellerInput) {
    return await prisma.seller.create({
      data: {
        tenantId,
        nome: data.nome,
        email: data.email || '',
        telefone: data.telefone || '',
        celular: data.celular || '',
        comissao: data.comissao || 0,
        ativo: data.ativo ?? true,
        observacoes: data.observacoes || ''
      }
    })
  }

  // Atualizar vendedor
  static async updateSeller(tenantId: string, id: number, data: SellerInput) {
    // Verificar se existe e pertence ao tenant
    await this.getSellerById(tenantId, id)

    return await prisma.seller.update({
      where: { id },
      data: {
        nome: data.nome,
        email: data.email || '',
        telefone: data.telefone || '',
        celular: data.celular || '',
        comissao: data.comissao || 0,
        ativo: data.ativo ?? true,
        observacoes: data.observacoes || ''
      }
    })
  }

  // Deletar vendedor
  static async deleteSeller(tenantId: string, id: number) {
    // Verificar se existe e pertence ao tenant
    await this.getSellerById(tenantId, id)

    // Verificar se está sendo usado como vendedor padrão em algum cliente
    const clientsUsingSeller = await prisma.client.count({
      where: {
        tenantId,
        vendedor_padrao_id: id
      }
    })

    if (clientsUsingSeller > 0) {
      throw new Error(
        `Não é possível excluir este vendedor pois ele está associado a ${clientsUsingSeller} cliente(s)`
      )
    }

    return await prisma.seller.delete({
      where: { id }
    })
  }

  // Desativar vendedor (soft delete)
  static async deactivateSeller(tenantId: string, id: number) {
    await this.getSellerById(tenantId, id)

    return await prisma.seller.update({
      where: { id },
      data: { ativo: false }
    })
  }

  // Ativar vendedor
  static async activateSeller(tenantId: string, id: number) {
    await this.getSellerById(tenantId, id)

    return await prisma.seller.update({
      where: { id },
      data: { ativo: true }
    })
  }
}
