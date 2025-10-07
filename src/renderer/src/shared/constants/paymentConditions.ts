/**
 * Condições de pagamento mais utilizadas
 */
export const CONDICOES_PAGAMENTO = [
  { value: 'avista', label: 'À vista' },
  { value: '7dd', label: '7 dias' },
  { value: '14dd', label: '14 dias' },
  { value: '21dd', label: '21 dias' },
  { value: '28dd', label: '28 dias' },
  { value: '30dd', label: '30 dias' },
  { value: '45dd', label: '45 dias' },
  { value: '60dd', label: '60 dias' },
  { value: '90dd', label: '90 dias' },
  { value: '30-60', label: '30/60 dias' },
  { value: '30-60-90', label: '30/60/90 dias' },
  { value: '28-56', label: '28/56 dias' },
] as const;
