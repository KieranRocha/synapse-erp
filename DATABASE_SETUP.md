# Backend PostgreSQL Setup

Este projeto foi migrado para usar PostgreSQL como banco de dados backend. 

## Pré-requisitos

1. **PostgreSQL instalado** - Instale o PostgreSQL em sua máquina
2. **Node.js** - Certifique-se de ter o Node.js instalado

## Configuração

### 1. Configurar Banco de Dados

Crie um banco de dados PostgreSQL:

```sql
CREATE DATABASE synapse_dev;
CREATE USER synapse_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE synapse_dev TO synapse_user;
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=synapse_dev
DB_USER=synapse_user
DB_PASSWORD=your_password
DB_SSL=false
NODE_ENV=development
```

### 3. Executar Migrações

```bash
# Instalar dependências
npm install

# Executar migrações do banco
npm run db:migrate

# Ou executar manualmente com knex
npx knex migrate:latest
```

## Scripts Disponíveis

- `npm run db:migrate` - Executa as migrações mais recentes
- `npm run db:rollback` - Desfaz a última migração
- `npm run db:reset` - Desfaz todas as migrações e executa novamente

## Estrutura do Backend

### Arquivos Principais

- `knexfile.js` - Configuração do Knex.js
- `src/main/database/` - Configuração e migrações do banco
- `src/main/models/Client.ts` - Model do Cliente
- `src/main/services/ClientService.ts` - Serviços de negócio
- `src/main/handlers/clientHandlers.ts` - Handlers IPC para comunicação com o frontend

### API Disponível

O backend expõe as seguintes operações via IPC:

- `clients:getAll` - Buscar todos os clientes
- `clients:getById` - Buscar cliente por ID
- `clients:create` - Criar novo cliente
- `clients:update` - Atualizar cliente
- `clients:delete` - Deletar cliente
- `clients:search` - Buscar clientes por termo

### Uso no Frontend

```typescript
// Buscar todos os clientes
const clients = await window.api.clients.getAll()

// Criar novo cliente
const newClient = await window.api.clients.create(clientData)

// Buscar cliente por ID
const client = await window.api.clients.getById(1)

// Atualizar cliente
const updated = await window.api.clients.update(1, partialData)

// Deletar cliente
await window.api.clients.delete(1)

// Buscar clientes
const results = await window.api.clients.search('termo')
```

## Executando a Aplicação

```bash
# Desenvolvimento
npm run dev

# Build
npm run build
```

A aplicação irá automaticamente:
1. Conectar ao banco PostgreSQL
2. Executar migrações pendentes
3. Registrar os handlers IPC para operações de cliente

## Troubleshooting

### Erro de Conexão com o Banco

1. Verifique se o PostgreSQL está rodando
2. Confirme as credenciais no arquivo `.env`
3. Teste a conexão manualmente

### Migrações Falhando

```bash
# Reset completo do banco
npm run db:reset
```

### Problemas de Permissão

Certifique-se de que o usuário do banco tem as permissões adequadas:

```sql
GRANT ALL PRIVILEGES ON DATABASE synapse_dev TO synapse_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO synapse_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO synapse_user;
```