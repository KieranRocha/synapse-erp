import { db } from '../database'

export interface Client {
  id?: number
  tipo_pessoa: 'PJ' | 'PF'
  razao_social: string
  nome_fantasia?: string
  cpf_cnpj: string
  indicador_ie: 'Contribuinte' | 'Isento' | 'Não Contribuinte'
  ie?: string
  im?: string
  suframa?: string
  regime_trib: 'Simples Nacional' | 'Lucro Presumido' | 'Lucro Real'
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  uf?: string
  pais?: string
  email?: string
  telefone?: string
  responsavel?: string
  cargo?: string
  cond_pgto_padrao?: string
  limite_credito?: number
  vendedor_padrao?: string
  transporte_padrao: 'CIF' | 'FOB'
  observacoes?: string
  created_at?: Date
  updated_at?: Date
}

export class ClientModel {
  private static table = 'clients'

  static async findAll(): Promise<Client[]> {
    return db(this.table).select('*')
  }

  static async findById(id: number): Promise<Client | undefined> {
    return db(this.table).where({ id }).first()
  }

  static async findByCpfCnpj(cpfCnpj: string): Promise<Client | undefined> {
    return db(this.table).where({ cpf_cnpj: cpfCnpj }).first()
  }

  static async create(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    const [newClient] = await db(this.table).insert(client).returning('*')
    return newClient
  }

  static async update(id: number, client: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>): Promise<Client | undefined> {
    const [updatedClient] = await db(this.table)
      .where({ id })
      .update(client)
      .returning('*')
    return updatedClient
  }

  static async delete(id: number): Promise<boolean> {
    const deletedCount = await db(this.table).where({ id }).del()
    return deletedCount > 0
  }

  static async search(term: string): Promise<Client[]> {
    return db(this.table)
      .where('razao_social', 'ilike', `%${term}%`)
      .orWhere('nome_fantasia', 'ilike', `%${term}%`)
      .orWhere('cpf_cnpj', 'ilike', `%${term}%`)
      .orWhere('email', 'ilike', `%${term}%`)
  }
}