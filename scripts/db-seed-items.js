// Seed budget items and financial data
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper functions
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randomDecimal = (min, max, decimals = 2) => {
  const value = Math.random() * (max - min) + min
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

async function main() {
  console.log('🔧 Adding budget items and financial data...')

  // Get all budgets with their tenants
  const budgets = await prisma.budget.findMany({
    include: {
      tenant: true,
      client: true
    }
  })

  // Item categories by tenant type
  const itemCategories = {
    'ERP Máquinas': [
      { name: 'Bomba Centrífuga', unit: 'un', priceRange: [5000, 15000], category: 'Máquinas & Equipamentos' },
      { name: 'Motor Elétrico', unit: 'un', priceRange: [2000, 8000], category: 'Componentes Elétricos' },
      { name: 'Válvula de Controle', unit: 'un', priceRange: [800, 3000], category: 'Componentes Hidráulicos' },
      { name: 'Sensor de Pressão', unit: 'un', priceRange: [300, 1200], category: 'Instrumentação' },
      { name: 'Tubulação Industrial', unit: 'm', priceRange: [50, 200], category: 'Materiais' },
      { name: 'Painel Elétrico', unit: 'un', priceRange: [3000, 12000], category: 'Componentes Elétricos' },
      { name: 'Compressor de Ar', unit: 'un', priceRange: [8000, 25000], category: 'Máquinas & Equipamentos' },
      { name: 'Filtro Industrial', unit: 'un', priceRange: [400, 1800], category: 'Componentes' },
      { name: 'Estrutura Metálica', unit: 'kg', priceRange: [8, 25], category: 'Estruturas' },
      { name: 'Sistema de Refrigeração', unit: 'un', priceRange: [6000, 20000], category: 'Sistemas' }
    ],
    'TechSoft': [
      { name: 'Licença Software ERP', unit: 'licença', priceRange: [1500, 5000], category: 'Licenças' },
      { name: 'Desenvolvimento Backend', unit: 'h', priceRange: [80, 150], category: 'Desenvolvimento' },
      { name: 'Desenvolvimento Frontend', unit: 'h', priceRange: [70, 130], category: 'Desenvolvimento' },
      { name: 'Design UI/UX', unit: 'h', priceRange: [60, 120], category: 'Design' },
      { name: 'Consultoria Técnica', unit: 'h', priceRange: [100, 200], category: 'Consultoria' },
      { name: 'Treinamento de Usuários', unit: 'h', priceRange: [50, 100], category: 'Treinamento' },
      { name: 'Suporte Técnico', unit: 'mês', priceRange: [500, 2000], category: 'Suporte' },
      { name: 'Hospedagem Cloud', unit: 'mês', priceRange: [200, 1000], category: 'Infraestrutura' },
      { name: 'Integração de Sistemas', unit: 'un', priceRange: [3000, 12000], category: 'Integração' },
      { name: 'Análise de Requisitos', unit: 'h', priceRange: [90, 160], category: 'Consultoria' }
    ],
    'ComercialPlus': [
      { name: 'Smartphone Premium', unit: 'un', priceRange: [800, 2500], category: 'Eletrônicos' },
      { name: 'Notebook Corporativo', unit: 'un', priceRange: [1500, 4000], category: 'Eletrônicos' },
      { name: 'Mesa de Escritório', unit: 'un', priceRange: [300, 1200], category: 'Móveis' },
      { name: 'Cadeira Ergonômica', unit: 'un', priceRange: [200, 800], category: 'Móveis' },
      { name: 'Impressora Multifuncional', unit: 'un', priceRange: [400, 1500], category: 'Equipamentos' },
      { name: 'Monitor LED', unit: 'un', priceRange: [250, 800], category: 'Eletrônicos' },
      { name: 'Kit Produtos de Limpeza', unit: 'kit', priceRange: [50, 200], category: 'Limpeza' },
      { name: 'Material de Escritório', unit: 'kit', priceRange: [100, 400], category: 'Papelaria' },
      { name: 'Equipamento de Segurança', unit: 'un', priceRange: [150, 600], category: 'Segurança' },
      { name: 'Decoração para Ambiente', unit: 'un', priceRange: [80, 500], category: 'Decoração' }
    ]
  }

  // Financial data templates
  const regimes = ['SN', 'LP', 'LR']
  const cfops = {
    'MERCADORIA': ['5101', '5102', '5103', '5104', '5109', '5110'],
    'SERVICO': ['5933', '5949', '6101', '6102', '6103', '6104']
  }

  let totalItems = 0
  let totalFinancials = 0

  // Process each budget
  for (const budget of budgets) {
    const tenantName = budget.tenant.nomeFantasia
    const items = itemCategories[tenantName] || itemCategories['ComercialPlus']
    
    // Create 3-8 items per budget
    const itemCount = Math.floor(Math.random() * 6) + 3
    let budgetTotal = 0
    
    for (let i = 0; i < itemCount; i++) {
      const item = randomItem(items)
      const quantity = item.unit === 'h' ? randomDecimal(10, 200, 1) :
                     item.unit === 'm' ? randomDecimal(5, 100, 1) :
                     item.unit === 'kg' ? randomDecimal(50, 500, 1) :
                     Math.floor(Math.random() * 10) + 1

      const unitPrice = randomDecimal(item.priceRange[0], item.priceRange[1], 2)
      budgetTotal += quantity * unitPrice

      await prisma.budgetItem.create({
        data: {
          tenantId: budget.tenantId,
          budgetId: budget.id,
          name: item.name,
          unit: item.unit,
          quantity: quantity,
          unitPrice: unitPrice,
          category: item.category,
          sortIndex: i
        }
      })
      totalItems++
    }

    // Create financial data
    const isService = tenantName === 'TechSoft' || Math.random() > 0.7
    const tipoOperacao = isService ? 'SERVICO' : 'MERCADORIA'
    const regime = randomItem(regimes)
    const cfop = randomItem(cfops[tipoOperacao])

    // Tax rates based on regime and operation type
    let icmsAliq = 0, pisAliq = 0, cofinsAliq = 0, issAliq = 0

    if (tipoOperacao === 'MERCADORIA') {
      switch (regime) {
        case 'SN':
          // Simples Nacional - no separate ICMS/PIS/COFINS
          break
        case 'LP':
          icmsAliq = randomItem([7, 12, 18])
          pisAliq = 1.65
          cofinsAliq = 7.6
          break
        case 'LR':
          icmsAliq = randomItem([7, 12, 18])
          pisAliq = 1.65
          cofinsAliq = 7.6
          break
      }
    } else {
      // SERVICO
      issAliq = randomDecimal(2, 5, 2)
      if (regime !== 'SN') {
        pisAliq = 1.65
        cofinsAliq = 7.6
      }
    }

    await prisma.budgetFinancial.create({
      data: {
        tenantId: budget.tenantId,
        budgetId: budget.id,
        regime: regime,
        tipoOperacao: tipoOperacao,
        cfop: cfop,
        naturezaOperacao: tipoOperacao === 'MERCADORIA' ? 'Venda de mercadorias' : 'Prestação de serviços',
        ncm: tipoOperacao === 'MERCADORIA' ? '8419.89.10' : null,
        nbs: tipoOperacao === 'SERVICO' ? '1.0101' : null,
        precoVenda: budgetTotal,
        descontoPct: Math.random() > 0.7 ? randomDecimal(2, 10, 2) : 0,
        frete: tipoOperacao === 'MERCADORIA' ? randomDecimal(0, budgetTotal * 0.05, 2) : 0,
        icmsAliq: icmsAliq > 0 ? icmsAliq : null,
        pisAliq: pisAliq > 0 ? pisAliq : null,
        cofinsAliq: cofinsAliq > 0 ? cofinsAliq : null,
        issAliq: issAliq > 0 ? issAliq : null,
        municipioIncidencia: tipoOperacao === 'SERVICO' ? budget.tenant.cidade : null
      }
    })
    totalFinancials++
  }

  console.log(`   ✓ Created ${totalItems} budget items`)
  console.log(`   ✓ Created ${totalFinancials} financial records`)
  console.log(`\n🎉 Items and financial data seeded successfully!`)
  console.log(`📊 Final Summary:`)
  console.log(`   • 3 Tenants`)
  console.log(`   • 12 Users`)
  console.log(`   • 60 Clients`)
  console.log(`   • 300 Budgets`)
  console.log(`   • ${totalItems} Budget Items`)
  console.log(`   • ${totalFinancials} Financial Records`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })