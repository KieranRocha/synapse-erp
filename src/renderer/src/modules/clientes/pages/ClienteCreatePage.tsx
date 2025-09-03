import React, { useState } from "react";
import { Save, CheckCircle2 } from "lucide-react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useToastStore } from '../../../shared/stores/toastStore';
import { clienteSchema, type ClienteInput, type ClienteFormData } from '../schemas/clienteSchema';
import { 
  IdentificacaoSection, 
  EnderecoSection, 
  ContatosSection, 
  FiscalFinanceiroSection,
  ChecklistSidebar 
} from '../components/forms/sections';

const defaultValues: Partial<ClienteFormData> = {
  tipoPessoa: "PJ",
  razaoSocial: "",
  nomeFantasia: "",
  nomePF: "",
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
  email: "",
  telefone: "",
  responsavel: "",
  cargo: "",
  condPgtoPadrao: "28dd",
  limiteCredito: 0,
  vendedorPadrao: "",
  transportePadrao: "CIF",
  observacoes: "",
};

function NovoClienteForm() {
  const navigate = useNavigate();
  const pushToast = useToastStore((s: any) => s.push);
  const [cnpjFilled, setCnpjFilled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues,
    mode: 'onChange'
  });

  const onSubmit = async (data: ClienteFormData) => {
    try {
      setIsSubmitting(true);
      
      // Transformar dados do formulário para o formato do banco
      const clienteData: ClienteInput = {
        tipoPessoa: data.tipoPessoa,
        razaoSocial: data.tipoPessoa === "PJ" ? data.razaoSocial : data.nomePF,
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
        email: data.email || "",
        telefone: data.telefone || "",
        responsavel: data.responsavel || "",
        cargo: data.cargo || "",
        condPgtoPadrao: data.condPgtoPadrao || "",
        limiteCredito: data.limiteCredito || 0,
        vendedorPadrao: data.vendedorPadrao || "",
        transportePadrao: data.transportePadrao,
        observacoes: data.observacoes || ""
      };

      // Salvar no backend PostgreSQL via IPC
      const savedClient = await window.api.clients.create(clienteData);
      
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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
            errors={errors} 
            register={register}
            cnpjFilled={cnpjFilled}
          />

          <ContatosSection 
            errors={errors} 
            register={register}
          />

          <FiscalFinanceiroSection 
            register={register}
          />

          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="text-sm opacity-80 flex items-center gap-2">
              <CheckCircle2 size={18} className="opacity-70" />
              Revise os campos obrigatórios para habilitar o salvamento.
            </div>
            <div className="flex items-center gap-2">
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
        </div>

        <aside className="space-y-6 lg:sticky lg:top-5 h-fit">
          <ChecklistSidebar control={control} />
        </aside>
      </div>
    </form>
  );
}

export default function NovoClientePage() {
  return (
    <main className="max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8">
      <NovoClienteForm />
      <div className="text-xs opacity-70 mt-6">
        *Mock — Sugestões: máscara/validação de CNPJ/CPF, consulta CEP, de/para fiscal (CNAE/CSOSN), anexos.
      </div>
    </main>
  );
}

