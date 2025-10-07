/**
 * Interface para resposta da API ViaCEP
 */
export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

/**
 * Interface para endereço normalizado
 */
export interface Endereco {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  ibge: string;
}

/**
 * Busca endereço por CEP usando a API ViaCEP
 */
export async function buscarCEP(cep: string): Promise<Endereco | null> {
  try {
    const digits = cep.replace(/\D/g, '');

    if (digits.length !== 8) {
      throw new Error('CEP deve conter 8 dígitos');
    }

    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);

    if (!response.ok) {
      throw new Error('Erro ao buscar CEP');
    }

    const data: ViaCEPResponse = await response.json();

    if (data.erro) {
      throw new Error('CEP não encontrado');
    }

    return {
      cep: data.cep,
      logradouro: data.logradouro,
      complemento: data.complemento,
      bairro: data.bairro,
      cidade: data.localidade,
      uf: data.uf,
      ibge: data.ibge
    };
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    throw error;
  }
}
