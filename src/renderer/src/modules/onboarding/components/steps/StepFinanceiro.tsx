import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Calculator } from 'lucide-react';
import { Field, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, Switch } from '../../../../shared/components/ui';
import { financeiroSchema, FinanceiroFormData } from '../../schemas/onboardingSchema';
import { OnboardingStepProps } from '../../types/onboardingTypes';
import { cn } from '@renderer/lib/utils';

const ANEXOS_SIMPLES = [
  { value: 'I', label: 'Anexo I - Comércio' },
  { value: 'II', label: 'Anexo II - Indústria' },
  { value: 'III', label: 'Anexo III - Serviços' },
  { value: 'IV', label: 'Anexo IV - Serviços' },
  { value: 'V', label: 'Anexo V - Serviços' }
];

type RegimeTributario = 'SIMPLES' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL' | 'MEI';

export function StepFinanceiro({ data, onChange }: OnboardingStepProps<FinanceiroFormData>) {
  const form = useForm<FinanceiroFormData>({
    resolver: zodResolver(financeiroSchema),
    defaultValues: {
      regimeTributario: 'SIMPLES',
      cfop: '5101 -',
      contribuinteICMS: true,
      contribuinteISS: false,
      ...data
    },
    mode: 'onChange'
  });

  const { register, watch, setValue, formState: { errors } } = form;
  const regimeTributario = watch('regimeTributario') as RegimeTributario;
  const contribuinteICMS = watch('contribuinteICMS');
  const contribuinteISS = watch('contribuinteISS');

  // Sincroniza dados com o componente pai
  useEffect(() => {
    const subscription = watch((formData) => {
      onChange(formData as FinanceiroFormData);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  const TabButton = ({ regime, label }: { regime: RegimeTributario; label: string }) => (
    <button
      type="button"
      onClick={() => setValue('regimeTributario', regime)}
      className={cn(
        'cursor-pointer px-16 py-3 text-sm font-medium rounded-lg border transition-colors',
        regimeTributario === regime
          ? 'border-blue-700 text-blue-700 bg-700/8'
          : 'border-border text-text hover:text-fg bg-transparent'
      )}
    >
      {label}
    </button>
  );

  return (
    <section className="bg-bg text-fg rounded-2xl">
      {/* Tabs de Regime Tributário */}
      <div className="flex justify-between  mb-6">
        <TabButton regime="SIMPLES" label="Simples Nacional" />
        <TabButton regime="LUCRO_PRESUMIDO" label="Lucro Presumido" />
        <TabButton regime="LUCRO_REAL" label="Lucro Real" />
        <TabButton regime="MEI" label="MEI" />
      </div>

      <form className="space-y-8">
        {/* Informações Fiscais - Simples Nacional */}
        {regimeTributario === 'SIMPLES' && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building2 size={25} className="text-text" />
              <h3 className="font-semibold text-text text-lg">Informações Fiscais</h3>
            </div>
            <div className="border-b border border-card h-[0.1px] w-full mb-4"></div>

            <div className="grid grid-cols-2 gap-5">
              <Field label="Anexo do Simples *" error={errors.anexoSimples?.message}>
                <Select
                  value={watch('anexoSimples')}
                  onValueChange={(value) => setValue('anexoSimples', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o anexo" />
                  </SelectTrigger>
                  <SelectContent>
                    {ANEXOS_SIMPLES.map((anexo) => (
                      <SelectItem key={anexo.value} value={anexo.value}>
                        {anexo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Alíquota Média Estimada (%) *" error={errors.aliquotaMediaEstimada?.message}>
                <Input
                  {...register('aliquotaMediaEstimada')}
                  placeholder="6"
                  type="number"
                  step="0.01"
                />
              </Field>
            </div>
          </div>
        )}

        {/* Informações Fiscais - Lucro Presumido */}
        {regimeTributario === 'LUCRO_PRESUMIDO' && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building2 size={25} className="text-text" />
              <h3 className="font-semibold text-text text-lg">Informações Fiscais</h3>
            </div>
            <div className="border-b border border-card h-[0.1px] w-full mb-4"></div>

            <div className="grid grid-cols-2 gap-5">
              <Field label="ICMS *" error={errors.icms?.message}>
                <Input
                  {...register('icms')}
                  placeholder="18"
                  type="number"
                  step="0.01"
                />
              </Field>

              <Field label="ISS (%) *" error={errors.issPercentual?.message}>
                <Input
                  {...register('issPercentual')}
                  placeholder="5"
                  type="number"
                  step="0.01"
                />
              </Field>

              <Field label="PIS (%) *" error={errors.pisPercentual?.message}>
                <Input
                  {...register('pisPercentual')}
                  placeholder="1,65"
                  type="number"
                  step="0.01"
                />
              </Field>

              <Field label="COFINS (%) *" error={errors.cofinsPercentual?.message}>
                <Input
                  {...register('cofinsPercentual')}
                  placeholder="7,6"
                  type="number"
                  step="0.01"
                />
              </Field>

              <Field label="CSLL (%) *" error={errors.csllPercentual?.message}>
                <Input
                  {...register('csllPercentual')}
                  placeholder="9"
                  type="number"
                  step="0.01"
                />
              </Field>

              <Field label="IRPJ (%) *" error={errors.irpjPercentual?.message}>
                <Input
                  {...register('irpjPercentual')}
                  placeholder="15"
                  type="number"
                  step="0.01"
                />
              </Field>
            </div>
          </div>
        )}

        {/* Informações Fiscais - Lucro Real */}
        {regimeTributario === 'LUCRO_REAL' && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building2 size={25} className="text-text" />
              <h3 className="font-semibold text-text text-lg">Informações Fiscais</h3>
            </div>
            <div className="border-b border border-card h-[0.1px] w-full mb-4"></div>

            <div className="grid grid-cols-2 gap-5">
              <Field label="ICMS *" error={errors.icms?.message}>
                <Input
                  {...register('icms')}
                  placeholder="18"
                  type="number"
                  step="0.01"
                />
              </Field>

              <Field label="ISS (%) *" error={errors.issPercentual?.message}>
                <Input
                  {...register('issPercentual')}
                  placeholder="5"
                  type="number"
                  step="0.01"
                />
              </Field>

              <Field label="PIS (%) *" error={errors.pisPercentual?.message}>
                <Input
                  {...register('pisPercentual')}
                  placeholder="1,65"
                  type="number"
                  step="0.01"
                />
              </Field>

              <Field label="COFINS (%) *" error={errors.cofinsPercentual?.message}>
                <Input
                  {...register('cofinsPercentual')}
                  placeholder="7,6"
                  type="number"
                  step="0.01"
                />
              </Field>

              <Field label="CSLL (%) *" error={errors.csllPercentual?.message}>
                <Input
                  {...register('csllPercentual')}
                  placeholder="9"
                  type="number"
                  step="0.01"
                />
              </Field>

              <Field label="IRPJ (%) *" error={errors.irpjPercentual?.message}>
                <Input
                  {...register('irpjPercentual')}
                  placeholder="15"
                  type="number"
                  step="0.01"
                />
              </Field>
            </div>
          </div>
        )}

        {/* Informações Fiscais - MEI */}
        {regimeTributario === 'MEI' && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building2 size={25} className="text-text" />
              <h3 className="font-semibold text-text text-lg">Informações Fiscais</h3>
            </div>
            <div className="border-b border border-card h-[0.1px] w-full mb-4"></div>

            <div className="flex items-start gap-2 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
              <Calculator size={16} className="text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm text-blue-300 font-medium">
                  Regime MEI
                </p>
                <p className="text-xs text-blue-400 mt-1">
                  O MEI possui alíquotas fixas definidas por lei. Não é necessário configurar impostos individuais.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Configurações Gerais */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Calculator size={25} className="text-text" />
            <h3 className="font-semibold text-text text-lg">Configurações Gerais</h3>
          </div>
          <div className="border-b border border-card h-[0.1px] w-full mb-4"></div>

          <div className="space-y-4">
            <Field label="CFOP *" error={errors.cfop?.message}>
              <Input
                {...register('cfop')}
                placeholder="5101 -"
              />
            </Field>

            <div className="flex items-center justify-between py-3 px-4 bg-card rounded-lg">
              <label className="text-sm font-medium text-text">
                Contribuinte de ICMS
              </label>
              <Switch
                checked={contribuinteICMS}
                onCheckedChange={(checked) => setValue('contribuinteICMS', checked)}
              />
            </div>

            <div className="flex items-center justify-between py-3 px-4 bg-card rounded-lg">
              <label className="text-sm font-medium text-text">
                Contribuinte de ISS
              </label>
              <Switch
                checked={contribuinteISS}
                onCheckedChange={(checked) => setValue('contribuinteISS', checked)}
              />
            </div>

            <Field label="Comentários Adicionais (opcional)">
              <Textarea
                {...register('comentariosAdicionais')}
                placeholder="Informações adicionais sobre a configuração fiscal da empresa..."
                rows={4}

              />
            </Field>
          </div>
        </div>
      </form>
    </section>
  );
}