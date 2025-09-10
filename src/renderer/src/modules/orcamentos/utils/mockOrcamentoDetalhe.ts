// Mock data for budget details - simplified version
export const MOCK_DETALHE = {
  cliente: "Cliente Exemplo",
  projeto: "Projeto Exemplo", 
  responsavel: "Responsável Exemplo",
  emissao: new Date().toISOString().split('T')[0],
  validade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  status: "Pendente" as const,
  margem: 0.25,
  condPgto: "30 dias",
  entrega: "30 dias",
  garantia: "12 meses", 
  observacoes: "",
  subtotal: 10000
}