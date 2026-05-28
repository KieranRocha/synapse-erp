import { useState, useEffect } from 'react';
import { Control, useWatch, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { Building2, Loader2 } from 'lucide-react';
import { Section, Field, Input, Select, SelectItem, Hint, Divider, RadioGroup } from '../../../../../shared/components/ui';
import { ClienteFormData } from '../../../schemas/clienteSchema';
import { CNPJResponse } from '../../../types/clienteTypes';
import { useToastStore } from '../../../../../shared/hooks/useToast';

interface IdentificacaoSectionProps {
  control: Control<ClienteFormData>;
  setValue: UseFormSetValue<ClienteFormData>;
  errors: FieldErrors<ClienteFormData>;
  register: any;
  cnpjFilled: boolean;
  setCnpjFilled: (value: boolean) => void;
}

const TIPO_PESSOA_OPTIONS = [
  { value: 'PJ', label: 'Pessoa Jurídica' },
  { value: 'PF', label: 'Pessoa Física' },
];

const INDICADOR_IE_OPTIONS = ['Contribuinte', 'Isento', 'Não Contribuinte'];
const REGIME_TRIB_OPTIONS = ['Simples Nacional', 'Lucro Presumido', 'Lucro Real'];

export function IdentificacaoSection({ control, setValue, errors, register, cnpjFilled, setCnpjFilled }: IdentificacaoSectionProps) {
  const pushToast = useToastStore();
  const [isLoadingCNPJ, setIsLoadingCNPJ] = useState(false);

  const tipoPessoa = useWatch({ control, name: 'tipoPessoa' });
  const cpfCnpj = useWatch({ control, name: 'cpfCnpj' });
  const indicadorIE = useWatch({ control, name: 'indicadorIE' });
  const regimeTrib = useWatch({ control, name: 'regimeTrib' });

  // Formatação de CPF/CNPJ
  const formatCPFCNPJ = (value: string) => {
    const digits = value.replace(/\D/g, '');

    if (digits.length <= 11) {
      // CPF: 000.000.000-00
      return digits
        .slice(0, 11)
        .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      // CNPJ: 00.000.000/0000-00
      return digits
        .slice(0, 14)
        .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  // Busca automática de CNPJ
  const searchCNPJ = async (cnpj: string) => {
    const raw = cnpj.replace(/\D/g, '');

    if (raw.length !== 14) return;

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
      const cidade = data?.municipio || "";
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
        pushToast(`Dados preenchidos automaticamente a partir do CNPJ.`);
      }

    } catch (error) {
      pushToast('Erro ao buscar CNPJ. Verifique o número e tente novamente.');
      setCnpjFilled(false);
    } finally {
      setIsLoadingCNPJ(false);
    }
  };

  // Auto-search quando CNPJ/CPF estiver completo
  useEffect(() => {
    const digits = cpfCnpj?.replace(/\D/g, '') || '';

    if (tipoPessoa === 'PJ' && digits.length === 14) {
      searchCNPJ(cpfCnpj);
    }
  }, [cpfCnpj, tipoPessoa]);

  const handleCPFCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPFCNPJ(e.target.value);
    setValue('cpfCnpj', formatted);
    setCnpjFilled(false);
  };

  const clearCNPJData = () => {
    setCnpjFilled(false);
    pushToast('Campos liberados para edição manual.');
  };

  return (
    <Section
      title="Identificação"
      subtitle="Tipo de pessoa e dados base"
      icon={<Building2 size={18} className="opacity-80" />}
    >
      <div className="space-y-5">
        <Field label="Tipo de pessoa *" hint="Selecione o tipo de pessoa">
          <RadioGroup
            options={TIPO_PESSOA_OPTIONS}
            value={tipoPessoa}
            onChange={(value) => setValue('tipoPessoa', value as 'PJ' | 'PF')}
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <Field
            label={tipoPessoa === 'PJ' ? 'CNPJ *' : 'CPF *'}
            hint={tipoPessoa === 'PJ' ? 'Digite para buscar automaticamente' : 'Ex.: 000.000.000-00'}
            error={errors.cpfCnpj?.message}
          >
            <div className="relative">
              <Input
                placeholder={tipoPessoa === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                {...register('cpfCnpj', {
                  onChange: handleCPFCNPJChange
                })}
              />
              {isLoadingCNPJ && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 size={16} className="animate-spin text-primary" />
                </div>
              )}
            </div>
          </Field>

          {tipoPessoa === 'PJ' ? (
            <>
              <Field label="Razão social *" error={errors.razaoSocial?.message}>
                <Input
                  placeholder="Nome jurídico"
                  readOnly={cnpjFilled}
                  {...register('razaoSocial')}
                />
              </Field>
              <Field label="Nome fantasia">
                <Input
                  placeholder="Como a empresa é conhecida"
                  readOnly={cnpjFilled}
                  {...register('nomeFantasia')}
                />
              </Field>
            </>
          ) : (
            <Field label="Nome completo *" error={errors.nomePF?.message}>
              <Input
                placeholder="Ex.: João Silva"
                {...register('nomePF')}
              />
            </Field>
          )}
        </div>

        <Divider />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Field label="Indicador IE *">
            <Select {...register('indicadorIE')}>
              <option value="">Selecione</option>
              {INDICADOR_IE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </Select>
          </Field>

          <Field label="IE" hint="Inscrição Estadual">
            <Input placeholder="Ex.: 123.456.789.012" {...register('ie')} />
          </Field>

          <Field label="IM" hint="Inscrição Municipal">
            <Input placeholder="Ex.: 12345" {...register('im')} />
          </Field>
        </div>

        <Field label="Regime Tributário *">
          <Select {...register('regimeTrib')}>
            <option value="">Selecione</option>
            {REGIME_TRIB_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </Select>
        </Field>

        {cnpjFilled && tipoPessoa === 'PJ' && (
          <div className="flex items-center justify-between p-3 bg-bg  rounded-lg">
            <Hint>✅ Dados preenchidos automaticamente via CNPJ</Hint>
            <button
              type="button"
              onClick={clearCNPJData}
              className="text-xs px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-100 transition"
            >
              Editar manualmente
            </button>
          </div>
        )}
      </div>
    </Section>
  );
}
