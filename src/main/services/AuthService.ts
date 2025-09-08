import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../database'
import { UsuarioWithoutPassword, AuthResult, CreateUsuarioData } from '../models/Usuario'
import { AppError } from '../utils/AppError'
import { ErrorCode } from '../utils/ErrorCodes'

export class AuthService {
  private readonly jwtSecret: string
  private readonly jwtExpiresIn: string

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret'
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d'
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  generateToken(userId: string, tenantId: string): string {
    const payload = { userId, tenantId };
    const options: jwt.SignOptions = { expiresIn: this.jwtExpiresIn as any };
    return jwt.sign(payload, this.jwtSecret, options);
  }

  verifyToken(token: string): { userId: string; tenantId: string } {
    return jwt.verify(token, this.jwtSecret) as { userId: string; tenantId: string }
  }

  async authenticate(email: string, password: string): Promise<AuthResult> {
    try {
      const usuario = await prisma.usuario.findFirst({
        where: {
          email: email.toLowerCase(),
          ativo: true
        },
        include: {
          tenant: {
            select: {
              id: true,
              razaoSocial: true,
              nomeFantasia: true,
              cnpj: true,
              email: true,
              cidade: true,
              uf: true,
              timezone: true,
              moeda: true
            }
          }
        }
      })

      if (!usuario) {
        throw AppError.emailNotFound(email)
      }

      const isPasswordValid = await this.comparePassword(password, usuario.senhaHash)
      if (!isPasswordValid) {
        throw AppError.invalidCredentials({ email })
      }

      // Update last login
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { ultimoLogin: new Date() }
      })

      // Generate token
      const token = this.generateToken(usuario.id, usuario.tenantId)

      // Return user without password
      const { senhaHash, ...userWithoutPassword } = usuario
      
      return {
        user: userWithoutPassword,
        token
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error // Re-throw our structured errors
      }
      
      console.error('Authentication error:', error)
      
      // Check if it's a database connection issue
      if (error && typeof error === 'object' && 'code' in error) {
        const dbError = error as any
        if (dbError.code === 'P1001' || dbError.code === 'ECONNREFUSED') {
          throw AppError.databaseUnavailable(error)
        }
      }
      
      // Generic server error for unexpected issues
      throw new AppError({
        code: ErrorCode.SERVER_ERROR,
        message: 'Erro interno no serviço de autenticação',
        details: error,
        severity: 'error',
        status: 500
      })
    }
  }

  async createUser(userData: CreateUsuarioData): Promise<UsuarioWithoutPassword | null> {
    try {
      const hashedPassword = await this.hashPassword(userData.senha)

      const usuario = await prisma.usuario.create({
        data: {
          tenantId: userData.tenantId,
          email: userData.email.toLowerCase(),
          senhaHash: hashedPassword,
          nome: userData.nome,
          cargo: userData.cargo,
          permissoes: userData.permissoes || {}
        },
        include: {
          tenant: {
            select: {
              id: true,
              razaoSocial: true,
              nomeFantasia: true,
              cnpj: true,
              email: true,
              cidade: true,
              uf: true,
              timezone: true,
              moeda: true
            }
          }
        }
      })

      const { senhaHash, ...userWithoutPassword } = usuario
      return userWithoutPassword
    } catch (error) {
      console.error('Create user error:', error)
      return null
    }
  }

  async validateToken(token: string): Promise<UsuarioWithoutPassword | null> {
    try {
      const decoded = this.verifyToken(token)
      
      const usuario = await prisma.usuario.findFirst({
        where: {
          id: decoded.userId,
          tenantId: decoded.tenantId,
          ativo: true
        },
        include: {
          tenant: {
            select: {
              id: true,
              razaoSocial: true,
              nomeFantasia: true,
              cnpj: true,
              email: true,
              cidade: true,
              uf: true,
              timezone: true,
              moeda: true
            }
          }
        }
      })

      if (!usuario) {
        return null // Token valid but user not found/inactive - return null for silent handling
      }

      const { senhaHash, ...userWithoutPassword } = usuario
      return userWithoutPassword
    } catch (error) {
      if (error && typeof error === 'object' && 'name' in error && error.name === 'TokenExpiredError') {
        // JWT expired - this is expected behavior, return null
        return null
      }
      if (error && typeof error === 'object' && 'name' in error && error.name === 'JsonWebTokenError') {
        // JWT invalid - this is expected behavior, return null  
        return null
      }
      
      console.error('Token validation error:', error)
      
      // For unexpected database errors, we might want to throw
      if (error && typeof error === 'object' && 'code' in error) {
        const dbError = error as any
        if (dbError.code === 'P1001' || dbError.code === 'ECONNREFUSED') {
          throw AppError.databaseUnavailable(error)
        }
      }
      
      // For other unexpected errors, return null (token considered invalid)
      return null
    }
  }
}