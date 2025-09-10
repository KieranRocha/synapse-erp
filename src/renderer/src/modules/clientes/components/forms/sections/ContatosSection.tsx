import React from 'react';
import { FieldErrors } from 'react-hook-form';
import { Phone } from 'lucide-react';
import { Section, Field, Input } from '../../../../../shared/components/ui';
import { ClienteFormData } from '../../../schemas/clienteSchema';

interface ContatosSectionProps {
  errors: FieldErrors<ClienteFormData>;
  register: any;
}

export function ContatosSection({ errors, register }: ContatosSectionProps) {
  return (
    <Section 
      title="Contatos" 
      subtitle="Canais de comunicação" 
      icon={<Phone size={18} className="opacity-80" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="E-mail *" error={errors.email?.message}>
          <Input
            placeholder="contato@empresa.com"
            type="email"
            {...register('email')}
          />
        </Field>
        
        <Field label="Telefone *" error={errors.telefone?.message}>
          <Input
            placeholder="(00) 00000-0000"
            {...register('telefone')}
          />
        </Field>
        
        <Field label="Responsável">
          <Input 
            placeholder="Pessoa de contato" 
            {...register('responsavel')} 
          />
        </Field>
        
        <Field label="Cargo">
          <Input {...register('cargo')} />
        </Field>
      </div>
    </Section>
  );
}