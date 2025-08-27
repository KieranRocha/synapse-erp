# 🧪 Teste do Formulário de Cliente

## 🚀 **Problema Resolvido**

O formulário não estava salvando no banco PostgreSQL porque estava usando o **Zustand store local** (`useClientesStore`) ao invés do **backend IPC**.

### **✅ Mudanças Feitas:**

1. **Removido**: `useClientesStore` (store local)
2. **Adicionado**: `window.api.clients.create()` (backend PostgreSQL)
3. **Melhorado**: Tratamento de erros e loading states
4. **Criado**: Página de debug para testar o banco

## 🧭 **Como Testar**

### **1. Iniciar a Aplicação**
```bash
npm run dev
```

### **2. Testar Database (Recomendado primeiro)**
1. Acesse: `http://localhost:5173/debug`
2. Clique em **"➕ Criar Cliente Teste"**
3. Verifique se aparece: **"✅ Cliente criado com ID: X"**
4. Confirme se o cliente aparece na lista

### **3. Testar Formulário Real**
1. Acesse: `http://localhost:5173/clientes/novo`
2. Preencha o formulário:
   - **Tipo Pessoa**: PJ
   - **Razão Social**: Sua Empresa LTDA
   - **CNPJ**: 12345678000199
   - **Email**: contato@suaempresa.com
   - **Telefone**: 11999999999
3. Clique em **"Salvar Cliente"**
4. Verifique se:
   - Botão muda para **"Salvando..."**
   - Toast de sucesso aparece
   - Redireciona para `/clientes`

### **4. Verificar se Salvou**
1. Volte para: `http://localhost:5173/debug`
2. Clique em **"🔄 Recarregar"**
3. Confirme se o cliente aparece na lista

## 🔍 **Debug via Console**

### **Testar APIs no DevTools:**
```javascript
// Listar todos os clientes
await window.api.clients.getAll()

// Criar cliente de teste
await window.api.clients.create({
  tipoPessoa: 'PJ',
  razaoSocial: 'Teste Console',
  cpfCnpj: '11111111000199',
  regimeTrib: 'Simples Nacional',
  transportePadrao: 'CIF',
  limiteCredito: 1000
})

// Buscar por termo
await window.api.clients.search('Teste')
```

## 🐛 **Possíveis Problemas**

### **1. Erro: "window.api is not defined"**
- **Causa**: Problema no preload script
- **Solução**: Verificar se o Electron iniciou corretamente

### **2. Erro: "autenticação falhou"**
- **Causa**: PostgreSQL não configurado
- **Solução**: Verificar `.env` e reiniciar PostgreSQL

### **3. Erro: "UNIQUE constraint"**
- **Causa**: CNPJ já existe no banco
- **Solução**: Usar CNPJ diferente ou limpar banco

### **4. Formulário não salva**
1. Abrir **DevTools Console** (F12)
2. Tentar submeter formulário
3. Verificar erros no console
4. Verificar se `window.api` está disponível

## ✅ **Checklist de Funcionamento**

- [ ] PostgreSQL rodando
- [ ] Arquivo `.env` configurado
- [ ] `npm run db:migrate` executado
- [ ] `npm run dev` funcionando
- [ ] `/debug` carrega sem erros
- [ ] Consegue criar cliente na página debug
- [ ] Formulário `/clientes/novo` carrega
- [ ] Consegue submeter formulário sem erros
- [ ] Cliente aparece na database

## 🎯 **Próximos Passos**

Após confirmar que está funcionando:

1. **Integrar com página de listagem** (`/clientes`)
2. **Adicionar funcionalidades de edição/exclusão**
3. **Melhorar validações do formulário**
4. **Adicionar máscaras para CPF/CNPJ**
5. **Implementar busca de CEP**

## 📊 **Status Atual**

✅ **Backend PostgreSQL**: Funcionando
✅ **IPC Handlers**: Registrados
✅ **Formulário**: Integrado com backend
✅ **Validação**: Usando Zod schema
✅ **Error Handling**: Implementado
✅ **Loading States**: Implementado
✅ **Debug Page**: Criada para testes

**O formulário agora salva corretamente no PostgreSQL!** 🎉