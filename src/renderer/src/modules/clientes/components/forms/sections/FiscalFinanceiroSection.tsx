import { Control, useWatch, UseFormSetValue } from 'react-hook-form';
import { Landmark } from 'lucide-react';
import { Section, Field, Input } from '../../../../../shared/components/ui';
import { ClienteFormData } from '../../../schemas/clienteSchema';
import { CONDICOES_PAGAMENTO } from '../../../../../shared/constants/paymentConditions';

interface FiscalFinanceiroSectionProps {
  control: Control<ClienteFormData>;
  setValue: UseFormSetValue<ClienteFormData>;
  register: any;
}

export function FiscalFinanceiroSection({ control, setValue, register }: FiscalFinanceiroSectionProps) {
  return (
    <Section
      title="Informações Comerciais"
      subtitle="Preferências comerciais e limites"
      icon={<Landmark size={18} className="opacity-80" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Field label="Categoria do Cliente *">
          <select
            className="w-full px-3 py-2 border border-gray-700 bg-black text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('categoria')}
          >
            <option value="">Selecione</option>
            <option value="A">A - Premium</option>
            <option value="B">B - Padrão</option>
            <option value="C">C - Básico</option>
          </select>
        </Field>

        <Field label="Condição de Pagamento *">
          <select
            className="w-full px-3 py-2 border border-gray-700 bg-black text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('condPgtoPadrao')}
          >
            <option value="">Selecione</option>
            {CONDICOES_PAGAMENTO.map((cond) => (
              <option key={cond.value} value={cond.value}>
                {cond.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Transporte Padrão *">
          <select
            className="w-full px-3 py-2 border border-gray-700 bg-black text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('transportePadrao')}
          >
            <option value="">Selecione</option>
            <option value="CIF">CIF - Remetente paga frete</option>
            <option value="FOB">FOB - Destinatário paga frete</option>
          </select>
        </Field>

        <Field label="Limite de Crédito (R$)">
          <Input
            type="number"
            placeholder="0.00"
            step="0.01"
            min="0"
            {...register('limiteCredito')}
          />
        </Field>

        <Field label="Desconto Padrão (%)" hint="Aplicado automaticamente">
          <Input
            type="number"
            placeholder="0"
            step="0.01"
            min="0"
            max="100"
            {...register('descontoPadrao')}
          />
        </Field>

        <Field label="Vendedor Responsável">
          <Input
            placeholder="Nome do vendedor"
            {...register('vendedorPadrao')}
          />
        </Field>
      </div>
    </Section>
  );
}