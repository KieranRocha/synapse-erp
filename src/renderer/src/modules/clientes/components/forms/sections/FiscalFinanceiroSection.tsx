import React from 'react';
import { Landmark } from 'lucide-react';
import { Section, Field, Input, Select, Textarea } from '../../../../../shared/components/ui';
import { ClienteFormData } from '../../../schemas/clienteSchema';

interface FiscalFinanceiroSectionProps {
  register: any;
}

export function FiscalFinanceiroSection({ register }: FiscalFinanceiroSectionProps) {
  return (
    <Section 
      title="Fiscal & Financeiro" 
      subtitle="Preferências e limites" 
      icon={<Landmark size={18} className="opacity-80" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Field label="Condição de pagamento (padrão)" hint="Ex.: à vista, 28dd, 30/60">
          <Input 
            placeholder="28dd" 
            {...register('condPgtoPadrao')} 
          />
        </Field>
        
        <Field label="Limite de crédito (R$)">
          <Input 
            placeholder="R$ 0,00" 
            {...register('limiteCredito')} 
          />
        </Field>
        
        <Field label="Vendedor padrão">
          <Input {...register('vendedorPadrao')} />
        </Field>
        
        <Field label="Transporte padrão">
          <Select 
            options={["CIF", "FOB", "Retira"]} 
            {...register('transportePadrao')} 
          />
        </Field>
        
        <div className="md:col-span-3">
          <Field label="Observações" hint="Janelas de recebimento, preferências, anexos fiscais, etc.">
            <Textarea 
              rows={3} 
              {...register('observacoes')} 
            />
          </Field>
        </div>
      </div>
    </Section>
  );
}