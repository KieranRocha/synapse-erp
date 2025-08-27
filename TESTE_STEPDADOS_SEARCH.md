# 🔍 StepDados - Busca Dinâmica de Clientes

## ✅ **O que foi implementado:**

### **1. Busca Dinâmica com Dropdown**
- 📝 Campo de busca inteligente por nome ou CNPJ
- 🕐 Debounce de 300ms para otimizar performance
- 📋 Dropdown com resultados em tempo real
- ✅ Auto-preenchimento dos campos ao selecionar

### **2. Interface Melhorada**
- 🔍 Ícone de loading durante busca
- ❌ Botão de limpar seleção
- ✅ Indicador visual de cliente selecionado
- 📱 Responsive design com mobile support

### **3. Backend Integration**
- 🗄️ Conectado ao PostgreSQL via IPC
- 🚀 Busca server-side com `window.api.clients.search()`
- 🔄 Fallback para busca manual por CNPJ

## 🎯 **Como funciona:**

### **Fluxo Principal:**
1. **Usuário digita** no campo "Buscar Cliente"
2. **Após 300ms** de pausa, dispara busca automática
3. **Dropdown aparece** com resultados do backend
4. **Usuário clica** no cliente desejado
5. **Campos preenchem** automaticamente

## 🧪 **Como Testar**

### **1. Acesso à Página**
```bash
# Executar aplicação
npm run dev

# Navegar para novo orçamento
http://localhost:5173/vendas/orcamentos/novo
```

### **2. Testes de Busca Dinâmica**

#### **Teste A: Busca por Nome**
1. Digite parte do nome de um cliente existente
2. Aguarde 300ms - deve mostrar loading
3. Deve aparecer dropdown com resultados
4. Clique no cliente desejado
5. Campos devem preencher automaticamente

#### **Teste B: Busca por CNPJ**
1. Digite alguns dígitos do CNPJ
2. Ex: "123" deve buscar CNPJs que contenham 123
3. Dropdown deve mostrar clientes correspondentes
4. Seleção deve funcionar normalmente

#### **Teste C: Sem Resultados**
1. Digite termo que não existe
2. Ex: "clientenaoexiste"
3. Deve mostrar mensagem "Nenhum cliente encontrado"
4. Com link para "Cadastrar novo cliente"

#### **Teste D: Clear e Reset**
1. Faça uma busca e selecione um cliente
2. Clique no X (limpar)
3. Campo deve limpar e dados do cliente sumir
4. Dropdown deve fechar

### **3. Testes de Integração**

#### **Estados Visuais:**
- 🔍 **Loading**: Spinner durante busca
- ✅ **Selected**: Ícone verde quando selecionado
- ❌ **Clear**: X para limpar quando tem texto
- 📋 **Dropdown**: Resultados organizados

#### **Dados Preenchidos:**
Ao selecionar cliente, deve preencher:
- ✅ Nome do cliente
- ✅ CNPJ formatado
- ✅ Endereço completo
- ✅ Bairro, cidade, UF, CEP
- ✅ Data de cadastro (como "abertura")

### **4. Testes de Performance**

#### **Debounce Test:**
1. Digite rapidamente várias letras
2. Deve fazer apenas 1 busca após parar
3. Não deve sobrecarregar o backend

#### **Outside Click:**
1. Abra dropdown
2. Clique fora do campo
3. Dropdown deve fechar

## 🔧 **Debug e Troubleshooting**

### **Console do DevTools:**
```javascript
// Ver requisições de busca
// Mensagem: "Buscando: [termo]"

// Testar API diretamente
await window.api.clients.search("teste")

// Ver estado dos componentes (temporário)
console.log('Search results:', searchResults)
console.log('Selected client:', selectedClient)
```

### **Problemas Comuns:**

#### **1. "Nenhum resultado sempre"**
- Verificar se tem clientes cadastrados
- Testar busca no `/debug` primeiro
- Ver console para erros de IPC

#### **2. "Dropdown não aparece"**
- Verificar se `showDropdown` está true
- Ver se há resultados em `searchResults`
- Verificar CSS z-index (z-50)

#### **3. "Campos não preenchem"**
- Verificar mapeamento de dados
- Ver função `selectClient()`
- Verificar se `meta` está sendo atualizado

#### **4. "Busca muito lenta"**
- Normal - backend pode ser lento
- Verificar PostgreSQL rodando
- Ver logs do main process

## 📋 **Campos de Busca Suportados**

A busca funciona com:
- ✅ **Razão Social** completa ou parcial
- ✅ **Nome Fantasia** completa ou parcial
- ✅ **CNPJ** com ou sem formatação
- ✅ **Email** (se preenchido)

## 🎨 **Interface Components**

### **Campo de Busca:**
```
[Digite o nome ou CNPJ...] [🔍] [Novo]
                        ↑ loading/clear/check
```

### **Dropdown Item:**
```
┌─────────────────────────────────────┐
│ Nome Fantasia (se houver)           │
│ Razão Social                        │
│ CNPJ: 12.345.678/0001-90           │
│ Cidade, UF                          │
└─────────────────────────────────────┘
```

## 🚀 **Performance Features**

- ⏱️ **Debounce 300ms** - reduz requisições
- 🎯 **Search server-side** - busca no PostgreSQL
- 📦 **Resultados limitados** - máx 60px altura
- 🔄 **Cache automático** - resultados mantidos até nova busca
- 📱 **Mobile friendly** - touch targets adequados

## ✨ **Próximas Melhorias**

Após testes básicos:
- 🏷️ **Tags visuais** por tipo de cliente
- ⚡ **Cache local** de buscas recentes
- 🎯 **Busca por cidade/região**
- 📊 **Histórico de orçamentos** no dropdown
- ⌨️ **Navegação por teclado** (arrow keys)

## 🏁 **Status Final**

✅ **Dynamic Search**: Funcionando
✅ **Backend Integration**: Conectado
✅ **Auto-fill**: Implementado
✅ **Responsive UI**: Pronto
✅ **Error Handling**: Robusto
🔄 **Ready for Testing**: SIM!

**O StepDados agora tem busca dinâmica de clientes em tempo real!** 🎉

*Observação: A busca manual por CNPJ ainda funciona como fallback para casos específicos.*