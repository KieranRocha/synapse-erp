import nodemailer from 'nodemailer'
import { app } from 'electron'
import { google } from 'googleapis'
import { AppError } from '../utils/AppError'
import { ErrorCode } from '../utils/ErrorCodes'

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = this.createTransporter()
  }

  private createTransporter(): nodemailer.Transporter {
    // Check if OAuth 2.0 credentials are provided
    if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN) {
      return this.createOAuth2Transporter()
    }
    
    // Fallback to basic auth (App Password)
    console.warn('OAuth 2.0 credentials not found. Falling back to basic authentication.')
    console.warn('For better security, consider setting up OAuth 2.0 credentials.')
    
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  private createOAuth2Transporter(): nodemailer.Transporter {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground' // Redirect URL
    )

    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    })

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.SMTP_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: oauth2Client.getAccessToken(),
      },
    } as any)
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      if (!process.env.SMTP_USER) {
        console.warn('SMTP_USER not configured. Email not sent.')
        console.log('Email that would be sent:', options)
        return
      }

      // Check if we have either OAuth 2.0 credentials or basic auth credentials
      const hasOAuthCredentials = process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN
      const hasBasicCredentials = process.env.SMTP_PASS

      if (!hasOAuthCredentials && !hasBasicCredentials) {
        console.warn('Email credentials not configured. Please set up either OAuth 2.0 or basic authentication.')
        console.log('Email that would be sent:', options)
        return
      }

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'ERP Máquinas'}" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      }

      const info = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', info.messageId)
    } catch (error) {
      console.error('Error sending email:', error)
      throw new AppError({
        code: ErrorCode.SERVER_ERROR,
        message: 'Erro ao enviar email',
        details: error,
        severity: 'error',
        status: 500
      })
    }
  }

  async sendPasswordResetEmail(email: string, userName: string, resetToken: string): Promise<void> {
    // Build URLs for reset depending on environment
    const isPackaged = (() => {
      try {
        return app?.isPackaged ?? process.env.NODE_ENV === 'production'
      } catch {
        return process.env.NODE_ENV === 'production'
      }
    })()

    const webBase = process.env.RESET_WEB_BASE_URL || 'http://localhost:5173'
    const webUrl = `${webBase}/#/auth/reset-password?token=${resetToken}`
    const protocolScheme = process.env.APP_PROTOCOL_SCHEME || 'synapseapp'
    const customProtocolUrl = `${protocolScheme}://reset-password?token=${resetToken}`

    const primaryUrl = isPackaged ? customProtocolUrl : webUrl
    const fallbackUrl = webUrl

    console.log('📧 Sending password reset email with URL:', primaryUrl, 'fallback:', fallbackUrl)
    
    const html = this.createPasswordResetTemplate(userName, primaryUrl, fallbackUrl)
    const text = this.createPasswordResetTextVersion(userName, primaryUrl, fallbackUrl)

    await this.sendEmail({
      to: email,
      subject: '✅ Recuperação de senha - ERP Máquinas',
      html,
      text
    })
  }

  private createPasswordResetTemplate(userName: string, resetUrl: string, fallbackUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperação de Senha</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: #1a1a1a;
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #333;
        }
        .message {
            margin-bottom: 30px;
            color: #666;
            line-height: 1.7;
        }
        .button-container {
            text-align: center;
            margin: 40px 0;
        }
        .reset-button {
            display: inline-block;
            background: #1a1a1a;
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: background-color 0.2s ease;
        }
        .reset-button:hover {
            background: #2a2a2a;
            text-decoration: none;
            color: white;
        }
        .fallback-link {
            margin-top: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 6px;
            border-left: 4px solid #1a1a1a;
        }
        .fallback-link p {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #666;
        }
        .fallback-link a {
            color: #1a1a1a;
            text-decoration: none;
            word-break: break-all;
            font-size: 13px;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
        }
    </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Recuperação de Senha</h1>
            </div>
            
            <div class="content">
                <div class="greeting">Olá, ${userName}!</div>
                
                <div class="message">
                    <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>ERP Máquinas</strong>.</p>
                    <p>Para criar uma nova senha, clique no botão abaixo:</p>
                </div>
                
                <div class="button-container">
                    <a href="${resetUrl}" class="reset-button">
                        ✅ Redefinir Senha
                    </a>
                </div>
                
                <div class="fallback-link">
                    <p><strong>Ou copie este link no seu navegador:</strong></p>
                    <a href="${fallbackUrl}" style="word-break: break-all;">${fallbackUrl}</a>
                    <p style="margin-top: 8px; font-size: 12px; color: #888;">
                        ℹ️ <strong>Importante:</strong> Se o botão não abrir o app automaticamente, use o link acima no navegador.
                    </p>
                </div>
                
                <div class="warning">
                    <strong>Importante:</strong><br>
                    • Este link expira em <strong>1 hora</strong><br>
                    • Se você não solicitou esta alteração, ignore este email<br>
                    • Nunca compartilhe este link com outras pessoas
                </div>
            </div>
            
            <div class="footer">
                <p>Este email foi enviado automaticamente pelo sistema ERP Máquinas.</p>
                <p>© ${new Date().getFullYear()} ERP Máquinas - Todos os direitos reservados</p>
            </div>
        </div>
    </body>
    </html>
    `
  }

  private createPasswordResetTextVersion(userName: string, resetUrl: string, fallbackUrl: string): string {
    return `
Olá, ${userName}!

Recebemos uma solicitação para redefinir a senha da sua conta no ERP Máquinas.

Para criar uma nova senha, acesse o link principal (abre o app):
${resetUrl}

Se o link acima não funcionar, use este no navegador:
${fallbackUrl}

IMPORTANTE:
- Este link expira em 1 hora
- Se você não solicitou esta alteração, ignore este email
- Nunca compartilhe este link com outras pessoas

Se você tiver problemas para acessar o link, copie e cole o endereço completo no seu navegador.

---
Este email foi enviado automaticamente pelo sistema ERP Máquinas.
© ${new Date().getFullYear()} ERP Máquinas - Todos os direitos reservados
    `
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      console.log('SMTP connection verified successfully')
      return true
    } catch (error) {
      console.error('SMTP connection failed:', error)
      return false
    }
  }
}

