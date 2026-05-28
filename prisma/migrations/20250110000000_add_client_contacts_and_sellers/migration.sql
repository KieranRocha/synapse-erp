-- CreateTable: Sellers (Vendedores)
CREATE TABLE "sellers" (
    "id" SERIAL NOT NULL,
    "tenant_id" UUID NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) DEFAULT '',
    "telefone" VARCHAR(255) DEFAULT '',
    "celular" VARCHAR(255) DEFAULT '',
    "comissao" DECIMAL(5,2) DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "observacoes" TEXT DEFAULT '',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sellers_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Client Contacts (Contatos de Clientes)
CREATE TABLE "client_contacts" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "tenant_id" UUID NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "cargo" VARCHAR(255) DEFAULT '',
    "email" VARCHAR(255) NOT NULL,
    "telefone" VARCHAR(255) NOT NULL,
    "celular" VARCHAR(255) DEFAULT '',
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "observacoes" TEXT DEFAULT '',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_contacts_pkey" PRIMARY KEY ("id")
);

-- AlterTable: Add vendedor_padrao_id to clients and remove vendedor_padrao string
ALTER TABLE "clients" ADD COLUMN "vendedor_padrao_id" INTEGER;
ALTER TABLE "clients" DROP COLUMN IF EXISTS "vendedor_padrao";

-- CreateIndex
CREATE INDEX "sellers_tenant_id_index" ON "sellers"("tenant_id");
CREATE INDEX "sellers_tenant_nome_index" ON "sellers"("tenant_id", "nome");

-- CreateIndex
CREATE INDEX "client_contacts_client_id_index" ON "client_contacts"("client_id");
CREATE INDEX "client_contacts_tenant_id_index" ON "client_contacts"("tenant_id");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_vendedor_padrao_id_fkey" FOREIGN KEY ("vendedor_padrao_id") REFERENCES "sellers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_contacts" ADD CONSTRAINT "client_contacts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_contacts" ADD CONSTRAINT "client_contacts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sellers" ADD CONSTRAINT "sellers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
