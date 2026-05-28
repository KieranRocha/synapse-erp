
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Search, Loader2, Info, MapPin, Upload } from 'lucide-react';
import { Section, Field, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../shared/components/ui';
import { empresaSchema, EmpresaFormData } from '../../schemas/onboardingSchema';
import { CNPJResponse, OnboardingStepProps } from '../../types/onboardingTypes';
import { useToastStore } from '../../../../shared/hooks/useToast';
import { useDropzone } from 'react-dropzone'
import { useState, useCallback, useEffect } from 'react'
export function StepEmpresa({ data, onChange }: OnboardingStepProps<EmpresaFormData>) {
  const pushToast = useToastStore();
  const [isLoadingCNPJ, setIsLoadingCNPJ] = useState(false);
  const [cnpjFilled, setCnpjFilled] = useState(false);
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setLogo(file)
      const reader = new FileReader()
      reader.onload = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/svg+xml': ['.svg'],
      'image/jpeg': ['.jpg', '.jpeg']
    },
    maxFiles: 1
  })
  const ESTADOS_BRASILEIROS = [
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' }
  ];

  const form = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema),
    defaultValues: data,
    mode: 'onChange'
  });

  const { register, setValue, watch, formState: { errors } } = form;
  const cnpj = watch('cnpj');

  // Formatação CNPJ (reutilizar do sistema de clientes)
  const formatCNPJ = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    return digits.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5'
    );
  };

  // Formatação CEP
  const formatCEP = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    return digits.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  // Busca CEP
  const searchCEP = async (cepValue: string) => {
    const raw = cepValue.replace(/\D/g, '');

    if (raw.length !== 8) {
      return;
    }

    setIsLoadingCEP(true);

    try {
      const resp = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
      if (!resp.ok) throw new Error("Falha na consulta de CEP");

      const apiData = await resp.json();

      if (apiData.erro) {
        pushToast('CEP não encontrado');
        return;
      }

      // Preencher formulário com dados da API
      setValue('endereco', apiData.logradouro || '');
      setValue('bairro', apiData.bairro || '');
      setValue('cidade', apiData.localidade || '');
      setValue('uf', apiData.uf || '');

      pushToast(`Endereço preenchido automaticamente.`);

    } catch (error) {
      pushToast('Erro ao buscar CEP. Verifique o número e tente novamente.');
    } finally {
      setIsLoadingCEP(false);
    }
  };

  // Busca CNPJ (reutilizar lógica do sistema de clientes)
  const searchCNPJ = async (cnpjValue: string) => {
    const raw = cnpjValue.replace(/\D/g, '');

    if (raw.length !== 14) {
      pushToast('CNPJ deve ter 14 dígitos');
      return;
    }

    setIsLoadingCNPJ(true);
    setCnpjFilled(false);

    // Limpar dados anteriores
    setValue('razaoSocial', '');
    setValue('nomeFantasia', '');
    setValue('endereco', '');
    setValue('numero', '');
    setValue('complemento', '');
    setValue('bairro', '');
    setValue('cidade', '');
    setValue('uf', '');
    setValue('cep', '');

    try {
      const resp = await fetch(`/api/cnpj/${raw}`);
      if (!resp.ok) throw new Error("Falha na consulta de CNPJ");

      const apiData: CNPJResponse = await resp.json();

      // Preencher formulário com dados da API
      setValue('razaoSocial', apiData?.razao_social || '');
      setValue('nomeFantasia', apiData?.nome_fantasia || '');
      setValue('endereco', apiData?.logradouro || '');
      setValue('numero', apiData?.numero || '');
      setValue('complemento', apiData?.complemento || '');
      setValue('bairro', apiData?.bairro || '');
      setValue('cidade', apiData?.municipio || apiData?.cidade || '');
      setValue('uf', apiData?.uf || '');
      setValue('cep', apiData?.cep?.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2') || '');

      setCnpjFilled(false);
      pushToast(`Empresa "${apiData?.razao_social}" preenchida automaticamente.`);

    } catch (error) {
      pushToast('Erro ao buscar CNPJ. Verifique o número e tente novamente.');
      setCnpjFilled(false);
    } finally {
      setIsLoadingCNPJ(false);
    }
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    setValue('cnpj', formatted);
    setCnpjFilled(false);

    // Auto-search when CNPJ is complete
    const raw = formatted.replace(/\D/g, '');
    if (raw.length === 14) {
      searchCNPJ(formatted);
    }
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setValue('cep', formatted);

    // Auto-search when CEP is complete
    const raw = formatted.replace(/\D/g, '');
    if (raw.length === 8) {
      searchCEP(formatted);
    }
  };

  // Sync com hook principal
  useEffect(() => {
    const subscription = watch((formData) => {
      onChange(formData as EmpresaFormData);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  return (
    <section className="bg-bg text-fg rounded-2xl ">
      <div className="flex items-center gap-3 mb-2">
        <Info size={20} className="text-text" />
        <h3 className="font-semibold text-text text-lg">Dados da Empresa</h3>
      </div>
      <div className="border-b border border-card  h-[0.1px] w-full mb-4"></div>
      <form className="">
        <div className='space-y-2 grid grid-cols-2 gap-5'>


          {/* CNPJ com busca automática */}
          <Field
            label="CNPJ *"
            hint="Digite o CNPJ para preencher automaticamente"
            error={errors.cnpj?.message}
          >
            <div className="relative">
              <Input
                placeholder="00.000.000/0000-00"
                {...register('cnpj', {
                  onChange: handleCNPJChange
                })}
              />
              {isLoadingCNPJ && (
                <div className="absolute bottom-1/2 top-1/2 right-3 flex items-center">
                  <Loader2 size={16} className="animate-spin text-text" />
                </div>
              )}
            </div>
          </Field>


          <Field label="Razão Social *" error={errors.razaoSocial?.message}>
            <Input
              placeholder="Nome jurídico da empresa"
              readOnly={cnpjFilled}
              {...register('razaoSocial')}
            />
          </Field>

          <Field label="Nome Fantasia">
            <Input
              placeholder="Como a empresa é conhecida"
              readOnly={cnpjFilled}
              {...register('nomeFantasia')}
            />
          </Field>
          <Field label="Inscrição Estadual">
            <Input placeholder="123.456.789.012" {...register('ie')} />
          </Field>
          <Field label="Inscrição Municipal">
            <Input placeholder="IM" {...register('im')} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input
              type="email"
              placeholder="contato@empresa.com"
              {...register('email')}
            />
          </Field>

          <Field label="Telefone">
            <Input
              placeholder="(11) 99999-9999"
              {...register('telefone')}
            />
          </Field>
          <div className="mb-6">
            <div
              {...getRootProps()}
              className={`
                            border-2 border-dashed rounded-lg p-2 text-center cursor-pointer transition-colors mt-2
                            ${isDragActive
                  ? 'border-primary bg-primary/10'
                  : 'border-neutral-600 hover:border-primary hover:bg-primary/5'
                }
                        `}
            >
              <input {...getInputProps()} />
              {logoPreview ? (
                <div className=" space-y-2">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max- object-contain"
                  />
                  <p className="text-text text-sm">
                    {logo?.name} - Clique ou arraste para trocar
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center ">
                  <p className="text-text font-medium">
                    {isDragActive
                      ? 'Solte o arquivo aqui...'
                      : 'Arraste o logo aqui ou clique para selecionar'
                    }
                  </p>
                  <p className="text-text text-xs">
                    PNG, SVG, JPEG (máx. 1 arquivo)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Endereço */}
        <div className="flex items-center gap-3 mb-2 pt-8">
          <MapPin size={25} className="text-text" />
          <h3 className="font-semibold text-text text-lg">Localização</h3>
        </div>
        <div className="border-b border border-card  h-[0.1px] w-full mb-4"></div>
        <div className='space-y-2 grid grid-cols-2 gap-5'>



          <Field label="CEP">
            <div className="relative">
              <Input
                placeholder="00000-000"
                readOnly={cnpjFilled}
                {...register('cep', {
                  onChange: handleCEPChange
                })}
              />
              {isLoadingCEP && (
                <div className="absolute bottom-1 right-3 flex items-center">
                  <Loader2 size={16} className="animate-spin text-blue-600" />
                </div>
              )}
            </div>
          </Field>

          <Field label="Endereço" className="">
            <Input
              placeholder="Logradouro"
              readOnly={cnpjFilled}
              {...register('endereco')}
            />
          </Field>

          <Field label="Número">
            <Input
              placeholder="123"
              readOnly={cnpjFilled}
              {...register('numero')}
            />
          </Field>

          <Field label="Complemento">
            <Input
              placeholder="Apt, sala, etc"
              readOnly={cnpjFilled}
              {...register('complemento')}
            />
          </Field>

          <Field label="Bairro">
            <Input
              placeholder="Bairro"
              readOnly={cnpjFilled}
              {...register('bairro')}
            />
          </Field>

          <Field label="Cidade">
            <Input
              placeholder="Cidade"
              readOnly={cnpjFilled}
              {...register('cidade')}
            />
          </Field>

          <Field label="UF" error={errors.uf?.message}>
            <Select
              value={watch('uf')}
              onValueChange={(value) => setValue('uf', value)}
              disabled={cnpjFilled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_BRASILEIROS.map((estado) => (
                  <SelectItem key={estado.value} value={estado.value}>
                    {estado.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>












        </div>



        {cnpjFilled && (
          <div className="flex items-center justify-between mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <span className="text-sm text-emerald-700">
              ✅ Dados preenchidos automaticamente via CNPJ
            </span>
            <button
              type="button"
              onClick={() => setCnpjFilled(false)}
              className="text-xs px-2 py-1 rounded border border-emerald-300 text-emerald-700 hover:bg-emerald-100 transition"
            >
              Editar manualmente
            </button>
          </div>
        )}
      </form>
      {/* Logo Upload Section */}

    </section>
  );
}