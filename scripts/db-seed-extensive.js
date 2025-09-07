// Extensive Prisma seed with realistic multi-tenant data
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Helper function to get random item from array
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]

// Helper function to get random date in the last N months
const randomDate = (monthsAgo) => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
  return new Date(start.getTime() + Math.random() * (now.getTime() - start.getTime()))
}

// Helper function to generate random decimal
const randomDecimal = (min, max, decimals = 2) => {
  const value = Math.random() * (max - min) + min
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

async function main() {
  console.log('🌱 Starting extensive database seeding...')

  // Password hash for all test users
  const passwordHash = await bcrypt.hash('123456', 12)

  // ==============================================
  // 1. CREATE TENANTS
  // ==============================================
  console.log('📁 Creating tenants...')

  const tenantData = [
    {
      razaoSocial: 'ERP Máquinas Industriais Ltda',
      nomeFantasia: 'ERP Máquinas',
      cnpj: '12345678901234',
      ie: '123456789',
      email: 'contato@erpmaquinas.com.br',
      telefone: '(11) 3456-7890',
      endereco: 'Av. Industrial, 1234',
      numero: '1234',
      bairro: 'Distrito Industrial',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '01234567'
    },
    {
      razaoSocial: 'TechSoft Soluções em TI Ltda',
      nomeFantasia: 'TechSoft',
      cnpj: '98765432109876',
      ie: '987654321',
      email: 'contato@techsoft.com.br',
      telefone: '(21) 2345-6789',
      endereco: 'Rua das Tecnologias, 567',
      numero: '567',
      bairro: 'Centro',
      cidade: 'Rio de Janeiro',
      uf: 'RJ',
      cep: '20000000'
    },
    {
      razaoSocial: 'ComercialPlus Distribuidora S.A.',
      nomeFantasia: 'ComercialPlus',
      cnpj: '11223344556677',
      ie: '112233445',
      email: 'vendas@comercialplus.com.br',
      telefone: '(31) 3210-9876',
      endereco: 'Rodovia dos Comerciantes, 890',
      numero: '890',
      bairro: 'Setor Comercial',
      cidade: 'Belo Horizonte',
      uf: 'MG',
      cep: '30000000'
    }
  ]

  const tenants = []
  for (const data of tenantData) {
    const tenant = await prisma.tenant.upsert({
      where: { cnpj: data.cnpj },
      update: {},
      create: data
    })
    tenants.push(tenant)
    console.log(`   ✓ ${tenant.nomeFantasia}`)
  }

  // ==============================================
  // 2. CREATE USERS FOR EACH TENANT
  // ==============================================
  console.log('👥 Creating users...')

  const userData = [
    // ERP Máquinas
    { email: 'admin@erpmaquinas.com', nome: 'Carlos Silva', cargo: 'Administrador', tenantIndex: 0 },
    { email: 'vendas@erpmaquinas.com', nome: 'Maria Santos', cargo: 'Vendedor', tenantIndex: 0 },
    { email: 'orcamento@erpmaquinas.com', nome: 'João Pereira', cargo: 'Orçamentista', tenantIndex: 0 },
    { email: 'financeiro@erpmaquinas.com', nome: 'Ana Costa', cargo: 'Financeiro', tenantIndex: 0 },

    // TechSoft
    { email: 'admin@techsoft.com', nome: 'Pedro Oliveira', cargo: 'Administrador', tenantIndex: 1 },
    { email: 'dev@techsoft.com', nome: 'Julia Lima', cargo: 'Desenvolvedor', tenantIndex: 1 },
    { email: 'comercial@techsoft.com', nome: 'Roberto Mendes', cargo: 'Comercial', tenantIndex: 1 },
    { email: 'suporte@techsoft.com', nome: 'Carla Souza', cargo: 'Suporte Técnico', tenantIndex: 1 },

    // ComercialPlus
    { email: 'admin@comercialplus.com', nome: 'Marcos Rodrigues', cargo: 'Administrador', tenantIndex: 2 },
    { email: 'vendas@comercialplus.com', nome: 'Fernanda Alves', cargo: 'Vendas', tenantIndex: 2 },
    { email: 'compras@comercialplus.com', nome: 'Ricardo Martins', cargo: 'Compras', tenantIndex: 2 },
    { email: 'estoque@comercialplus.com', nome: 'Lucia Barbosa', cargo: 'Controle de Estoque', tenantIndex: 2 }
  ]

  const users = []
  for (const user of userData) {
    const tenant = tenants[user.tenantIndex]
    const newUser = await prisma.usuario.create({
      data: {
        tenantId: tenant.id,
        email: user.email,
        senhaHash: passwordHash,
        nome: user.nome,
        cargo: user.cargo,
        permissoes: user.cargo === 'Administrador' ? 
          { admin: true, users: ['create', 'read', 'update', 'delete'], budgets: ['create', 'read', 'update', 'delete'], clients: ['create', 'read', 'update', 'delete'] } :
          { admin: false, budgets: ['read', 'update'], clients: ['read'] }
      }
    })
    users.push(newUser)
    console.log(`   ✓ ${newUser.nome} (${tenant.nomeFantasia})`)
  }

  // ==============================================
  // 3. CREATE CLIENTS FOR EACH TENANT
  // ==============================================
  console.log('🏢 Creating clients...')

  const clientNames = {
    0: [ // ERP Máquinas - Industrial clients
      'Metalúrgica Santos Ltda', 'Indústria Silva S.A.', 'Fábrica de Peças Norte', 'Siderúrgica Minas Gerais',
      'Industria Mecânica ABC', 'Fundição Central', 'Usinagem Moderna', 'Tornearia Precisão',
      'Caldeiraria Industrial', 'Serralheria Grande Porte', 'Máquinas Pesadas Sul', 'Equipamentos Norte',
      'Ferramentaria Express', 'Soldas & Cortes Ltda', 'Metalwork Solutions', 'Heavy Machinery Corp',
      'Peças & Componentes SA', 'Industrial Parts BR', 'Mechanical Systems', 'Manufacturing Plus'
    ],
    1: [ // TechSoft - Tech/Service clients
      'Inovação Digital Ltda', 'Startup Tech Brasil', 'E-commerce Solutions', 'Software House Premium',
      'Consultoria em TI', 'Cloud Services BR', 'Data Analytics Corp', 'Mobile Apps Factory',
      'Web Development Pro', 'Digital Marketing 360', 'Cyber Security Plus', 'IT Consulting Group',
      'Tech Solutions SA', 'Innovation Hub', 'Software Engineering', 'Digital Transformation',
      'AI Solutions Ltda', 'Machine Learning Co', 'DevOps Experts', 'Agile Development'
    ],
    2: [ // ComercialPlus - Retail/Commerce clients
      'Loja Casa & Decoração', 'Supermercado Família', 'Farmácia Popular', 'Eletrônicos Tech Store',
      'Moda & Estilo Boutique', 'Livraria Cultural', 'Pet Shop Amigo Fiel', 'Materiais de Construção',
      'Autopeças Rapidez', 'Papelaria Escolar', 'Perfumaria Elegance', 'Ótica Visão Clara',
      'Calçados Conforto', 'Joalheria Brilhante', 'Floricultura Primavera', 'Açougue Premium',
      'Padaria Dourada', 'Confeitaria Doce Vida', 'Sorveteria Gelato', 'Restaurante Sabor'
    ]
  }

  const estados = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'GO', 'BA', 'PE', 'CE']
  const cidades = {
    'SP': ['São Paulo', 'Santos', 'Campinas', 'Sorocaba', 'Ribeirão Preto'],
    'RJ': ['Rio de Janeiro', 'Niterói', 'Petrópolis', 'Nova Iguaçu'],
    'MG': ['Belo Horizonte', 'Uberlândia', 'Juiz de Fora', 'Contagem'],
    'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Santa Maria'],
    'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa'],
  }

  const clients = []
  for (let tenantIndex = 0; tenantIndex < tenants.length; tenantIndex++) {
    const tenant = tenants[tenantIndex]
    const names = clientNames[tenantIndex]
    
    for (let i = 0; i < 20; i++) {
      const uf = randomItem(estados)
      const cidade = randomItem(cidades[uf] || ['Capital'])
      const tipoPessoa = Math.random() > 0.3 ? 'PJ' : 'PF'
      const cpfCnpj = tipoPessoa === 'PJ' 
        ? `${String(tenantIndex)}${String(i).padStart(2, '0')}${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}01`
        : `${String(tenantIndex)}${String(i).padStart(2, '0')}${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`

      const client = await prisma.client.create({
        data: {
          tenantId: tenant.id,
          tipo_pessoa: tipoPessoa,
          razao_social: randomItem(names),
          nome_fantasia: tipoPessoa === 'PJ' ? randomItem(names).split(' ')[0] : '',
          cpf_cnpj: cpfCnpj,
          email: `cliente${i+1}@${tenant.nomeFantasia.toLowerCase().replace(/\s+/g, '')}.com.br`,
          telefone: `(${Math.floor(Math.random() * 90) + 10}) ${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
          cidade,
          uf,
          cep: `${Math.floor(Math.random() * 90000) + 10000}000`,
          limite_credito: randomDecimal(5000, 100000, 2)
        }
      })
      clients.push(client)
    }
    console.log(`   ✓ 20 clients for ${tenant.nomeFantasia}`)
  }

  // ==============================================
  // 4. CREATE BUDGETS FOR EACH TENANT
  // ==============================================
  console.log('💰 Creating budgets...')

  const budgetCategories = {
    0: [ // ERP Máquinas
      { name: 'Linha de Pintura Industrial', price: [80000, 200000] },
      { name: 'Sistema de Compressores', price: [50000, 150000] },
      { name: 'Esteira Transportadora', price: [30000, 80000] },
      { name: 'Caldeira Industrial', price: [100000, 300000] },
      { name: 'Equipamento de Solda', price: [20000, 60000] },
      { name: 'Máquina CNC', price: [150000, 500000] },
      { name: 'Prensa Hidráulica', price: [40000, 120000] },
      { name: 'Sistema de Ventilação', price: [25000, 70000] },
      { name: 'Ponte Rolante', price: [80000, 200000] },
      { name: 'Forno Industrial', price: [60000, 180000] }
    ],
    1: [ // TechSoft
      { name: 'Sistema ERP Customizado', price: [15000, 50000] },
      { name: 'Desenvolvimento de App Mobile', price: [8000, 25000] },
      { name: 'Consultoria em Cloud', price: [5000, 20000] },
      { name: 'Implementação DevOps', price: [10000, 30000] },
      { name: 'Sistema de BI Analytics', price: [12000, 40000] },
      { name: 'Desenvolvimento Web', price: [6000, 18000] },
      { name: 'Integração de Sistemas', price: [8000, 25000] },
      { name: 'Suporte Técnico Anual', price: [3000, 12000] },
      { name: 'Treinamento Técnico', price: [2000, 8000] },
      { name: 'Auditoria de Segurança', price: [4000, 15000] }
    ],
    2: [ // ComercialPlus
      { name: 'Lote de Produtos Eletrônicos', price: [5000, 25000] },
      { name: 'Coleção Moda Verão', price: [3000, 15000] },
      { name: 'Kit Materiais Construção', price: [8000, 30000] },
      { name: 'Produtos de Beleza Premium', price: [2000, 10000] },
      { name: 'Equipamentos para Casa', price: [4000, 20000] },
      { name: 'Brinquedos Educativos', price: [1500, 8000] },
      { name: 'Artigos Esportivos', price: [3000, 15000] },
      { name: 'Produtos Gourmet', price: [2500, 12000] },
      { name: 'Decoração para Lar', price: [1800, 9000] },
      { name: 'Acessórios Fashion', price: [1000, 5000] }
    ]
  }

  const statusDistribution = ['DRAFT', 'DRAFT', 'DRAFT', 'SENT', 'SENT', 'SENT', 'APPROVED', 'APPROVED', 'REJECTED', 'ARCHIVED']
  const responsaveis = {
    0: ['Carlos Silva', 'Maria Santos', 'João Pereira', 'Ana Costa', 'Roberto Técnico'],
    1: ['Pedro Oliveira', 'Julia Lima', 'Roberto Mendes', 'Carla Souza', 'Daniel Dev'],
    2: ['Marcos Rodrigues', 'Fernanda Alves', 'Ricardo Martins', 'Lucia Barbosa', 'Vendedor Extra']
  }

  const budgets = []
  for (let tenantIndex = 0; tenantIndex < tenants.length; tenantIndex++) {
    const tenant = tenants[tenantIndex]
    const tenantClients = clients.filter(c => c.tenantId === tenant.id)
    const categories = budgetCategories[tenantIndex]
    
    for (let i = 0; i < 100; i++) {
      const category = randomItem(categories)
      const status = randomItem(statusDistribution)
      const client = randomItem(tenantClients)
      const precoSugerido = randomDecimal(category.price[0], category.price[1], 2)
      const precoAprovado = status === 'APPROVED' ? randomDecimal(precoSugerido * 0.9, precoSugerido * 1.1, 2) : null
      
      const budget = await prisma.budget.create({
        data: {
          tenantId: tenant.id,
          clientId: client.id,
          numero: `ORC-${new Date().getFullYear()}-${String(tenantIndex + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
          name: `${category.name} - ${client.razao_social.split(' ')[0]}`,
          description: `Orçamento para ${category.name.toLowerCase()} conforme especificações técnicas`,
          responsavel: randomItem(responsaveis[tenantIndex]),
          status,
          startDate: randomDate(6),
          deliveryDate: randomDate(-2), // Future dates
          precoSugerido,
          precoAprovado,
          pricingMethod: Math.random() > 0.4 ? 'MARGIN' : 'MARKUP',
          marginPct: Math.random() > 0.4 ? randomDecimal(0.15, 0.35, 4) : null,
          markupPct: Math.random() <= 0.4 ? randomDecimal(1.2, 2.0, 4) : null,
          created_at: randomDate(12),
          updated_at: randomDate(3)
        }
      })
      budgets.push(budget)
    }
    console.log(`   ✓ 100 budgets for ${tenant.nomeFantasia}`)
  }

  console.log(`\n🎉 Database seeded successfully!`)
  console.log(`📊 Summary:`)
  console.log(`   • 3 Tenants`)
  console.log(`   • 12 Users (4 per tenant)`)
  console.log(`   • 60 Clients (20 per tenant)`)
  console.log(`   • 300 Budgets (100 per tenant)`)

  console.log(`\n=== CREDENTIALS ===`)
  console.log(`All users password: 123456`)
  console.log(`\nERP Máquinas:`)
  console.log(`  admin@erpmaquinas.com - Carlos Silva (Admin)`)
  console.log(`  vendas@erpmaquinas.com - Maria Santos (Vendedor)`)
  console.log(`\nTechSoft:`)
  console.log(`  admin@techsoft.com - Pedro Oliveira (Admin)`)
  console.log(`  dev@techsoft.com - Julia Lima (Dev)`)
  console.log(`\nComercialPlus:`)
  console.log(`  admin@comercialplus.com - Marcos Rodrigues (Admin)`)
  console.log(`  vendas@comercialplus.com - Fernanda Alves (Vendas)`)
  console.log(`==================\n`)
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