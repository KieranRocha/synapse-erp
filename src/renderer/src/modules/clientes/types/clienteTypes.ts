export type TipoPessoa = "PJ" | "PF";
export type RegimeTrib = "Simples Nacional" | "Lucro Presumido" | "Lucro Real";
export type IndicadorIE = "Contribuinte" | "Isento" | "Não Contribuinte";
export type TransportePadrao = "CIF" | "FOB" | "Retira";

export interface ClienteForm {
  tipoPessoa: TipoPessoa;
  razaoSocial: string;
  nomeFantasia: string;
  nomePF: string;
  cpfCnpj: string;
  ie: string;
  im: string;
  suframa: string;
  indicadorIE: IndicadorIE;
  regimeTrib: RegimeTrib;

  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  pais: string;

  email: string;
  telefone: string;
  responsavel: string;
  cargo: string;

  condPgtoPadrao: string;
  limiteCredito: string;
  vendedorPadrao: string;
  transportePadrao: TransportePadrao;
  observacoes: string;
}

export interface CNPJResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  email: string;
  telefone: string;
  atividade_principal: Array<{
    codigo: string;
    descricao: string;
  }>;
  situacao: string;
}