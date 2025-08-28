import React from 'react';
import { Control, useWatch } from 'react-hook-form';
import { CheckCircle2 } from 'lucide-react';
import { Section } from '../ui';
import { ClienteFormData } from '../../schemas/clienteSchema';

interface ChecklistSidebarProps {
  control: Control<ClienteFormData>;
}

export function ChecklistSidebar({ control }: ChecklistSidebarProps) {
  const formData = useWatch({ control });
  
  const checklistItems = [
    { key: 'cpfCnpj', label: 'CPF/CNPJ' },
    { 
      key: formData.tipoPessoa === 'PJ' ? 'razaoSocial' : 'nomePF', 
      label: formData.tipoPessoa === 'PJ' ? 'Razão social' : 'Nome completo' 
    },
    { key: 'email', label: 'E-mail' },
    { key: 'telefone', label: 'Telefone' },
    { key: 'logradouro', label: 'Endereço' },
    { key: 'cidade', label: 'Cidade' },
    { key: 'uf', label: 'UF' },
  ];

  return (
    <Section 
      title="Checklist" 
      subtitle="Campos essenciais" 
      icon={<CheckCircle2 size={18} className="opacity-80" />}
    >
      <ul className="space-y-1.5 text-sm">
        {checklistItems.map((item) => {
          const fieldValue = formData[item.key as keyof ClienteFormData];
          const isCompleted = fieldValue && String(fieldValue).trim().length > 0;
          
          return (
            <li key={item.label} className="flex items-center gap-2">
              <span 
                className={`h-2.5 w-2.5 rounded-full ${
                  isCompleted ? "bg-green-500" : "bg-amber-500"
                }`} 
              />
              <span className="opacity-80">{item.label}</span>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}