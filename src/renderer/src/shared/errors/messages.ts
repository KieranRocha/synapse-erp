import { ErrorCode } from './codes'
import type { Severity } from './types'

export interface ErrorMessageDef {
  message: string
  severity: Severity
  retryable?: boolean
}

export const ErrorMessagesPTBR: Record<string, ErrorMessageDef> = {
  // Validation
  [ErrorCode.VALIDATION_EMAIL_INVALID]: { message: 'E-mail inválido — verifique o formato (ex.: nome@domínio.com).', severity: 'warning' },
  [ErrorCode.VALIDATION_PASSWORD_INVALID]: { message: 'Senha inválida — mínimo de 6 caracteres.', severity: 'warning' },
  [ErrorCode.VALIDATION_REQUIRED]: { message: 'Campo obrigatório — preencha os campos marcados com “*”.', severity: 'warning' },
  [ErrorCode.VALIDATION_CPF_CNPJ_INVALID]: { message: 'CPF/CNPJ inválido — revise o número informado.', severity: 'warning' },
  [ErrorCode.VALIDATION_SIZE_EXCEEDED]: { message: 'Tamanho excedido — reduza o texto/arquivo ao limite permitido.', severity: 'warning' },
  [ErrorCode.VALIDATION_INCONSISTENT]: { message: 'Dados inconsistentes — revise as informações e tente novamente.', severity: 'warning' },

  // Auth / Session
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: { message: 'E-mail ou senha incorretos — verifique suas credenciais e tente novamente.', severity: 'warning' },
  [ErrorCode.AUTH_ACCOUNT_UNVERIFIED]: { message: 'Conta não verificada — verifique seu e-mail para ativar a conta.', severity: 'warning' },
  [ErrorCode.AUTH_ACCOUNT_BLOCKED]: { message: 'Conta bloqueada permanentemente — contate o suporte para mais informações.', severity: 'error' },
  [ErrorCode.AUTH_ACCOUNT_SUSPENDED]: { message: 'Conta temporariamente suspensa — contate o suporte para desbloqueio.', severity: 'warning' },
  [ErrorCode.AUTH_TOO_MANY_ATTEMPTS]: { message: 'Muitas tentativas de login — aguarde 15 minutos antes de tentar novamente.', severity: 'warning', retryable: true },
  [ErrorCode.AUTH_SESSION_EXPIRED]: { message: 'Sua sessão expirou — faça login novamente para continuar.', severity: 'info' },
  [ErrorCode.AUTH_TOKEN_INVALID]: { message: 'Token de acesso inválido — faça login novamente.', severity: 'info' },
  [ErrorCode.AUTH_TOKEN_EXPIRED]: { message: 'Token de acesso expirado — sua sessão foi renovada automaticamente.', severity: 'info' },
  [ErrorCode.AUTH_2FA_INVALID]: { message: 'Código 2FA inválido ou expirado — gere um novo código e tente novamente.', severity: 'warning' },
  [ErrorCode.AUTH_2FA_REQUIRED]: { message: 'Autenticação em duas etapas obrigatória — insira o código do seu app autenticador.', severity: 'info' },
  [ErrorCode.AUTH_DEVICE_UNTRUSTED]: { message: 'Dispositivo não reconhecido — confirme sua identidade via e-mail.', severity: 'info' },
  [ErrorCode.AUTH_EMAIL_NOT_FOUND]: { message: 'E-mail não encontrado — verifique se o endereço está correto.', severity: 'warning' },
  [ErrorCode.AUTH_ACCOUNT_LOCKED]: { message: 'Conta temporariamente bloqueada por segurança — aguarde 30 minutos ou contate o suporte.', severity: 'warning', retryable: true },
  [ErrorCode.AUTH_PASSWORD_EXPIRED]: { message: 'Senha expirada — atualize sua senha para continuar.', severity: 'warning' },
  [ErrorCode.AUTH_LOGIN_REQUIRED]: { message: 'Login necessário — faça login para acessar esta funcionalidade.', severity: 'info' },
  [ErrorCode.AUTH_API_UNAVAILABLE]: { message: 'Serviço de autenticação indisponível — tente novamente em alguns minutos.', severity: 'error', retryable: true },

  // Authorization
  [ErrorCode.PERMISSION_DENIED]: { message: 'Acesso negado — você não tem permissão para esta ação.', severity: 'warning' },

  // Resource
  [ErrorCode.NOT_FOUND]: { message: 'Item não encontrado — o recurso pode ter sido removido.', severity: 'info' },
  [ErrorCode.CONFLICT]: { message: 'Conflito de atualização — recarregue e tente novamente.', severity: 'warning', retryable: true },

  // Recovery / Signup
  [ErrorCode.RECOVERY_EMAIL_NOT_FOUND]: { message: 'E-mail não encontrado — confirme o endereço.', severity: 'warning' },
  [ErrorCode.RECOVERY_LINK_INVALID]: { message: 'Link inválido ou expirado — solicite um novo link.', severity: 'warning' },
  [ErrorCode.RECOVERY_SAME_PASSWORD]: { message: 'Nova senha igual à anterior — escolha uma diferente.', severity: 'warning' },
  [ErrorCode.SIGNUP_EMAIL_EXISTS]: { message: 'E-mail já cadastrado — tente acessar ou recuperar a senha.', severity: 'warning' },
  [ErrorCode.SIGNUP_WEAK_PASSWORD]: { message: 'Senha fraca — use letras, números e caracteres especiais.', severity: 'warning' },
  [ErrorCode.SIGNUP_TERMS_NOT_ACCEPTED]: { message: 'Termos não aceitos — aceite para continuar.', severity: 'warning' },
  [ErrorCode.SIGNUP_COMPANY_EXISTS]: { message: 'Empresa já cadastrada — verifique duplicidade/razão social.', severity: 'warning' },

  // Network / Server / DB
  [ErrorCode.NETWORK_OFFLINE]: { message: 'Sem conexão — verifique sua internet e tente novamente.', severity: 'error', retryable: true },
  [ErrorCode.NETWORK_TIMEOUT]: { message: 'Tempo de resposta esgotado — tente novamente.', severity: 'error', retryable: true },
  [ErrorCode.SERVER_UNAVAILABLE]: { message: 'Servidor indisponível — estamos trabalhando para normalizar.', severity: 'error', retryable: true },
  [ErrorCode.SERVER_ERROR]: { message: 'Erro interno — tente novamente; se persistir, contate o suporte.', severity: 'error', retryable: true },
  [ErrorCode.DB_UNAVAILABLE]: { message: 'Banco indisponível — tente novamente em alguns minutos.', severity: 'error', retryable: true },
  [ErrorCode.RATE_LIMITED]: { message: 'Limite de uso atingido — aguarde e tente novamente.', severity: 'warning', retryable: true },
  [ErrorCode.UNPROCESSABLE]: { message: 'Dados inválidos — verifique os campos informados.', severity: 'warning' },

  // Files
  [ErrorCode.FILE_UNSUPPORTED]: { message: 'Formato não suportado — envie um tipo permitido.', severity: 'warning' },
  [ErrorCode.FILE_TOO_LARGE]: { message: 'Arquivo muito grande — compacte ou reduza o arquivo.', severity: 'warning' },
  [ErrorCode.FILE_UPLOAD_FAILED]: { message: 'Falha no upload — verifique a rede e tente novamente.', severity: 'error', retryable: true },
  [ErrorCode.FILE_UPLOAD_CANCELED]: { message: 'Upload cancelado — tente enviar novamente.', severity: 'info' },

  // Integrations
  [ErrorCode.INTEGRATION_UNAVAILABLE]: { message: 'Serviço externo indisponível — tente novamente mais tarde.', severity: 'error', retryable: true },
  [ErrorCode.INTEGRATION_API_KEY_INVALID]: { message: 'Chave de API inválida — contate o administrador.', severity: 'warning' },
  [ErrorCode.INTEGRATION_QUOTA_EXCEEDED]: { message: 'Cota da API atingida — aguarde renovação da cota.', severity: 'warning' },

  // Application
  [ErrorCode.PREFS_SAVE_FAILED]: { message: 'Falha ao salvar preferências — verifique permissões do app.', severity: 'error' },
  [ErrorCode.VERSION_OUTDATED]: { message: 'Versão desatualizada — atualize para a versão mais recente.', severity: 'info' },
  [ErrorCode.UNKNOWN]: { message: 'Erro desconhecido — tente novamente ou contate o suporte.', severity: 'error' },
}

export function getMessage(code: string): ErrorMessageDef {
  return ErrorMessagesPTBR[code] ?? ErrorMessagesPTBR[ErrorCode.UNKNOWN]
}

