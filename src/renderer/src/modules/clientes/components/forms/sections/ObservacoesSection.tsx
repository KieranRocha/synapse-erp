import { FileText } from 'lucide-react';
import { Section, Field, Textarea } from '../../../../../shared/components/ui';

interface ObservacoesSectionProps {
  register: any;
}

export function ObservacoesSection({ register }: ObservacoesSectionProps) {
  return (
    <Section
      title="Observações"
      subtitle="Informações adicionais sobre o cliente"
      icon={<FileText size={18} className="opacity-80" />}
    >
      <Field label="Observações" hint="Janelas de recebimento, preferências, restrições, etc.">
        <Textarea
          rows={4}
          placeholder="Digite observações relevantes sobre o cliente..."
          {...register('observacoes')}
        />
      </Field>
    </Section>
  );
}
