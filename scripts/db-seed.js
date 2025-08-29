// Simple Prisma seed for budgets and items
const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    await prisma.$connect()

    // Ensure one client exists
    const client = await prisma.client.upsert({
      where: { cpf_cnpj: '00000000000000' },
      update: {},
      create: {
        tipo_pessoa: 'PJ',
        razao_social: 'Cliente Exemplo Ltda',
        nome_fantasia: 'Cliente Exemplo',
        cpf_cnpj: '00000000000000',
        email: 'contato@exemplo.com',
        cidade: 'São Paulo',
        uf: 'SP'
      }
    })

    const existing = await prisma.budget.count()
    if (existing > 0) {
      console.log(`[seed] Budgets already present: ${existing}. Skipping.`)
      return
    }

    const b1 = await prisma.budget.create({
      data: {
        clientId: client.id,
        name: 'Linha de Pintura - Setor A',
        description: 'Projeto completo de pintura',
        responsavel: 'Kiera',
        status: 'DRAFT',
        precoSugerido: 150000,
        pricingMethod: 'MARGIN',
        marginPct: 0.25,
        items: {
          create: [
            { name: 'Bomba', unit: 'un', quantity: 2, unitPrice: 5000, category: 'Máquinas & Equipamentos', sortIndex: 0 },
            { name: 'Cabine', unit: 'un', quantity: 1, unitPrice: 30000, category: 'Máquinas & Equipamentos', sortIndex: 1 },
          ]
        },
        financial: {
          create: {
            regime: 'SN',
            tipoOperacao: 'MERCADORIA',
            descontoPct: 0,
            descontoValor: 0,
            frete: 0,
            seguro: 0,
            outrosCustos: 0,
            compoeBaseICMS: false,
            compoeBasePisCofins: false,
            compoeBaseIPI: false
          }
        }
      }
    })

    const b2 = await prisma.budget.create({
      data: {
        clientId: client.id,
        name: 'Sistema de Exaustão',
        description: 'Exaustão com filtros',
        responsavel: 'Equipe',
        status: 'APPROVED',
        precoSugerido: 80000,
        precoAprovado: 82000,
        items: { create: [ { name: 'Duto', unit: 'm', quantity: 120, unitPrice: 150, category: 'Materiais / Matéria-prima', sortIndex: 0 } ] },
        financial: { create: { regime: 'LP', tipoOperacao: 'SERVICO', descontoPct: 5, descontoValor: 0, frete: 2000, seguro: 0, outrosCustos: 0, compoeBaseICMS: false, compoeBasePisCofins: false, compoeBaseIPI: false } }
      }
    })

    console.log('[seed] Inserted budgets:', b1.id, b2.id)
  } finally {
    await new Promise((r) => setTimeout(r, 50))
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

