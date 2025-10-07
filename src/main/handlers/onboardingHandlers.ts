import bcrypt from 'bcryptjs';
import { ipcMain } from 'electron';
import { prisma } from '../database';
import { AppError } from '../utils/AppError';
import { ErrorCode } from '../utils/ErrorCodes';

interface OnboardingFormData {
  empresa: {
    razaoSocial: string;
    nomeFantasia?: string;
    cnpj: string;
    ie?: string;
    im?: string;
    email?: string;
    telefone?: string;
    endereco?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    municipioIbge?: string;
    uf?: string;
    cep?: string;
    timezone: string;
    moeda: string;
  };
  admin: {
    nome: string;
    email: string;
    senha: string;
    cargo: string;
  };
  outrosUsuarios: {
    usuarios: Array<{
      nome: string;
      email: string;
      cargo?: string;
      permissoes: {
        vendas: boolean;
        compras: boolean;
        estoque: boolean;
        financeiro: boolean;
        admin: boolean;
      };
    }>;
  };
}

export const createTenantWithOnboarding = async (data: OnboardingFormData) => {
  try {
    console.log('🚀 Iniciando onboarding para:', data.empresa.razaoSocial);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Verificar se CNPJ já existe
      const cnpjRaw = data.empresa.cnpj.replace(/\D/g, '');
      const existingTenant = await tx.tenant.findUnique({
        where: { cnpj: cnpjRaw }
      });

      if (existingTenant) {
        throw new Error('CNPJ já cadastrado no sistema');
      }

      // 2. Verificar se email do admin já existe
      const existingAdmin = await tx.usuario.findFirst({
        where: { email: data.admin.email.toLowerCase() }
      });

      if (existingAdmin) {
        throw new Error('Email do administrador já está em uso');
      }

      // 3. Criar tenant
      const tenant = await tx.tenant.create({
        data: {
          razaoSocial: data.empresa.razaoSocial,
          nomeFantasia: data.empresa.nomeFantasia || null,
          cnpj: cnpjRaw,
          ie: data.empresa.ie || null,
          im: data.empresa.im || null,
          email: data.empresa.email || null,
          telefone: data.empresa.telefone || null,
          endereco: data.empresa.endereco || null,
          numero: data.empresa.numero || null,
          complemento: data.empresa.complemento || null,
          bairro: data.empresa.bairro || null,
          cidade: data.empresa.cidade || null,
          municipioIbge: data.empresa.municipioIbge || null,
          uf: data.empresa.uf || null,
          cep: data.empresa.cep?.replace(/\D/g, '') || null,
          timezone: data.empresa.timezone,
          moeda: data.empresa.moeda
        }
      });

      console.log('✅ Tenant criado:', tenant.id);

      // 4. Hash da senha do admin
      const hashedPassword = await bcrypt.hash(data.admin.senha, 12);

      // 5. Criar usuário admin
      const admin = await tx.usuario.create({
        data: {
          tenantId: tenant.id,
          email: data.admin.email.toLowerCase(),
          senhaHash: hashedPassword,
          nome: data.admin.nome,
          cargo: data.admin.cargo,
          permissoes: { admin: true },
          ativo: true
        }
      });

      console.log('✅ Admin criado:', admin.email);

      // 6. Criar outros usuários (se houver)
      let outrosUsuariosCriados = 0;
      if (data.outrosUsuarios.usuarios.length > 0) {
        // Verificar emails únicos primeiro
        const emailsOutrosUsuarios = data.outrosUsuarios.usuarios.map(u => u.email.toLowerCase());
        const emailsExistentes = await tx.usuario.findMany({
          where: {
            email: {
              in: emailsOutrosUsuarios
            }
          },
          select: { email: true }
        });

        if (emailsExistentes.length > 0) {
          throw new Error(`Emails já em uso: ${emailsExistentes.map(u => u.email).join(', ')}`);
        }

        const outrosUsuariosData = data.outrosUsuarios.usuarios.map(user => ({
          tenantId: tenant.id,
          email: user.email.toLowerCase(),
          nome: user.nome,
          cargo: user.cargo || null,
          permissoes: user.permissoes,
          senhaHash: 'temp-will-be-reset', // Será redefinida via email de convite
          ativo: false // Ativar quando definir senha
        }));

        const createResult = await tx.usuario.createMany({
          data: outrosUsuariosData
        });

        outrosUsuariosCriados = createResult.count;
        console.log(`✅ ${outrosUsuariosCriados} outros usuários criados`);
      }

      return { 
        tenant: {
          id: tenant.id,
          razaoSocial: tenant.razaoSocial,
          cnpj: tenant.cnpj
        }, 
        admin: {
          id: admin.id,
          nome: admin.nome,
          email: admin.email
        },
        outrosUsuarios: outrosUsuariosCriados
      };
    });

    // 7. TODO: Enviar emails de convite para outros usuários
    // Implementar sistema de convites por email

    console.log('🎉 Onboarding concluído com sucesso!');

    return { 
      success: true, 
      data: result,
      message: `Tenant "${result.tenant.razaoSocial}" criado com sucesso! Admin: ${result.admin.email}`
    };

  } catch (error) {
    console.error('❌ Erro no onboarding:', error);
    
    // Se é um erro conhecido, propagar
    if (error instanceof Error) {
      throw new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: error.message,
        severity: 'error',
        status: 400
      });
    }
    
    // Erro genérico
    throw new AppError({
      code: ErrorCode.SERVER_ERROR,
      message: 'Erro interno ao criar tenant e usuários',
      severity: 'error',
      status: 500,
      details: error
    });
  }
};

export function registerOnboardingHandlers() {
  ipcMain.handle('createTenantWithOnboarding', async (_event, data: OnboardingFormData) => {
    return createTenantWithOnboarding(data);
  });
  
  console.log('📋 Onboarding handlers registered');
}