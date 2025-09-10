import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { prisma } from '../database'
import { UsuarioWithoutPassword, AuthResult, CreateUsuarioData } from '../models/Usuario'
import { AppError } from '../utils/AppError'
import { ErrorCode } from '../utils/ErrorCodes'
import { EmailService } from './EmailService'

export class AuthService {
  private readonly jwtSecret: string
  private readonly jwtExpiresIn: string
  private readonly emailService: EmailService

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret'
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d'
    this.emailService = new EmailService()
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

  async requestPasswordReset(email: string): Promise<{ token: string; user: UsuarioWithoutPassword }> {
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

      // Generate secure random token
      const token = crypto.randomBytes(32).toString('hex')
      
      // Set expiration to 1 hour from now
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
      
      console.log('🔑 Generated reset token:', token)
      console.log('⏰ Token expires at:', expiresAt.toISOString())

      // Clean up any existing unused tokens for this user
      await prisma.passwordReset.deleteMany({
        where: {
          userId: usuario.id,
          used: false
        }
      })

      // Create new password reset record
      await prisma.passwordReset.create({
        data: {
          userId: usuario.id,
          token,
          expiresAt
        }
      })
      
      console.log('💾 Reset token saved to database for user:', usuario.email)

      const { senhaHash, ...userWithoutPassword } = usuario
      
      // Send password reset email
      try {
        await this.emailService.sendPasswordResetEmail(
          usuario.email,
          usuario.nome,
          token
        )
        console.log(`Password reset email sent to: ${usuario.email}`)
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError)
        // Don't throw error here - we still want to return success
        // The user will see success message and token is valid
      }
      
      return {
        token,
        user: userWithoutPassword
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      
      console.error('Password reset request error:', error)
      throw new AppError({
        code: ErrorCode.SERVER_ERROR,
        message: 'Erro interno no serviço de recuperação de senha',
        details: error,
        severity: 'error',
        status: 500
      })
    }
  }

  async validatePasswordResetToken(token: string): Promise<UsuarioWithoutPassword | null> {
    try {
      console.log('Validating password reset token:', token)
      console.log('Current time:', new Date().toISOString())
      
      // First, let's check if the token exists at all
      const allTokens = await prisma.passwordReset.findMany({
        where: { token },
        select: {
          token: true,
          used: true,
          expiresAt: true,
          createdAt: true,
          userId: true
        }
      })
      
      console.log('Found tokens with this value:', allTokens)
      
      const resetRecord = await prisma.passwordReset.findFirst({
        where: {
          token,
          used: false,
          expiresAt: {
            gt: new Date()
          }
        },
        include: {
          user: {
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
          }
        }
      })

      if (!resetRecord) {
        console.log('No valid reset record found for token')
        return null
      }
      
      console.log('Valid reset record found for user:', resetRecord.user.email)

      const { senhaHash, ...userWithoutPassword } = resetRecord.user
      return userWithoutPassword
    } catch (error) {
      console.error('Password reset token validation error:', error)
      return null
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const resetRecord = await prisma.passwordReset.findFirst({
        where: {
          token,
          used: false,
          expiresAt: {
            gt: new Date()
          }
        }
      })

      if (!resetRecord) {
        throw new AppError({
          code: ErrorCode.AUTH_TOKEN_INVALID,
          message: 'Token de recuperação inválido ou expirado',
          severity: 'warning',
          status: 400
        })
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword)

      // Update password and mark token as used
      await prisma.$transaction([
        prisma.usuario.update({
          where: { id: resetRecord.userId },
          data: { senhaHash: hashedPassword }
        }),
        prisma.passwordReset.update({
          where: { id: resetRecord.id },
          data: { used: true }
        })
      ])

      return true
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      
      console.error('Password reset error:', error)
      throw new AppError({
        code: ErrorCode.SERVER_ERROR,
        message: 'Erro interno ao redefinir senha',
        details: error,
        severity: 'error',
        status: 500
      })
    }
  }
}