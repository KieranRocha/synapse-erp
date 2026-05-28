import { z } from 'zod';

// Step 1: Empresa (vai para tabela tenants)
export const empresaSchema = z.object({
  razaoSocial: z.string().min(1, "Razão social é obrigatória"),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().min(14, "CNPJ deve ter 14 dígitos").regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ inválido"),
  ie: z.string().optional(),
  im: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  municipioIbge: z.string().optional(),
  uf: z.string().length(2, "UF deve ter 2 caracteres").optional(),
  cep: z.string().optional(),
  timezone: z.string().default("America/Sao_Paulo"),
  moeda: z.string().default("BRL")
});

// Step 2: Usuário Admin (vai para tabela usuarios)
export const adminSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  cargo: z.string().default("Administrador")
});

// Step 3: Outros Usuários (opcionais - vão para tabela usuarios)
export const usuarioSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  cargo: z.string().optional(),
  permissoes: z.object({
    vendas: z.boolean().default(false),
    compras: z.boolean().default(false),
    estoque: z.boolean().default(false),
    financeiro: z.boolean().default(false),
    admin: z.boolean().default(false)
  }).default({})
});

export const outrosUsuariosSchema = z.object({
  usuarios: z.array(usuarioSchema).default([])
});

// Step 4: Configuração Financeira/Tributária
export const financeiroSchema = z.object({
  regimeTributario: z.enum(['MEI', 'SIMPLES', 'LUCRO_PRESUMIDO', 'LUCRO_REAL'], {
    required_error: "Regime tributário é obrigatório"
  }),

  // Campos para Simples Nacional
  anexoSimples: z.string().optional(),
  aliquotaMediaEstimada: z.string().optional(),

  // Campos para Lucro Presumido
  icms: z.string().optional(),
  issPercentual: z.string().optional(),
  pisPercentual: z.string().optional(),
  cofinsPercentual: z.string().optional(),
  csllPercentual: z.string().optional(),
  irpjPercentual: z.string().optional(),

  // Configurações gerais (comuns a todos os regimes)
  cfop: z.string().min(1, "CFOP é obrigatório"),
  contribuinteICMS: z.boolean().default(false),
  contribuinteISS: z.boolean().default(false),
  comentariosAdicionais: z.string().optional(),

  // Configurações de sistema
  utilizaEstoque: z.boolean().default(true),
  controlaFluxoCaixa: z.boolean().default(true),
  emiteNFe: z.boolean().default(false),
  emiteNFSe: z.boolean().default(false)
}).refine((data) => {
  // Validações condicionais baseadas no regime
  if (data.regimeTributario === 'SIMPLES') {
    if (!data.anexoSimples) return false;
    if (!data.aliquotaMediaEstimada) return false;
  }

  if (data.regimeTributario === 'LUCRO_PRESUMIDO') {
    if (!data.icms || !data.issPercentual || !data.pisPercentual ||
        !data.cofinsPercentual || !data.csllPercentual || !data.irpjPercentual) {
      return false;
    }
  }

  return true;
}, {
  message: "Dados obrigatórios para o regime tributário selecionado",
  path: ["regimeTributario"]
});

// Schema completo do onboarding
export const onboardingCompleteSchema = z.object({
  empresa: empresaSchema,
  admin: adminSchema,
  outrosUsuarios: outrosUsuariosSchema,
  financeiro: financeiroSchema
});

export type EmpresaFormData = z.infer<typeof empresaSchema>;
export type AdminFormData = z.infer<typeof adminSchema>;
export type UsuarioFormData = z.infer<typeof usuarioSchema>;
export type OutrosUsuariosFormData = z.infer<typeof outrosUsuariosSchema>;
export type FinanceiroFormData = z.infer<typeof financeiroSchema>;
export type OnboardingFormData = z.infer<typeof onboardingCompleteSchema>;