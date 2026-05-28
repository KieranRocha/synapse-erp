import { Control, UseFormRegister, FieldErrors } from 'react-hook-form';
import { Phone, Mail, User, Briefcase } from 'lucide-react';
import { Section, Input, FormField } from '../../../../../shared/components/ui';
import { ClienteFormData } from '../../../schemas/clienteSchema';

interface ContatosSectionProps {
  control: Control<ClienteFormData>;
  register: UseFormRegister<ClienteFormData>;
  errors: FieldErrors<ClienteFormData>;
}

export function ContatosSection({ control, register, errors }: ContatosSectionProps) {
  return (
    <Section
      title="Contatos"
      subtitle="Informações de contato do cliente"
      icon={<Phone size={18} className="opacity-80" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <FormField
          label="E-mail"
          error={errors.email?.message}
          icon={<Mail className="w-4 h-4" />}
        >
          <Input
            {...register('email')}
            type="email"
            placeholder="email@empresa.com.br"
            variant={errors.email ? 'error' : 'default'}
          />
        </FormField>

        {/* Telefone */}
        <FormField
          label="Telefone"
          error={errors.telefone?.message}
          icon={<Phone className="w-4 h-4" />}
        >
          <Input
            {...register('telefone')}
            type="tel"
            placeholder="(00) 0000-0000"
            variant={errors.telefone ? 'error' : 'default'}
          />
        </FormField>

        {/* Responsável */}
        <FormField
          label="Responsável"
          error={errors.responsavel?.message}
          icon={<User className="w-4 h-4" />}
        >
          <Input
            {...register('responsavel')}
            placeholder="Nome do responsável"
            variant={errors.responsavel ? 'error' : 'default'}
          />
        </FormField>

        {/* Cargo */}
        <FormField
          label="Cargo"
          error={errors.cargo?.message}
          icon={<Briefcase className="w-4 h-4" />}
        >
          <Input
            {...register('cargo')}
            placeholder="Cargo do responsável"
            variant={errors.cargo ? 'error' : 'default'}
          />
        </FormField>
      </div>
    </Section>
  );
}