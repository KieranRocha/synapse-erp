import { Usuario as PrismaUsuario, Tenant } from '@prisma/client'

export interface Usuario extends PrismaUsuario {
  tenant?: Tenant
}

export interface CreateUsuarioData {
  tenantId: string
  email: string
  senha: string
  nome: string
  cargo?: string
  permissoes?: any
}

export interface UsuarioWithoutPassword {
  id: string
  tenantId: string
  email: string
  nome: string
  cargo?: string | null
  permissoes: any
  ativo: boolean
  ultimoLogin?: Date | null
  createdAt: Date
  updatedAt: Date
  tenant?: {
    id: string
    razaoSocial: string
    nomeFantasia?: string | null
    cnpj?: string | null
    email?: string | null
    cidade?: string | null
    uf?: string | null
    timezone: string
    moeda: string
  }
}

export interface AuthResult {
  user: UsuarioWithoutPassword
  token: string
}