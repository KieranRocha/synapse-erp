import { Tenant as PrismaTenant, Usuario } from '@prisma/client'

export interface Tenant extends PrismaTenant {
  usuarios?: Usuario[]
}

export interface CreateTenantData {
  razaoSocial: string
  nomeFantasia?: string
  cnpj?: string
  ie?: string
  im?: string
  email?: string
  telefone?: string
  endereco?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  municipioIbge?: string
  uf?: string
  cep?: string
  timezone?: string
  moeda?: string
}