import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { AuthService } from '../services/AuthService'

const app = express()
const PORT = 3001

// Security middleware
app.use(helmet())

// CORS middleware - allow both Electron and browser
app.use(cors({
  origin: [
    'http://localhost:5173', // Vite dev server
    'file://', // Electron
    'app://' // Electron protocol
  ],
  credentials: true
}))

// Parse JSON
app.use(express.json())

// Initialize auth service
const authService = new AuthService()

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'E-mail e senha são obrigatórios'
      })
    }

    const result = await authService.authenticate(email, password)
    
    if (!result) {
      return res.status(401).json({
        error: 'Credenciais inválidas'
      })
    }

    res.json(result)
  } catch (error) {
    console.error('Auth login error:', error)
    res.status(500).json({
      error: 'Erro interno do servidor'
    })
  }
})

app.post('/api/auth/validate', async (req, res) => {
  try {
    const { token } = req.body
    
    if (!token) {
      return res.status(400).json({
        error: 'Token é obrigatório'
      })
    }

    const user = await authService.validateToken(token)
    
    if (!user) {
      return res.status(401).json({
        error: 'Token inválido'
      })
    }

    res.json(user)
  } catch (error) {
    console.error('Token validation error:', error)
    res.status(401).json({
      error: 'Token inválido'
    })
  }
})

app.post('/api/auth/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body
    
    if (!email) {
      return res.status(400).json({
        error: 'E-mail é obrigatório'
      })
    }

    const result = await authService.requestPasswordReset(email)
    
    res.json({
      success: true,
      message: 'Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.',
      user: result.user
    })
  } catch (error) {
    console.error('Password reset request error:', error)
    // Don't reveal if email exists or not
    res.json({
      success: true,
      message: 'Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.'
    })
  }
})

app.post('/api/auth/validate-reset-token', async (req, res) => {
  try {
    const { token } = req.body
    
    if (!token) {
      return res.status(400).json({
        error: 'Token é obrigatório'
      })
    }

    const user = await authService.validatePasswordResetToken(token)
    
    if (!user) {
      return res.status(400).json({
        error: 'Token de recuperação inválido ou expirado'
      })
    }

    res.json({
      valid: true,
      user: {
        nome: user.nome,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Reset token validation error:', error)
    res.status(400).json({
      error: 'Token de recuperação inválido ou expirado'
    })
  }
})

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body
    
    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Token e nova senha são obrigatórios'
      })
    }

    const success = await authService.resetPassword(token, newPassword)
    
    if (!success) {
      return res.status(400).json({
        error: 'Token inválido ou expirado'
      })
    }

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso'
    })
  } catch (error) {
    console.error('Password reset error:', error)
    res.status(400).json({
      error: 'Erro ao redefinir senha'
    })
  }
})

// Start server
let server: any = null

export function startServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      server = app.listen(PORT, () => {
        console.log(`🚀 API Server running on http://localhost:${PORT}`)
        resolve()
      })
    } catch (error) {
      console.error('Failed to start API server:', error)
      reject(error)
    }
  })
}

export function stopServer(): Promise<void> {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => {
        console.log('🛑 API Server stopped')
        resolve()
      })
    } else {
      resolve()
    }
  })
}