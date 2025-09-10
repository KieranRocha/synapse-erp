import React from 'react';
import { Control, useWatch, FieldErrors } from 'react-hook-form';
import { MapPin } from 'lucide-react';
import { Section, Field, Input, Hint } from '../../../../../shared/components/ui';
import { ClienteFormData } from '../../../schemas/clienteSchema';

interface EnderecoSectionProps {
  control: Control<ClienteFormData>;
  errors: FieldErrors<ClienteFormData>;
  register: any;
  cnpjFilled?: boolean;
}

export function EnderecoSection({ control, errors, register, cnpjFilled = false }: EnderecoSectionProps) {
  const tipoPessoa = useWatch({ control, name: 'tipoPessoa' });
  const isReadonly = cnpjFilled && tipoPessoa === "PJ";

  return (
    <Section 
      title="Endereço" 
      subtitle="Localização para faturamento/entrega" 
      icon={<MapPin size={18} className="opacity-80" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="CEP">
          <Input
            placeholder="00000-000"
            readonly={isReadonly}
            {...register('cep')}
          />
        </Field>
        
        <Field label="Logradouro *" error={errors.logradouro?.message}>
          <Input
            placeholder="Rua/Av."
            readonly={isReadonly}
            {...register('logradouro')}
          />
        </Field>
        
        <Field label="Número">
          <Input
            readonly={isReadonly}
            {...register('numero')}
          />
        </Field>
        
        <Field label="Complemento">
          <Input
            placeholder="Bloco, sala, etc."
            readonly={isReadonly}
            {...register('complemento')}
          />
        </Field>
        
        <Field label="Bairro">
          <Input
            readonly={isReadonly}
            {...register('bairro')}
          />
        </Field>
        
        <Field label="Cidade *" error={errors.cidade?.message}>
          <Input
            readonly={isReadonly}
            {...register('cidade')}
          />
        </Field>
        
        <Field label="UF *" error={errors.uf?.message}>
          <Input
            placeholder="SP"
            maxLength={2}
            readonly={isReadonly}
            {...register('uf', {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                e.target.value = e.target.value.toUpperCase().slice(0, 2);
              }
            })}
          />
        </Field>
        
        <Field label="País">
          <Input {...register('pais')} />
        </Field>
      </div>
      
      {isReadonly ? (
        <Hint>✅ Dados preenchidos automaticamente via CNPJ. Use "Editar manualmente" na seção Identificação para liberar os campos.</Hint>
      ) : (
        <Hint>🚀 Para PJ: preencha o CNPJ e clique no botão de busca para auto-completar os dados.</Hint>
      )}
    </Section>
  );
}