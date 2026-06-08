# Supabase Setup

Este guia prepara o Synapse para usar PostgreSQL no Supabase com Prisma.

## Objetivo do MVP

- Usar Supabase Postgres como banco compartilhado.
- Manter Prisma como camada de schema, migrations e client.
- Usar uma unica `DATABASE_URL` por ambiente.
- Aplicar migrations versionadas em producao com `prisma migrate deploy`.

## Arquitetura recomendada

### MVP local/staging

```text
Electron app -> Main process -> Prisma Client -> Supabase Postgres
```

Essa topologia e suficiente para validar o produto e manter o minimo de partes
moveis. A string de conexao fica no ambiente que executa o processo principal.

### Producao

```text
Electron app -> API backend -> Prisma Client -> Supabase Postgres
```

Para distribuicao ampla, prefira mover o acesso direto ao banco para um backend.
Isso evita expor credenciais PostgreSQL no aplicativo distribuido e permite
controle centralizado de autenticacao, autorizacao, auditoria e rate limiting.

## Ambientes

Mantenha uma URL por ambiente:

- `development`: banco local ou projeto Supabase separado para desenvolvimento.
- `staging`: projeto Supabase separado para validacao antes de producao.
- `production`: projeto Supabase de producao.

Nunca reutilize a senha de producao em `.env`, exemplos, testes ou documentos.

## Connection string

No Supabase, abra **Project Settings > Database** e copie a connection string
PostgreSQL.

Exemplo local:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/synapse_dev?schema=public"
```

Exemplo Supabase com pooler:

```env
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
```

Para migrations, a conexao direta na porta `5432` costuma ser a opcao mais
previsivel. Para runtime com muitos clientes, prefira pooler quando aplicavel.

## Checklist inicial

1. Crie um projeto Supabase.
2. Copie a connection string e substitua `[password]`.
3. Defina `DATABASE_URL` no `.env` local.
4. Gere o Prisma Client:

```bash
npm run db:generate
```

5. Aplique migrations em desenvolvimento:

```bash
npm run db:migrate
```

6. Rode o seed, se precisar de dados iniciais:

```bash
npm run db:seed
```

## Fluxo de producao

1. Gere migrations localmente com `npm run db:migrate`.
2. Revise os arquivos em `prisma/migrations`.
3. Configure `DATABASE_URL` no ambiente de staging/producao.
4. Aplique migrations versionadas:

```bash
npm run db:migrate:deploy
```

5. Reinicie o processo da aplicacao.

Nao use `prisma db push` em producao. Ele pula o historico versionado de
migrations e aumenta o risco de drift entre ambientes.

## Seguranca

- Nao commite `.env`.
- Nao coloque senhas reais em `.env.example`.
- Rotacione senhas se uma connection string real tiver sido versionada.
- Para app distribuido, trate acesso direto a Postgres como temporario e mova a
  conexao para um backend.
- Use usuarios, permissoes e politicas adequadas por ambiente.

## Criterios de pronto

- `DATABASE_URL` configurada por ambiente.
- `npm run db:generate` executa com sucesso.
- `npm run db:migrate:deploy` aplica migrations em staging/producao.
- App falha com erro claro quando `DATABASE_URL` esta ausente ou invalida.
- Nenhum segredo real permanece versionado.
