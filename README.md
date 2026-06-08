# synapse-code

An Electron application with React and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

## Supabase / producao

Este projeto usa Prisma com PostgreSQL. Para rodar em Supabase, configure `DATABASE_URL`
no `.env` local ou nas variaveis do ambiente de deploy.

Veja o guia completo em [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).

### Comandos principais

```bash
$ npm run db:generate
$ npm run db:migrate
$ npm run db:migrate:deploy
$ npm run db:seed
```

Use `db:migrate` no desenvolvimento para criar migrations versionadas. Use
`db:migrate:deploy` em staging/producao para aplicar as migrations ja versionadas
sem gerar novas alteracoes de schema.

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
