import React, { useState, useEffect } from "react";
import { Save, ArrowLeft, FileText, DollarSign, LayoutDashboard, Paperclip } from "lucide-react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useToastStore } from '../../../shared/hooks/useToast';
import { clienteSchema, type ClienteInput, type ClienteFormData } from '../schemas/clienteSchema';
import { DashboardClienteTab } from '../components/sections/DashboardClienteTab';
import { DadosClienteTab } from '../components/sections/DadosClienteTab';
import { FinancasClienteTab } from '../components/sections/FinancasClienteTab';
import { AnexosClienteTab } from '../components/sections/AnexosClienteTab';

type Tab = 'dashboard' | 'dados' | 'financas' | 'anexos';

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
  email: "",
  telefone: "",
  responsavel: "",
  cargo: "",
  condPgtoPadrao: "",
  limiteCredito: 0,
  vendedorPadrao: "",
  transportePadrao: "CIF",
  observacoes: "",
};

function EditarClienteForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const pushToast = useToastStore();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [nomeCliente, setNomeCliente] = useState('');
  const [clienteData, setClienteData] = useState<ClienteFormData | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors }
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues,
    mode: 'onChange'
  });

  // Watch form values to keep clienteData in sync
  const formValues = watch();

  useEffect(() => {
    const loadCliente = async () => {
      try {
        setIsLoading(true);

        // Carregar dados reais do cliente do backend
        const cliente = await window.api.clients.getById(Number(id));

        // Map database fields to form fields - TODOS OS CAMPOS DO PRISMA
        const clienteFormData: ClienteFormData = {
          tipoPessoa: cliente.tipo_pessoa,
          razaoSocial: cliente.razao_social,
          nomeFantasia: cliente.nome_fantasia || '',
          cpfCnpj: cliente.cpf_cnpj,
          indicadorIE: cliente.indicador_ie,
          ie: cliente.ie || '',
          im: cliente.im || '',
          suframa: cliente.suframa || '',
          regimeTrib: cliente.regime_trib,
          cep: cliente.cep || '',
          logradouro: cliente.logradouro || '',
          numero: cliente.numero || '',
          complemento: cliente.complemento || '',
          bairro: cliente.bairro || '',
          cidade: cliente.cidade || '',
          uf: cliente.uf || '',
          pais: cliente.pais || 'Brasil',
          email: cliente.email || '',
          telefone: cliente.telefone || '',
          responsavel: cliente.responsavel || '',
          cargo: cliente.cargo || '',
          condPgtoPadrao: cliente.cond_pgto_padrao || '',
          limiteCredito: Number(cliente.limite_credito) || 0,
          vendedorPadrao: cliente.vendedor_padrao || '',
          transportePadrao: cliente.transporte_padrao,
          observacoes: cliente.observacoes || '',
        };

        reset(clienteFormData);
        setClienteData(clienteFormData);
        setNomeCliente(clienteFormData.nomeFantasia || clienteFormData.razaoSocial || '');
      } catch (error) {
        console.error('Erro ao carregar cliente:', error);
        pushToast('Erro ao carregar dados do cliente');
        navigate('/clientes');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadCliente();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSubmit = async (data: ClienteFormData) => {
    try {
      setIsSubmitting(true);

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

      // Atualizar no backend
      await window.api.clients.update(Number(id), clienteData);

      pushToast(`Cliente "${clienteData.razaoSocial}" atualizado com sucesso!`);

      // Recarregar dados e voltar ao modo visualização
      const updatedCliente = await window.api.clients.getById(Number(id));
      const updatedFormData: ClienteFormData = {
        tipoPessoa: updatedCliente.tipo_pessoa,
        razaoSocial: updatedCliente.razao_social,
        nomeFantasia: updatedCliente.nome_fantasia || '',
        cpfCnpj: updatedCliente.cpf_cnpj,
        indicadorIE: updatedCliente.indicador_ie,
        ie: updatedCliente.ie || '',
        im: updatedCliente.im || '',
        suframa: updatedCliente.suframa || '',
        regimeTrib: updatedCliente.regime_trib,
        cep: updatedCliente.cep || '',
        logradouro: updatedCliente.logradouro || '',
        numero: updatedCliente.numero || '',
        complemento: updatedCliente.complemento || '',
        bairro: updatedCliente.bairro || '',
        cidade: updatedCliente.cidade || '',
        uf: updatedCliente.uf || '',
        pais: updatedCliente.pais || 'Brasil',
        email: updatedCliente.email || '',
        telefone: updatedCliente.telefone || '',
        responsavel: updatedCliente.responsavel || '',
        cargo: updatedCliente.cargo || '',
        condPgtoPadrao: updatedCliente.cond_pgto_padrao || '',
        limiteCredito: Number(updatedCliente.limite_credito) || 0,
        vendedorPadrao: updatedCliente.vendedor_padrao || '',
        transportePadrao: updatedCliente.transporte_padrao,
        observacoes: updatedCliente.observacoes || '',
      };

      reset(updatedFormData);
      setClienteData(updatedFormData);
      setNomeCliente(updatedFormData.nomeFantasia || updatedFormData.razaoSocial || '');
      setIsEditing(false);

    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      pushToast(`Erro ao atualizar cliente: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setActiveTab('dados'); // Mudar para aba de dados ao editar
  };

  const handleCancelEdit = () => {
    if (clienteData) {
      reset(clienteData); // Restaurar valores originais
    }
    setIsEditing(false);
  };

  const tabs = [
    { key: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { key: 'dados' as Tab, label: 'Dados', icon: FileText },
    { key: 'financas' as Tab, label: 'Finanças', icon: DollarSign },
    { key: 'anexos' as Tab, label: 'Anexos', icon: Paperclip },
  ];

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm opacity-70">Carregando dados do cliente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/clientes')}
            className="p-2 rounded-lg hover:bg-muted transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold">{nomeCliente}</h1>
            <p className="text-sm opacity-70">
              {isEditing ? 'Editando informações do cliente' : 'Visualizar informações do cliente'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition inline-flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleEdit}
              className="px-4 py-2 rounded-lg border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Editar Cliente
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent opacity-70 hover:opacity-100 hover:bg-muted/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <DashboardClienteTab clienteId={id || ''} nomeCliente={nomeCliente} />
      )}

      {activeTab === 'dados' && clienteData && (
        <DadosClienteTab
          cliente={clienteData}
          isEditing={isEditing}
          control={control}
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
        />
      )}

      {activeTab === 'financas' && (
        <FinancasClienteTab clienteId={id || ''} />
      )}

      {activeTab === 'anexos' && (
        <AnexosClienteTab clienteId={id || ''} />
      )}
    </div>
  );
}

export default function EditarClientePage() {
  return (
    <div className="h-full w-full p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <EditarClienteForm />
      </div>
    </div>
  );
}
