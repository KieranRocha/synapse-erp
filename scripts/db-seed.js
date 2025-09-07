// Simple Prisma seed for budgets and items
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

async function main() {
  const prisma = new PrismaClient()
  try {
    await prisma.$connect()

    // Create default tenant
    const tenant = await prisma.tenant.upsert({
      where: { cnpj: '12345678901234' },
      update: {},
      create: {
        razaoSocial: 'ERP Máquinas Ltda',
        nomeFantasia: 'ERP Máquinas',
        cnpj: '12345678901234',
        ie: '123456789',
        email: 'contato@erpmaquinas.com',
        telefone: '(11) 99999-9999',
        endereco: 'Rua Exemplo, 123',
        numero: '123',
        bairro: 'Centro',
        cidade: 'São Paulo',
        uf: 'SP',
        cep: '01234567'
      }
    })

    console.log('[seed] Tenant created:', tenant.id)

    // Create test users
    const passwordHash = await bcrypt.hash('123456', 12)

    const adminUser = await prisma.usuario.upsert({
      where: { 
        tenantId_email: {
          tenantId: tenant.id,
          email: 'admin@erpmaquinas.com'
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        email: 'admin@erpmaquinas.com',
        senhaHash: passwordHash,
        nome: 'Administrador',
        cargo: 'admin',
        permissoes: { 
          admin: true, 
          users: ['create', 'read', 'update', 'delete'],
          budgets: ['create', 'read', 'update', 'delete'],
          clients: ['create', 'read', 'update', 'delete']
        }
      }
    })

    const userUser = await prisma.usuario.upsert({
      where: { 
        tenantId_email: {
          tenantId: tenant.id,
          email: 'user@erpmaquinas.com'
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        email: 'user@erpmaquinas.com',
        senhaHash: passwordHash,
        nome: 'Usuário Padrão',
        cargo: 'user',
        permissoes: { 
          admin: false, 
          budgets: ['read', 'update'],
          clients: ['read']
        }
      }
    })

    console.log('[seed] Users created:', [adminUser.email, userUser.email])

    // Ensure one client exists
    let client = await prisma.client.findFirst({
      where: { cpf_cnpj: '00000000000000' }
    })

    if (!client) {
      client = await prisma.client.create({
        data: {
          tipo_pessoa: 'PJ',
          razao_social: 'Cliente Exemplo Ltda',
          nome_fantasia: 'Cliente Exemplo',
          cpf_cnpj: '00000000000000',
          email: 'contato@exemplo.com',
          cidade: 'São Paulo',
          uf: 'SP'
        }
      })
    }

    const existing = await prisma.budget.count()
    if (existing > 0) {
      console.log(`[seed] Budgets already present: ${existing}. Skipping.`)
      return
    }

    const b1 = await prisma.budget.create({
      data: {
        clientId: client.id,
        numero: 'ORC-2024-001',
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
        numero: 'ORC-2024-002',
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

    console.log('\n=== CREDENCIAIS DE TESTE ===')
    console.log('Administrador:')
    console.log('  Email: admin@erpmaquinas.com')
    console.log('  Senha: 123456')
    console.log('')
    console.log('Usuário Padrão:')
    console.log('  Email: user@erpmaquinas.com')
    console.log('  Senha: 123456')
    console.log('============================\n')
  } finally {
    await new Promise((r) => setTimeout(r, 50))
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

