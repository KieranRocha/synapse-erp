export interface CNPJResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  cidade?: string;
  uf: string;
  cep: string;
  email?: string;
  telefone?: string;
  atividade_principal?: Array<{
    codigo: string;
    descricao: string;
  }>;
  situacao?: string;
}

export interface OnboardingStepProps<T> {
  data: T;
  onChange: (data: Partial<T>) => void;
}

export interface CreateTenantResponse {
  success: boolean;
  data?: {
    tenant: {
      id: string;
      razaoSocial: string;
      cnpj: string;
    };
    admin: {
      id: string;
      nome: string;
      email: string;
    };
  };
  error?: string;
  message?: string;
}