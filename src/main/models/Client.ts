import { prisma } from '../database'
import { Client as PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

export interface Client {
  id: number
  tipo_pessoa: string | null
  razao_social: string
  nome_fantasia: string | null
  cpf_cnpj: string
  indicador_ie: string | null
  ie: string | null
  im: string | null
  suframa: string | null
  regime_trib: string | null
  cep: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  uf: string | null
  pais: string | null
  email: string | null
  telefone: string | null
  responsavel: string | null
  cargo: string | null
  cond_pgto_padrao: string | null
  limite_credito: number | null
  vendedor_padrao: string | null
  transporte_padrao: string | null
  observacoes: string | null
  created_at: Date
  updated_at: Date
}

function serializeClient(prismaClient: PrismaClient): Client {
  return {
    ...prismaClient,
    limite_credito: prismaClient.limite_credito ? Number(prismaClient.limite_credito) : null
  }
}

export class ClientModel {
  static async findAll(): Promise<Client[]> {
    const clients = await prisma.client.findMany({
      orderBy: { created_at: 'desc' }
    })
    return clients.map(serializeClient)
  }

  static async findById(id: number): Promise<Client | null> {
    const client = await prisma.client.findUnique({
      where: { id }
    })
    return client ? serializeClient(client) : null
  }

  static async findByCpfCnpj(cpfCnpj: string): Promise<Client | null> {
    const client = await prisma.client.findFirst({
      where: { cpf_cnpj: cpfCnpj }
    })
    return client ? serializeClient(client) : null
  }

  static async create(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    const data = {
      ...client,
      limite_credito: client.limite_credito ? new Decimal(client.limite_credito) : null
    }
    const newClient = await prisma.client.create({
      data
    })
    return serializeClient(newClient)
  }

  static async update(id: number, client: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>): Promise<Client | null> {
    try {
      const data = {
        ...client,
        limite_credito: client.limite_credito !== undefined 
          ? (client.limite_credito ? new Decimal(client.limite_credito) : null)
          : undefined
      }
      const updatedClient = await prisma.client.update({
        where: { id },
        data
      })
      return serializeClient(updatedClient)
    } catch (error) {
      return null
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      await prisma.client.delete({
        where: { id }
      })
      return true
    } catch (error) {
      return false
    }
  }

  static async search(term: string): Promise<Client[]> {
    const clients = await prisma.client.findMany({
      where: {
        OR: [
          { razao_social: { contains: term, mode: 'insensitive' } },
          { nome_fantasia: { contains: term, mode: 'insensitive' } },
          { cpf_cnpj: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } }
        ]
      },
      orderBy: { created_at: 'desc' }
    })
    return clients.map(serializeClient)
  }
}