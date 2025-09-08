# Sistema de Tratamento de Erros - ERP Máquinas

Este documento descreve o sistema completo de tratamento de erros implementado no sistema de autenticação e como utilizá-lo em toda a aplicação.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Tipos de Erro](#tipos-de-erro)
- [Códigos de Erro](#códigos-de-erro)
- [Como Usar](#como-usar)
- [Exemplos Práticos](#exemplos-práticos)
- [Validações Frontend](#validações-frontend)
- [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

O sistema utiliza uma arquitetura centralizada para tratamento de erros com:

- **Códigos padronizados** (`ErrorCode`)
- **Mensagens em português** com instruções claras
- **Diferentes níveis de severidade** (info, warning, error)
- **Integração com sistema de toast** para feedback visual
- **Retry automático** para erros recuperáveis
- **Validações robustas** no frontend

### Arquivos do Sistema

```
src/renderer/src/shared/errors/
├── types.ts          # Interfaces TypeScript
├── codes.ts          # Códigos de erro padronizados
├── messages.ts       # Mensagens em português
└── adapter.ts        # Adaptador e utilitários
```

## 📊 Tipos de Erro

### Severidade

| Tipo | Descrição | Comportamento |
|------|-----------|--------------|
| `info` | Informativo, não crítico | Toast azul, não impede fluxo |
| `warning` | Atenção necessária | Toast amarelo, usuário deve agir |
| `error` | Erro crítico | Toast vermelho, impede continuidade |

### Propriedades

```typescript
interface AppError {
  code: string        // Código padronizado
  message: string     // Mensagem para o usuário
  details?: unknown   // Detalhes técnicos
  traceId?: string    // ID para rastreamento
  severity: Severity  // Nível de severidade
  retryable?: boolean // Se permite retry automático
}
```

## 🔢 Códigos de Erro

### Validação de Campos
- `VALIDATION_EMAIL_INVALID` - E-mail em formato inválido
- `VALIDATION_PASSWORD_INVALID` - Senha não atende critérios
- `VALIDATION_REQUIRED` - Campo obrigatório não preenchido
- `VALIDATION_CPF_CNPJ_INVALID` - CPF/CNPJ inválido

### Autenticação e Sessão
- `AUTH_INVALID_CREDENTIALS` - E-mail ou senha incorretos
- `AUTH_ACCOUNT_BLOCKED` - Conta bloqueada permanentemente
- `AUTH_ACCOUNT_SUSPENDED` - Conta temporariamente suspensa
- `AUTH_ACCOUNT_LOCKED` - Conta bloqueada por segurança
- `AUTH_TOO_MANY_ATTEMPTS` - Muitas tentativas de login
- `AUTH_SESSION_EXPIRED` - Sessão expirou
- `AUTH_TOKEN_INVALID` - Token inválido
- `AUTH_TOKEN_EXPIRED` - Token expirou
- `AUTH_EMAIL_NOT_FOUND` - E-mail não encontrado
- `AUTH_API_UNAVAILABLE` - Serviço de autenticação indisponível

### Rede e Servidor
- `NETWORK_OFFLINE` - Sem conexão com internet
- `NETWORK_TIMEOUT` - Timeout na requisição
- `SERVER_UNAVAILABLE` - Servidor indisponível
- `SERVER_ERROR` - Erro interno do servidor
- `DB_UNAVAILABLE` - Banco de dados indisponível

## 🚀 Como Usar

### 1. Tratamento Básico de Erro

```typescript
import { fromUnknown, emitToastForError } from '../shared/errors/adapter';
import { useToast } from '../shared/hooks/useToast';

function MyComponent() {
  const toast = useToast();

  const handleAction = async () => {
    try {
      await someAsyncAction();
    } catch (error) {
      const appError = fromUnknown(error);
      emitToastForError(toast, appError);
    }
  };
}
```

### 2. Validação de Campos

```typescript
const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const trimmed = email.trim();
  if (!trimmed) return { isValid: false, error: "E-mail é obrigatório" };
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { isValid: false, error: "Formato de e-mail inválido" };
  }
  
  return { isValid: true };
};
```

### 3. Retry Automático

```typescript
const handleLogin = async () => {
  try {
    await login(email, password);
    toast.success("Login realizado com sucesso!");
  } catch (error) {
    const appError = fromUnknown(error);
    emitToastForError(toast, appError);
    
    // Retry automático para erros recuperáveis
    if (appError.retryable && retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setTimeout(handleLogin, 2000); // Retry após 2s
    }
  }
};
```

## 📝 Exemplos Práticos

### Cenário 1: Usuário Digite E-mail Inválido

1. **Validação Frontend**: Campo fica vermelho
2. **Mensagem**: "Formato de e-mail inválido"
3. **Ação**: Usuário corrige e continua

### Cenário 2: Senha Incorreta

1. **Erro Backend**: `AUTH_INVALID_CREDENTIALS`
2. **Toast Warning**: "E-mail ou senha incorretos — verifique suas credenciais"
3. **Ação**: Usuário pode tentar novamente

### Cenário 3: Muitas Tentativas

1. **Erro Backend**: `AUTH_TOO_MANY_ATTEMPTS`
2. **Toast Warning**: "Muitas tentativas de login — aguarde 15 minutos"
3. **Retry**: Bloqueado temporariamente

### Cenário 4: Conexão Instável

1. **Erro**: `NETWORK_TIMEOUT`
2. **Toast Error**: "Tempo de resposta esgotado — tente novamente"
3. **Retry**: Automático até 3 tentativas

### Cenário 5: Servidor Indisponível

1. **Erro**: `SERVER_UNAVAILABLE`
2. **Toast Error**: "Servidor indisponível — estamos trabalhando para normalizar"
3. **Retry**: Automático com backoff

## 🔍 Validações Frontend

### E-mail
- ✅ Campo obrigatório
- ✅ Formato válido (`user@domain.com`)
- ✅ Não permite espaços

### Senha
- ✅ Campo obrigatório
- ✅ Mínimo 6 caracteres
- ✅ Indicador de força (fraca/média/forte)

### Validação em Tempo Real
- ⚡ `onChange` para feedback imediato
- ⚡ Visual feedback nos campos (borda vermelha)
- ⚡ Mensagens específicas por tipo de erro

## 🛠 Troubleshooting

### Toast Não Aparece

**Problema**: Toast não é exibido após erro
**Solução**: Verificar se o `useToast()` está sendo usado corretamente

```typescript
// ❌ Errado
const toast = useToast;

// ✅ Correto
const toast = useToast();
```

### Erro Não é Interceptado

**Problema**: Erro não é tratado pelo sistema
**Solução**: Usar sempre `fromUnknown()` para normalizar

```typescript
// ❌ Errado
catch (error) {
  console.error(error);
}

// ✅ Correto
catch (error) {
  const appError = fromUnknown(error);
  emitToastForError(toast, appError);
}
```

### Retry Infinito

**Problema**: Sistema faz retry infinitamente
**Solução**: Implementar contador de tentativas

```typescript
const [retryCount, setRetryCount] = useState(0);

if (appError.retryable && retryCount < 3) {
  setRetryCount(prev => prev + 1);
  // ... retry logic
}
```

### Mensagem Não Localizada

**Problema**: Erro aparece em inglês
**Solução**: Adicionar código no `messages.ts`

```typescript
// Adicionar em messages.ts
[ErrorCode.NEW_ERROR_CODE]: { 
  message: 'Mensagem em português', 
  severity: 'warning' 
},
```

## 📋 Lista Completa de Erros de Autenticação

### Erros de Validação
1. **E-mail vazio**: "E-mail é obrigatório"
2. **E-mail inválido**: "Formato de e-mail inválido"
3. **Senha vazia**: "Senha é obrigatória" 
4. **Senha curta**: "Senha deve ter no mínimo 6 caracteres"

### Erros de Login
5. **Credenciais incorretas**: "E-mail ou senha incorretos"
6. **E-mail não encontrado**: "E-mail não encontrado"
7. **Conta não verificada**: "Conta não verificada"
8. **Conta bloqueada**: "Conta bloqueada permanentemente"
9. **Conta suspensa**: "Conta temporariamente suspensa"
10. **Conta travada**: "Conta temporariamente bloqueada por segurança"
11. **Muitas tentativas**: "Muitas tentativas de login"
12. **Senha expirada**: "Senha expirada"

### Erros de Sessão
13. **Sessão expirada**: "Sua sessão expirou"
14. **Token inválido**: "Token de acesso inválido"
15. **Token expirado**: "Token de acesso expirado"
16. **Login obrigatório**: "Login necessário"

### Erros de Sistema
17. **API indisponível**: "Serviço de autenticação indisponível"
18. **Sem internet**: "Sem conexão"
19. **Timeout**: "Tempo de resposta esgotado"
20. **Servidor indisponível**: "Servidor indisponível"
21. **Erro interno**: "Erro interno"
22. **Banco indisponível**: "Banco indisponível"

---

## 💡 Dicas de Implementação

1. **Sempre use `fromUnknown()`** para processar erros
2. **Toast é preferível** a mensagens inline para erros gerais
3. **Mantenha validações frontend sincronizadas** com backend
4. **Implemente retry apenas para erros marcados como `retryable`**
5. **Use diferentes severidades** conforme impacto no usuário
6. **Mensagens devem ser acionáveis** - dizer ao usuário o que fazer

---

*Documentação criada em: ${new Date().toLocaleDateString('pt-BR')}*
*Sistema implementado por: Claude Code Assistant*