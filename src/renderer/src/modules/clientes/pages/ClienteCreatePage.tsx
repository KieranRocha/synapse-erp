import React, { useState, useEffect } from "react";
import { Save, CheckCircle2, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useToastStore } from '../../../shared/hooks/useToast';
import { clienteSchema, type ClienteInput, type ClienteFormData } from '../schemas/clienteSchema';
import {
  IdentificacaoSection,
  EnderecoSection,
  FiscalFinanceiroSection,
  ChecklistSidebar
} from '../components/forms/sections';
import { VendedorSection } from '../components/forms/sections/VendedorSection';
import { ContatosClienteSection } from '../components/forms/sections/ContatosClienteSection';

// Definição dos steps do wizard
const STEPS = [
  { key: 'dados-basicos', label: 'Dados Básicos' },
  { key: 'endereco', label: 'Endereço' },
  { key: 'contatos', label: 'Contatos' },
  { key: 'comercial', label: 'Comercial' },
  { key: 'revisao', label: 'Revisão' },
];

const defaultValues: Partial<ClienteFormData> = {
  tipoPessoa: "PJ",
  razaoSocial: "",
  nomeFantasia: "",
  cpfCnpj: "",
  ie: "",
  im: "",
  suframa: "",
  indicadorIE: "Contribuinte",
  regimeTrib: "Simples Nacional",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
  pais: "Brasil",
  condPgtoPadrao: "",
  limiteCredito: 0,
  vendedorPadraoId: null,
  transportePadrao: "CIF",
  observacoes: "",
};

function Stepper({ currentStep, setCurrentStep }: { currentStep: number; setCurrentStep: (n: number) => void }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2  pb-1">
        {STEPS.map((step, idx) => {
          const active = idx === currentStep;
          const done = idx < currentStep;

          return (
            <div key={step.key} className="flex items-center">
              <button
                onClick={() => setCurrentStep(idx)}
                type="button"
                className={`cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition ${active
                  ? "badge-analise"
                  : done
                    ? "border-emerald-500/30 badge-aprovado hover:bg-emerald-500/10"
                    : "border-border text-fg hover:bg-muted"
                  }`}
                title={step.label}
              >
                <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${done
                  ? "border-emerald-500/50 bg-emerald-500/20"
                  : active
                    ? "border-primary/50 bg-primary/10"
                    : "border-border"
                  }`}>
                  {done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                </span>
                <span className="whitespace-nowrap">{step.label}</span>
              </button>
              {idx < STEPS.length - 1 && (
                <div className="mx-2 h-px w-8 sm:w-12 bg-border/60" />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 h-1 rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-fg transition-all"
          style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

function NovoClienteForm() {
  const navigate = useNavigate();
  const pushToast = useToastStore();
  const [cnpjFilled, setCnpjFilled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);

  const handleCancel = () => {
    if (window.confirm('Tem certeza que deseja cancelar? Todos os dados não salvos serão perdidos.')) {
      navigate('/clientes');
    }
  };

  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues,
    mode: 'onChange'
  });

  const { control, register, handleSubmit, setValue, reset, formState: { errors } } = form;

  const onSubmit = async (data: ClienteFormData) => {
    try {
      setIsSubmitting(true);

      // Transformar dados do formulário para o formato do banco
      const clienteData: ClienteInput = {
        tipoPessoa: data.tipoPessoa,
        razaoSocial: data.razaoSocial,
        nomeFantasia: data.nomeFantasia || "",
        cpfCnpj: data.cpfCnpj,
        indicadorIE: data.indicadorIE,
        ie: data.ie || "",
        im: data.im || "",
        suframa: data.suframa || "",
        regimeTrib: data.regimeTrib,
        cep: data.cep || "",
        logradouro: data.logradouro || "",
        numero: data.numero || "",
        complemento: data.complemento || "",
        bairro: data.bairro || "",
        cidade: data.cidade || "",
        uf: data.uf || "",
        pais: data.pais || "Brasil",
        condPgtoPadrao: data.condPgtoPadrao || "",
        limiteCredito: data.limiteCredito || 0,
        vendedorPadraoId: data.vendedorPadraoId || null,
        transportePadrao: data.transportePadrao,
        observacoes: data.observacoes || ""
      };

      // Salvar no backend PostgreSQL via IPC
      const savedClient = await window.api.clients.create(clienteData);

      // Salvar contatos se houver
      if (contacts.length > 0) {
        const token = localStorage.getItem('token');
        if (token) {
          for (const contact of contacts) {
            await window.api.clientContacts.create(token, savedClient.id, {
              nome: contact.nome,
              cargo: contact.cargo,
              email: contact.email,
              telefone: contact.telefone,
              celular: contact.celular,
              principal: contact.principal,
              ativo: contact.ativo,
              observacoes: contact.observacoes
            });
          }
        }
      }

      pushToast(`Cliente "${clienteData.razaoSocial}" cadastrado com sucesso!`);
      console.log('Cliente salvo:', savedClient);
      navigate('/clientes');

    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      pushToast(`Erro ao cadastrar cliente: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <IdentificacaoSection
        control={control}
        setValue={setValue}
        errors={errors}
        register={register}
        cnpjFilled={cnpjFilled}
        setCnpjFilled={setCnpjFilled}
      />

      <EnderecoSection
        control={control}
        setValue={setValue}
        errors={errors}
        register={register}
        cnpjFilled={cnpjFilled}
      />



      <ContatosClienteSection onContactsChange={setContacts} />

      <FiscalFinanceiroSection
        control={control}
        setValue={setValue}
        register={register}
      />

      <div className="bg-bg border border-border rounded-2xl p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="text-sm opacity-80 flex items-center gap-2">
          <CheckCircle2 size={18} className="opacity-70" />
          Revise os campos obrigatórios para habilitar o salvamento.
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg border border-border bg-transparent text-sm hover:bg-muted transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => reset(defaultValues)}
            className="px-4 py-2 rounded-lg border border-border bg-transparent text-sm hover:bg-muted transition"
          >
            Limpar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg border inline-flex items-center gap-2 border-emerald-500/40 text-emerald-600 text-sm hover:bg-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Salvando...' : 'Salvar Cliente'}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function NovoClientePage() {
  return (
    <div className="h-full w-full p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <NovoClienteForm />
        <div className="text-xs opacity-70 mt-6">
          *Mock — Sugestões: máscara/validação de CNPJ/CPF, consulta CEP, de/para fiscal (CNAE/CSOSN), anexos.
        </div>
      </div>
    </div>
  );
}

