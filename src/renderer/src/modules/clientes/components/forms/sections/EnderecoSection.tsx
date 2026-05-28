import { useState, useEffect } from 'react';
import { Control, useWatch, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { MapPin, Loader2 } from 'lucide-react';
import { Section, Field, Input, Hint } from '../../../../../shared/components/ui';
import { ClienteFormData } from '../../../schemas/clienteSchema';
import { buscarCEP } from '../../../../../shared/utils/cep';
import { useToastStore } from '../../../../../shared/hooks/useToast';

interface EnderecoSectionProps {
  control: Control<ClienteFormData>;
  setValue: UseFormSetValue<ClienteFormData>;
  errors: FieldErrors<ClienteFormData>;
  register: any;
  cnpjFilled?: boolean;
}

export function EnderecoSection({ control, setValue, errors, register, cnpjFilled = false }: EnderecoSectionProps) {
  const pushToast = useToastStore();
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);

  const tipoPessoa = useWatch({ control, name: 'tipoPessoa' });
  const cep = useWatch({ control, name: 'cep' });
  const isReadonly = cnpjFilled && tipoPessoa === "PJ";

  // Formatação de CEP
  const formatCEP = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    return digits.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  // Auto-search quando CEP estiver completo
  useEffect(() => {
    const digits = cep?.replace(/\D/g, '') || '';

    if (digits.length === 8 && !cnpjFilled) {
      searchCEP(cep);
    }
  }, [cep, cnpjFilled]);

  const searchCEP = async (cepValue: string) => {
    setIsLoadingCEP(true);

    try {
      const endereco = await buscarCEP(cepValue);

      if (endereco) {
        setValue('logradouro', endereco.logradouro);
        setValue('bairro', endereco.bairro);
        setValue('cidade', endereco.cidade);
        setValue('uf', endereco.uf);

        pushToast('Endereço preenchido automaticamente a partir do CEP.');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      // Não exibir erro para não incomodar o usuário
    } finally {
      setIsLoadingCEP(false);
    }
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setValue('cep', formatted);
  };

  return (
    <Section
      title="Endereço"
      subtitle="Localização para faturamento/entrega"
      icon={<MapPin size={18} className="opacity-80" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="CEP" hint="Digite para buscar automaticamente">
          <div className="relative">
            <Input
              placeholder="00000-000"
              readOnly={isReadonly}
              {...register('cep', {
                onChange: handleCEPChange
              })}
            />
            {isLoadingCEP && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 size={16} className="animate-spin text-primary" />
              </div>
            )}
          </div>
        </Field>

        <Field label="Logradouro *" error={errors.logradouro?.message}>
          <Input
            placeholder="Rua/Av."
            readOnly={isReadonly}
            {...register('logradouro')}
          />
        </Field>

        <Field label="Número">
          <Input
            readOnly={isReadonly}
            {...register('numero')}
          />
        </Field>

        <Field label="Complemento">
          <Input
            placeholder="Bloco, sala, etc."
            readOnly={isReadonly}
            {...register('complemento')}
          />
        </Field>

        <Field label="Bairro">
          <Input
            readOnly={isReadonly}
            {...register('bairro')}
          />
        </Field>

        <Field label="Cidade *" error={errors.cidade?.message}>
          <Input
            readOnly={isReadonly}
            {...register('cidade')}
          />
        </Field>

        <Field label="UF *" error={errors.uf?.message}>
          <Input
            placeholder="SP"
            maxLength={2}
            readOnly={isReadonly}
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

        <Field label="Referência" hint="Ponto de referência">
          <Input
            placeholder="Ex.: Próximo ao mercado"
            {...register('referencia')}
          />
        </Field>
      </div>

      {isReadonly ? (
        <Hint>✅ Dados preenchidos automaticamente via CNPJ. Use "Editar manualmente" na seção Identificação para liberar os campos.</Hint>
      ) : (
        <Hint>💡 Para PJ: o CNPJ preenche automaticamente. Para PF: digite o CEP para auto-completar.</Hint>
      )}
    </Section>
  );
}