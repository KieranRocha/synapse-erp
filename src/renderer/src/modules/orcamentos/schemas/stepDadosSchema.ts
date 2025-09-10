import { z } from 'zod';

export const stepDadosSchema = z.object({
  // Dados do projeto
  numero: z.string()
    .min(1, 'Número do orçamento é obrigatório')
    .max(50, 'Número deve ter no máximo 50 caracteres'),
  
  nome: z.string()
    .min(1, 'Nome do orçamento é obrigatório')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  
  responsavel: z.string()
    .max(100, 'Nome do responsável deve ter no máximo 100 caracteres')
    .optional(),
  
  dataInicio: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      return !isNaN(Date.parse(date));
    }, 'Data de início inválida'),
  
  previsaoEntrega: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      return !isNaN(Date.parse(date));
    }, 'Data de entrega inválida'),
  
  descricao: z.string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional(),

  // Dados do cliente (preenchidos automaticamente)
  clienteId: z.number().optional(),
  
  cliente: z.string()
    .max(200, 'Nome do cliente deve ter no máximo 200 caracteres')
    .optional(),
  
  cnpj: z.string()
    .optional()
    .refine((cnpj) => {
      if (!cnpj) return true;
      const digits = cnpj.replace(/\D/g, '');
      return digits.length === 14 || digits.length === 11;
    }, 'CNPJ/CPF inválido'),
  
  clienteEndereco: z.string().optional(),
  clienteBairro: z.string().optional(),
  clienteCidade: z.string().optional(),
  clienteUF: z.string().max(2, 'UF deve ter 2 caracteres').optional(),
  clienteCEP: z.string().optional(),
  clienteAtividade: z.string().optional(),
  clienteAbertura: z.string().optional(),
}).refine((data) => {
  // Validação personalizada: se tem data de início e entrega, a entrega deve ser posterior
  if (data.dataInicio && data.previsaoEntrega) {
    const inicio = new Date(data.dataInicio);
    const entrega = new Date(data.previsaoEntrega);
    return entrega >= inicio;
  }
  return true;
}, {
  message: 'Data de entrega deve ser posterior à data de início',
  path: ['previsaoEntrega']
});

export type StepDadosFormData = z.infer<typeof stepDadosSchema>;

// Função para converter Meta para StepDadosFormData
export function metaToFormData(meta: any): StepDadosFormData {
  return {
    numero: meta.numero || '',
    nome: meta.nome || '',
    responsavel: meta.responsavel || '',
    dataInicio: meta.dataInicio || '',
    previsaoEntrega: meta.previsaoEntrega || '',
    descricao: meta.descricao || '',
    clienteId: meta.clienteId,
    cliente: meta.cliente || '',
    cnpj: meta.cnpj || '',
    clienteEndereco: meta.clienteEndereco || '',
    clienteBairro: meta.clienteBairro || '',
    clienteCidade: meta.clienteCidade || '',
    clienteUF: meta.clienteUF || '',
    clienteCEP: meta.clienteCEP || '',
    clienteAtividade: meta.clienteAtividade || '',
    clienteAbertura: meta.clienteAbertura || '',
  };
}

// Função para converter StepDadosFormData para Meta
export function formDataToMeta(formData: StepDadosFormData): any {
  return {
    numero: formData.numero,
    nome: formData.nome,
    responsavel: formData.responsavel,
    dataInicio: formData.dataInicio,
    previsaoEntrega: formData.previsaoEntrega,
    descricao: formData.descricao,
    clienteId: formData.clienteId,
    cliente: formData.cliente,
    cnpj: formData.cnpj,
    clienteEndereco: formData.clienteEndereco,
    clienteBairro: formData.clienteBairro,
    clienteCidade: formData.clienteCidade,
    clienteUF: formData.clienteUF,
    clienteCEP: formData.clienteCEP,
    clienteAtividade: formData.clienteAtividade,
    clienteAbertura: formData.clienteAbertura,
  };
}