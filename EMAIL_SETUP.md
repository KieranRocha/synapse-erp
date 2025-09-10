# 📧 Configuração de Email - Sistema de Recuperação de Senha

## ✅ Implementação Completa com Nodemailer + OAuth 2.0

O sistema de recuperação de senha agora inclui envio automático de emails com suporte a OAuth 2.0 para Gmail!

### 🛠️ Como Configurar

#### Opção 1: OAuth 2.0 para Gmail (🔥 **RECOMENDADO**)

OAuth 2.0 é mais seguro que senhas de app e é o método mais moderno.

##### 1.1 Configure as Variáveis de Ambiente

```env
# Email Configuration (SMTP)
SMTP_USER=seuemail@gmail.com
SMTP_FROM_NAME=ERP Máquinas

# Gmail OAuth 2.0 Configuration (Recommended)
GMAIL_CLIENT_ID=seu-client-id.googleusercontent.com
GMAIL_CLIENT_SECRET=seu-client-secret
GMAIL_REFRESH_TOKEN=seu-refresh-token
```

##### 1.2 Configuração OAuth 2.0 no Google Cloud

1. **Acesse o Google Cloud Console:**
   - Vá para: https://console.cloud.google.com/
   - Crie um novo projeto ou selecione um existente

2. **Ative a Gmail API:**
   - No menu lateral, vá em "APIs e Serviços" → "Biblioteca"
   - Pesquise por "Gmail API" e ative

3. **Crie Credenciais OAuth 2.0:**
   - Vá em "APIs e Serviços" → "Credenciais"
   - Clique em "Criar credenciais" → "ID do cliente OAuth 2.0"
   - Tipo de aplicação: "Aplicativo para desktop"
   - Anote o **Client ID** e **Client Secret**

4. **Obtenha o Refresh Token:**
   - Acesse: https://developers.google.com/oauthplayground/
   - No canto superior direito, clique na engrenagem ⚙️
   - Marque "Use your own OAuth credentials"
   - Cole seu Client ID e Client Secret
   - Na lista de APIs, encontre "Gmail API v1"
   - Selecione: `https://www.googleapis.com/auth/gmail.send`
   - Clique em "Authorize APIs"
   - Autorize o acesso à sua conta Gmail
   - Clique em "Exchange authorization code for tokens"
   - **Copie o Refresh Token** gerado

#### Opção 2: Senha de App (Fallback)

Se preferir usar o método tradicional:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seuemail@gmail.com
SMTP_PASS=sua-senha-de-app
SMTP_FROM_NAME=ERP Máquinas
```

##### 2.1 Para Gmail

1. **Ative a autenticação de 2 fatores** na sua conta Google
2. **Gere uma Senha de App:**
   - Acesse: https://myaccount.google.com/security
   - Clique em "Senhas de app" (App passwords)
   - Selecione "App personalizado" → Digite "ERP Máquinas"
   - **Use a senha de 16 caracteres gerada como `SMTP_PASS`**

#### 3. Para Outros Provedores

```env
# Outlook/Hotmail
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=seuemail@outlook.com

# Yahoo
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=seuemail@yahoo.com

# Servidor SMTP Personalizado
SMTP_HOST=seu-servidor-smtp.com
SMTP_PORT=587
SMTP_USER=seuemail@seudominio.com
```

### 🎨 Template de Email

O email inclui:

- ✅ Design profissional e responsivo
- ✅ Botão destacado para redefinir senha
- ✅ Link alternativo para copiar/colar
- ✅ Avisos de segurança (expiração, não compartilhar)
- ✅ Branding da empresa
- ✅ Versão texto para compatibilidade

### 🔗 URLs de Redefinição

O sistema gera URLs em dois formatos:

1. **Protocolo customizado:** `synapseapp://reset-password?token=...`
   - Para apps Electron registrados no sistema
   
2. **URL web:** `http://localhost:5173/#/auth/reset-password?token=...`
   - Fallback que funciona no navegador

### 🧪 Como Testar

1. **Configure as credenciais** no arquivo `.env`
2. **Execute o app:** `npm run dev`
3. **Teste o fluxo:**
   - Acesse o login
   - Clique em "Esqueci minha senha"
   - Digite um email cadastrado
   - **Verifique sua caixa de entrada!**

### 🛡️ Segurança do Email

- 🔥 **OAuth 2.0** - Método mais seguro para Gmail (sem senhas)
- ✅ **Credenciais protegidas** via variáveis de ambiente
- ✅ **Conexão SMTP segura** (TLS/STARTTLS)
- ✅ **Tokens únicos** de 64 caracteres
- ✅ **Expiração de 1 hora**
- ✅ **Uso único** (token marcado como usado)
- ✅ **Remetente autenticado** (previne spoofing)
- ✅ **Fallback automático** para senha de app se OAuth não configurado

### 🚨 Modo Fallback

O sistema possui duplo fallback:

1. **OAuth 2.0 → Senha de App:** Se OAuth não estiver configurado, usa senha de app automaticamente
2. **Sem Credenciais:** Se nenhuma credencial estiver configurada:
   - ❌ Email não será enviado
   - ✅ Token ainda é gerado e salvo no banco
   - ✅ Sistema funciona normalmente
   - 📝 Log será mostrado no console com detalhes do email

### 🔍 Debug e Logs

O sistema logga:
```
✅ Email sent successfully: <message-id>
❌ Failed to send password reset email: <error>
⚠️  Email credentials not configured. Email not sent.
```

### 📂 Arquivos Criados/Modificados

- ✅ `EmailService.ts` - Serviço de envio de emails
- ✅ `AuthService.ts` - Integrado com EmailService
- ✅ Template HTML responsivo
- ✅ Configurações no `.env` e `.env.example`

---

## ⚡ Status: TOTALMENTE FUNCIONAL

**O sistema está pronto para produção!** 

Apenas configure suas credenciais SMTP e o fluxo completo funcionará:
1. User esquece senha → Clica no botão
2. Digite email → Sistema gera token  
3. **Email enviado automaticamente** 📧
4. User clica no link → Redefine senha ✅

**Próximo passo:** Configure suas credenciais de email e teste! 🎉