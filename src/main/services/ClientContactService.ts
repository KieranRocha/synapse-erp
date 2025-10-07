import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface ClientContactInput {
  nome: string
  cargo?: string
  email: string
  telefone: string
  celular?: string
  principal?: boolean
  ativo?: boolean
  observacoes?: string
}

export class ClientContactService {
  // Buscar todos os contatos de um cliente
  static async getClientContacts(tenantId: string, clientId: number) {
    return await prisma.clientContact.findMany({
      where: {
        tenantId,
        clientId
      },
      orderBy: [
        { principal: 'desc' },
        { nome: 'asc' }
      ]
    })
  }

  // Buscar contato por ID
  static async getContactById(tenantId: string, id: number) {
    const contact = await prisma.clientContact.findFirst({
      where: {
        id,
        tenantId
      }
    })

    if (!contact) {
      throw new Error('Contato não encontrado')
    }

    return contact
  }

  // Criar novo contato
  static async createContact(tenantId: string, clientId: number, data: ClientContactInput) {
    // Verificar se o cliente existe e pertence ao tenant
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        tenantId
      }
    })

    if (!client) {
      throw new Error('Cliente não encontrado')
    }

    // Se o novo contato é principal, remover flag dos outros
    if (data.principal) {
      await prisma.clientContact.updateMany({
        where: {
          clientId,
          tenantId
        },
        data: { principal: false }
      })
    }

    return await prisma.clientContact.create({
      data: {
        tenantId,
        clientId,
        nome: data.nome,
        cargo: data.cargo || '',
        email: data.email,
        telefone: data.telefone,
        celular: data.celular || '',
        principal: data.principal ?? false,
        ativo: data.ativo ?? true,
        observacoes: data.observacoes || ''
      }
    })
  }

  // Atualizar contato
  static async updateContact(
    tenantId: string,
    clientId: number,
    id: number,
    data: ClientContactInput
  ) {
    // Verificar se existe e pertence ao tenant e cliente
    const contact = await prisma.clientContact.findFirst({
      where: {
        id,
        clientId,
        tenantId
      }
    })

    if (!contact) {
      throw new Error('Contato não encontrado')
    }

    // Se está marcando como principal, remover flag dos outros
    if (data.principal && !contact.principal) {
      await prisma.clientContact.updateMany({
        where: {
          clientId,
          tenantId,
          id: { not: id }
        },
        data: { principal: false }
      })
    }

    return await prisma.clientContact.update({
      where: { id },
      data: {
        nome: data.nome,
        cargo: data.cargo || '',
        email: data.email,
        telefone: data.telefone,
        celular: data.celular || '',
        principal: data.principal ?? false,
        ativo: data.ativo ?? true,
        observacoes: data.observacoes || ''
      }
    })
  }

  // Deletar contato
  static async deleteContact(tenantId: string, clientId: number, id: number) {
    // Verificar se existe e pertence ao tenant e cliente
    const contact = await prisma.clientContact.findFirst({
      where: {
        id,
        clientId,
        tenantId
      }
    })

    if (!contact) {
      throw new Error('Contato não encontrado')
    }

    return await prisma.clientContact.delete({
      where: { id }
    })
  }

  // Marcar contato como principal
  static async setPrimaryContact(tenantId: string, clientId: number, id: number) {
    // Verificar se existe
    await this.getContactById(tenantId, id)

    // Remover flag de principal de todos os contatos do cliente
    await prisma.clientContact.updateMany({
      where: {
        clientId,
        tenantId
      },
      data: { principal: false }
    })

    // Marcar o contato específico como principal
    return await prisma.clientContact.update({
      where: { id },
      data: { principal: true }
    })
  }
}
