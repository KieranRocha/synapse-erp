-- CreateEnum
CREATE TYPE "public"."BudgetStatus" AS ENUM ('DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."RegimeEnum" AS ENUM ('SN', 'LP', 'LR');

-- CreateEnum
CREATE TYPE "public"."TipoOperacaoEnum" AS ENUM ('MERCADORIA', 'SERVICO');

-- CreateEnum
CREATE TYPE "public"."PricingMethodEnum" AS ENUM ('MARKUP', 'MARGIN');

-- CreateTable
CREATE TABLE "public"."tenants" (
    "id" UUID NOT NULL,
    "razao_social" VARCHAR(255) NOT NULL,
    "nome_fantasia" VARCHAR(255),
    "cnpj" VARCHAR(18),
    "ie" VARCHAR(20),
    "im" VARCHAR(20),
    "email" VARCHAR(255),
    "telefone" VARCHAR(20),
    "endereco" VARCHAR(255),
    "numero" VARCHAR(20),
    "complemento" VARCHAR(100),
    "bairro" VARCHAR(100),
    "cidade" VARCHAR(100),
    "municipio_ibge" VARCHAR(7),
    "uf" CHAR(2),
    "cep" VARCHAR(9),
    "timezone" VARCHAR(64) NOT NULL DEFAULT 'America/Sao_Paulo',
    "moeda" CHAR(3) NOT NULL DEFAULT 'BRL',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."usuarios" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "cargo" VARCHAR(100),
    "permissoes" JSONB NOT NULL DEFAULT '{}',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_login" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clients" (
    "id" SERIAL NOT NULL,
    "tipo_pessoa" TEXT DEFAULT 'PJ',
    "razao_social" VARCHAR(255) NOT NULL,
    "nome_fantasia" VARCHAR(255) DEFAULT '',
    "cpf_cnpj" VARCHAR(14) NOT NULL,
    "indicador_ie" TEXT DEFAULT 'Contribuinte',
    "ie" VARCHAR(255) DEFAULT '',
    "im" VARCHAR(255) DEFAULT '',
    "suframa" VARCHAR(255) DEFAULT '',
    "regime_trib" TEXT DEFAULT 'Simples Nacional',
    "cep" VARCHAR(8) DEFAULT '',
    "logradouro" VARCHAR(255) DEFAULT '',
    "numero" VARCHAR(255) DEFAULT '',
    "complemento" VARCHAR(255) DEFAULT '',
    "bairro" VARCHAR(255) DEFAULT '',
    "cidade" VARCHAR(255) DEFAULT '',
    "uf" VARCHAR(2) DEFAULT '',
    "pais" VARCHAR(255) DEFAULT 'Brasil',
    "email" VARCHAR(255) DEFAULT '',
    "telefone" VARCHAR(255) DEFAULT '',
    "responsavel" VARCHAR(255) DEFAULT '',
    "cargo" VARCHAR(255) DEFAULT '',
    "cond_pgto_padrao" VARCHAR(255) DEFAULT '',
    "limite_credito" DECIMAL(10,2) DEFAULT 0,
    "vendedor_padrao" VARCHAR(255) DEFAULT '',
    "transporte_padrao" TEXT DEFAULT 'CIF',
    "observacoes" TEXT DEFAULT '',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."knex_migrations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "batch" INTEGER,
    "migration_time" TIMESTAMPTZ(6),

    CONSTRAINT "knex_migrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."knex_migrations_lock" (
    "index" SERIAL NOT NULL,
    "is_locked" INTEGER,

    CONSTRAINT "knex_migrations_lock_pkey" PRIMARY KEY ("index")
);

-- CreateTable
CREATE TABLE "public"."budgets" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER,
    "numero" VARCHAR(32) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "responsavel" VARCHAR(255),
    "startDate" TIMESTAMPTZ(6),
    "deliveryDate" TIMESTAMPTZ(6),
    "status" "public"."BudgetStatus" NOT NULL DEFAULT 'DRAFT',
    "precoSugerido" DECIMAL(14,2),
    "precoAprovado" DECIMAL(14,2),
    "pricingMethod" "public"."PricingMethodEnum",
    "markupPct" DECIMAL(7,4),
    "marginPct" DECIMAL(7,4),
    "considerICMSasCost" BOOLEAN NOT NULL DEFAULT false,
    "considerPISCOFINSasCost" BOOLEAN NOT NULL DEFAULT false,
    "considerIPIasCost" BOOLEAN NOT NULL DEFAULT false,
    "considerISSasCost" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."budget_items" (
    "id" SERIAL NOT NULL,
    "budgetId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "unit" VARCHAR(32) NOT NULL,
    "quantity" DECIMAL(14,4) NOT NULL,
    "unitPrice" DECIMAL(14,4) NOT NULL,
    "category" VARCHAR(64) NOT NULL,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "budget_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."budget_financials" (
    "id" SERIAL NOT NULL,
    "budgetId" INTEGER NOT NULL,
    "regime" "public"."RegimeEnum" NOT NULL,
    "tipoOperacao" "public"."TipoOperacaoEnum" NOT NULL,
    "cfop" VARCHAR(32),
    "naturezaOperacao" VARCHAR(255),
    "ncm" VARCHAR(32),
    "cest" VARCHAR(16),
    "nbs" VARCHAR(32),
    "precoVenda" DECIMAL(14,2),
    "descontoPct" DECIMAL(7,4) NOT NULL DEFAULT 0,
    "descontoValor" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "frete" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "seguro" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "outrosCustos" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "compoeBaseICMS" BOOLEAN NOT NULL DEFAULT false,
    "compoeBasePisCofins" BOOLEAN NOT NULL DEFAULT false,
    "compoeBaseIPI" BOOLEAN NOT NULL DEFAULT false,
    "cst" VARCHAR(8),
    "csosn" VARCHAR(8),
    "origemMercadoria" VARCHAR(8),
    "icmsAliq" DECIMAL(7,4),
    "icmsRedBasePct" DECIMAL(7,4),
    "icmsStMva" DECIMAL(7,4),
    "icmsStAliq" DECIMAL(7,4),
    "fcpAliq" DECIMAL(7,4),
    "fcpStAliq" DECIMAL(7,4),
    "difalAliqInter" DECIMAL(7,4),
    "difalAliqInterna" DECIMAL(7,4),
    "difalPartilhaDestinoPct" DECIMAL(7,4),
    "ipiCst" VARCHAR(8),
    "ipiAliq" DECIMAL(7,4),
    "pisCst" VARCHAR(8),
    "pisAliq" DECIMAL(7,4),
    "cofinsCst" VARCHAR(8),
    "cofinsAliq" DECIMAL(7,4),
    "municipioIncidencia" VARCHAR(255),
    "issAliq" DECIMAL(7,4),
    "issRetido" BOOLEAN DEFAULT false,
    "irrfAliq" DECIMAL(7,4),
    "inssAliq" DECIMAL(7,4),
    "csllAliq" DECIMAL(7,4),
    "pisRetAliq" DECIMAL(7,4),
    "cofinsRetAliq" DECIMAL(7,4),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "budget_financials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_cnpj_key" ON "public"."tenants"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_tenant_id_email_key" ON "public"."usuarios"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_tenant_id_id_key" ON "public"."usuarios"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "clients_cpf_cnpj_index" ON "public"."clients"("cpf_cnpj");

-- CreateIndex
CREATE INDEX "clients_email_index" ON "public"."clients"("email");

-- CreateIndex
CREATE INDEX "clients_razao_social_index" ON "public"."clients"("razao_social");

-- CreateIndex
CREATE INDEX "budgets_client_status_created_idx" ON "public"."budgets"("clientId", "status", "created_at");

-- CreateIndex
CREATE INDEX "budget_items_budget_id_idx" ON "public"."budget_items"("budgetId");

-- CreateIndex
CREATE UNIQUE INDEX "budget_financials_budgetId_key" ON "public"."budget_financials"("budgetId");

-- AddForeignKey
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budgets" ADD CONSTRAINT "budgets_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budget_items" ADD CONSTRAINT "budget_items_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "public"."budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budget_financials" ADD CONSTRAINT "budget_financials_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "public"."budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
