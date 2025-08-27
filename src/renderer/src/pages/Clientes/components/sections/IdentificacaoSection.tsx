import React, { useState } from 'react';
import { Control, useWatch, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { Building2, Search, Loader2 } from 'lucide-react';
import { Section, Field, Input, Select } from '../ui';
import { Hint, Divider } from '../ui/Hint';
import { ClienteFormData } from '../../schemas/clienteSchema';
import { CNPJResponse } from '../../types/clienteTypes';
import { useToastStore } from '../../../../store/toastStore';

interface IdentificacaoSectionProps {
  control: Control<ClienteFormData>;
  setValue: UseFormSetValue<ClienteFormData>;
  errors: FieldErrors<ClienteFormData>;
  register: any;
  cnpjFilled: boolean;
  setCnpjFilled: (value: boolean) => void;
}

export function IdentificacaoSection({ control, setValue, errors, register, cnpjFilled, setCnpjFilled }: IdentificacaoSectionProps) {
  const pushToast = useToastStore((s: any) => s.push);
  const [isLoadingCNPJ, setIsLoadingCNPJ] = useState(false);
  
  const tipoPessoa = useWatch({ control, name: 'tipoPessoa' });
  const cpfCnpj = useWatch({ control, name: 'cpfCnpj' });

  const formatCNPJ = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    return digits.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5'
    );
  };

  const searchCNPJ = async (cnpj: string) => {
    const raw = cnpj.replace(/\D/g, '');

    if (raw.length !== 14) {
      pushToast('CNPJ deve ter 14 dígitos');
      return;
    }

    setIsLoadingCNPJ(true);

    // Limpar dados anteriores
    setValue('razaoSocial', '');
    setValue('nomeFantasia', '');
    setValue('logradouro', '');
    setValue('numero', '');
    setValue('complemento', '');
    setValue('bairro', '');
    setValue('cidade', '');
    setValue('uf', '');
    setValue('cep', '');
    setCnpjFilled(false);

    try {
      const resp = await fetch(`/api/cnpj/${raw}`);
      if (!resp.ok) throw new Error("Falha na consulta de CNPJ");
      const data: CNPJResponse = await resp.json();

      const nome = data?.razao_social || data?.nome_fantasia || "";
      const logradouro = data?.logradouro || "";
      const numero = data?.numero || "";
      const complemento = data?.complemento || "";
      const bairro = data?.bairro || "";
      const cidade = data?.municipio || data?.cidade || "";
      const uf = data?.uf || "";
      const cep = data?.cep?.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2') || "";

      // Preencher formulário
      setValue('razaoSocial', nome);
      setValue('nomeFantasia', data?.nome_fantasia || "");
      setValue('logradouro', logradouro);
      setValue('numero', numero);
      setValue('complemento', complemento);
      setValue('bairro', bairro);
      setValue('cidade', cidade);
      setValue('uf', uf);
      setValue('cep', cep);

      setCnpjFilled(true);

      if (nome) {
        pushToast(`Cliente preenchido com "${nome}" a partir do CNPJ.`);
      } else {
        pushToast('Dados carregados do CNPJ.');
      }

    } catch (error) {
      pushToast('Erro ao buscar CNPJ. Verifique o número e tente novamente.');
      setCnpjFilled(false);
    } finally {
      setIsLoadingCNPJ(false);
    }
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    setValue('cpfCnpj', formatted);
    setCnpjFilled(false);
  };

  const handleCNPJSearch = () => {
    if (tipoPessoa === "PJ" && cpfCnpj) {
      searchCNPJ(cpfCnpj);
    }
  };

  const clearCNPJData = () => {
    setCnpjFilled(false);
    pushToast('Campos liberados para edição manual. Dados mantidos.');
  };

  return (
    <Section 
      title="Identificação" 
      subtitle="Tipo de pessoa e dados base" 
      icon={<Building2 size={18} className="opacity-80" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
        <Field label="Tipo de pessoa" hint="Selecione PJ ou PF.">
          <Select options={["PJ", "PF"]} {...register('tipoPessoa')} />
        </Field>
        
        <Field 
          label="CPF/CNPJ *" 
          hint={tipoPessoa === "PJ" ? "Ex.: 00.000.000/0000-00" : "Ex.: 000.000.000-00"} 
          error={errors.cpfCnpj?.message}
        >
          <div className="flex gap-2">
            <Input
              placeholder={tipoPessoa === "PJ" ? "00.000.000/0000-00" : "000.000.000-00"}
              {...register('cpfCnpj', {
                onChange: tipoPessoa === "PJ" ? handleCNPJChange : undefined
              })}
            />
            {tipoPessoa === "PJ" && (
              <button
                type="button"
                onClick={handleCNPJSearch}
                disabled={isLoadingCNPJ || !cpfCnpj}
                className="px-3 py-2 rounded-lg border border-emerald-500/40 text-emerald-600 text-sm hover:bg-emerald-500/10 hover:bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {isLoadingCNPJ ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Search size={16} />
                )}
              </button>
            )}
          </div>
        </Field>

        {tipoPessoa === "PJ" ? (
          <>
            <Field label="Razão social *" error={errors.razaoSocial?.message}>
              <Input
                placeholder="Nome jurídico"
                readonly={cnpjFilled}
                {...register('razaoSocial')}
              />
            </Field>
            <Field label="Nome fantasia" hint="Opcional">
              <Input
                placeholder="Como o cliente é conhecido"
                readonly={cnpjFilled}
                {...register('nomeFantasia')}
              />
            </Field>
          </>
        ) : (
          <Field label="Nome completo *" error={errors.nomePF?.message}>
            <Input 
              placeholder="Ex.: Maria Silva" 
              {...register('nomePF')} 
            />
          </Field>
        )}
      </div>

      <Divider />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
        <Field label="Indicador IE" hint="Contribuinte/Isento/Não Contribuinte">
          <Select 
            options={["Contribuinte", "Isento", "Não Contribuinte"]} 
            {...register('indicadorIE')} 
          />
        </Field>
        
        <Field label="IE" hint="Inscrição Estadual (se houver)">
          <Input placeholder="Isento?" {...register('ie')} />
        </Field>
        
        <Field label="IM" hint="Inscrição Municipal (se houver)">
          <Input {...register('im')} />
        </Field>
        
        <Field label="Regime Tributário" hint="Usado em faturamento e fiscal">
          <Select 
            options={["Simples Nacional", "Lucro Presumido", "Lucro Real"]} 
            {...register('regimeTrib')} 
          />
        </Field>
        
        <Field label="SUFRAMA" hint="Se aplicável">
          <Input {...register('suframa')} />
        </Field>
      </div>

      {cnpjFilled && tipoPessoa === "PJ" && (
        <div className="flex items-center justify-between mt-4">
          <Hint>✅ Alguns dados preenchidos automaticamente via CNPJ.</Hint>
          <button
            type="button"
            onClick={clearCNPJData}
            className="text-xs px-2 py-1 rounded-lg border border-border hover:bg-muted transition"
          >
            Editar manualmente
          </button>
        </div>
      )}
    </Section>
  );
}