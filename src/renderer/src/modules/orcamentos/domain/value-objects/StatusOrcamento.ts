export const VALID_STATUS = ['em_analise', 'aprovado', 'reprovado', 'vencido'] as const;
export type StatusOrcamento = (typeof VALID_STATUS)[number];
