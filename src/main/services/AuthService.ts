import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../database'
import { UsuarioWithoutPassword, AuthResult, CreateUsuarioData } from '../models/Usuario'

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
    const options = { expiresIn: this.jwtExpiresIn };
    return jwt.sign(payload, this.jwtSecret, options);
  }

  verifyToken(token: string): { userId: string; tenantId: string } {
    return jwt.verify(token, this.jwtSecret) as { userId: string; tenantId: string }
  }

  async authenticate(email: string, password: string): Promise<AuthResult | null> {
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
        return null
      }

      const isPasswordValid = await this.comparePassword(password, usuario.senhaHash)
      if (!isPasswordValid) {
        return null
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
      console.error('Authentication error:', error)
      return null
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
        return null
      }

      const { senhaHash, ...userWithoutPassword } = usuario
      return userWithoutPassword
    } catch (error) {
      console.error('Token validation error:', error)
      return null
    }
  }
}