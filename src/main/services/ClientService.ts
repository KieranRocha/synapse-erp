import { ClientModel, Client } from '../models/Client'
import { clienteSchema } from '../../renderer/src/modules/clientes/schemas/clienteSchema'
import { z } from 'zod'

export class ClientService {
  static async getAllClients(tenantId: string): Promise<Client[]> {
    try {
      return await ClientModel.findAll(tenantId)
    } catch (error) {
      console.error('Error fetching all clients:', error)
      throw new Error('Failed to fetch clients')
    }
  }

  static async getClientById(tenantId: string, id: number): Promise<Client | null> {
    try {
      const client = await ClientModel.findById(tenantId, id)
      return client || null
    } catch (error) {
      console.error(`Error fetching client with id ${id}:`, error)
      throw new Error('Failed to fetch client')
    }
  }

  static async createClient(tenantId: string, clientData: z.infer<typeof clienteSchema>): Promise<Client> {
    try {
      // Validate input data
      const validatedData = clienteSchema.parse(clientData)
      
      // Check if client with same CPF/CNPJ already exists in this tenant
      const existingClient = await ClientModel.findByCpfCnpj(tenantId, validatedData.cpfCnpj)
      if (existingClient) {
        throw new Error('Cliente com este CPF/CNPJ já existe')
      }

      // Transform data to match database schema
      const dbClientData = {
        tenantId,
        tipo_pessoa: validatedData.tipoPessoa,
        razao_social: validatedData.razaoSocial,
        nome_fantasia: validatedData.nomeFantasia || '',
        cpf_cnpj: validatedData.cpfCnpj,
        indicador_ie: validatedData.indicadorIE,
        ie: validatedData.ie || '',
        im: validatedData.im || '',
        suframa: validatedData.suframa || '',
        regime_trib: validatedData.regimeTrib,
        cep: validatedData.cep || '',
        logradouro: validatedData.logradouro || '',
        numero: validatedData.numero || '',
        complemento: validatedData.complemento || '',
        bairro: validatedData.bairro || '',
        cidade: validatedData.cidade || '',
        uf: validatedData.uf || '',
        pais: validatedData.pais || 'Brasil',
        email: validatedData.email || '',
        telefone: validatedData.telefone || '',
        responsavel: validatedData.responsavel || '',
        cargo: validatedData.cargo || '',
        cond_pgto_padrao: validatedData.condPgtoPadrao || '',
        limite_credito: validatedData.limiteCredito || 0,
        vendedor_padrao: validatedData.vendedorPadrao || '',
        transporte_padrao: validatedData.transportePadrao,
        observacoes: validatedData.observacoes || ''
      }

      return await ClientModel.create(dbClientData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Dados inválidos: ${error.issues.map(e => e.message).join(', ')}`)
      }
      console.error('Error creating client:', error)
      throw error
    }
  }

  static async updateClient(tenantId: string, id: number, clientData: Partial<z.infer<typeof clienteSchema>>): Promise<Client | null> {
    try {
      // Check if client exists in this tenant
      const existingClient = await ClientModel.findById(tenantId, id)
      if (!existingClient) {
        throw new Error('Cliente não encontrado')
      }

      // Transform data to match database schema if provided
      const dbClientData: Partial<Client> = {}
      
      if (clientData.tipoPessoa !== undefined) dbClientData.tipo_pessoa = clientData.tipoPessoa
      if (clientData.razaoSocial !== undefined) dbClientData.razao_social = clientData.razaoSocial
      if (clientData.nomeFantasia !== undefined) dbClientData.nome_fantasia = clientData.nomeFantasia
      if (clientData.cpfCnpj !== undefined) dbClientData.cpf_cnpj = clientData.cpfCnpj
      if (clientData.indicadorIE !== undefined) dbClientData.indicador_ie = clientData.indicadorIE
      if (clientData.ie !== undefined) dbClientData.ie = clientData.ie
      if (clientData.im !== undefined) dbClientData.im = clientData.im
      if (clientData.suframa !== undefined) dbClientData.suframa = clientData.suframa
      if (clientData.regimeTrib !== undefined) dbClientData.regime_trib = clientData.regimeTrib
      if (clientData.cep !== undefined) dbClientData.cep = clientData.cep
      if (clientData.logradouro !== undefined) dbClientData.logradouro = clientData.logradouro
      if (clientData.numero !== undefined) dbClientData.numero = clientData.numero
      if (clientData.complemento !== undefined) dbClientData.complemento = clientData.complemento
      if (clientData.bairro !== undefined) dbClientData.bairro = clientData.bairro
      if (clientData.cidade !== undefined) dbClientData.cidade = clientData.cidade
      if (clientData.uf !== undefined) dbClientData.uf = clientData.uf
      if (clientData.pais !== undefined) dbClientData.pais = clientData.pais
      if (clientData.email !== undefined) dbClientData.email = clientData.email
      if (clientData.telefone !== undefined) dbClientData.telefone = clientData.telefone
      if (clientData.responsavel !== undefined) dbClientData.responsavel = clientData.responsavel
      if (clientData.cargo !== undefined) dbClientData.cargo = clientData.cargo
      if (clientData.condPgtoPadrao !== undefined) dbClientData.cond_pgto_padrao = clientData.condPgtoPadrao
      if (clientData.limiteCredito !== undefined) dbClientData.limite_credito = clientData.limiteCredito
      if (clientData.vendedorPadrao !== undefined) dbClientData.vendedor_padrao = clientData.vendedorPadrao
      if (clientData.transportePadrao !== undefined) dbClientData.transporte_padrao = clientData.transportePadrao
      if (clientData.observacoes !== undefined) dbClientData.observacoes = clientData.observacoes

      const updatedClient = await ClientModel.update(tenantId, id, dbClientData)
      return updatedClient || null
    } catch (error) {
      console.error(`Error updating client with id ${id}:`, error)
      throw error
    }
  }

  static async deleteClient(tenantId: string, id: number): Promise<boolean> {
    try {
      // Check if client exists in this tenant
      const existingClient = await ClientModel.findById(tenantId, id)
      if (!existingClient) {
        throw new Error('Cliente não encontrado')
      }

      return await ClientModel.delete(tenantId, id)
    } catch (error) {
      console.error(`Error deleting client with id ${id}:`, error)
      throw error
    }
  }

  static async searchClients(tenantId: string, searchTerm: string): Promise<Client[]> {
    try {
      if (!searchTerm.trim()) {
        return await this.getAllClients(tenantId)
      }
      return await ClientModel.search(tenantId, searchTerm.trim())
    } catch (error) {
      console.error('Error searching clients:', error)
      throw new Error('Failed to search clients')
    }
  }
}