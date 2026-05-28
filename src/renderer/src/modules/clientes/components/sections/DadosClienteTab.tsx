import React from 'react';
import { Building2, MapPin, Phone, Mail, User, FileText, CreditCard, Truck } from 'lucide-react';
import { Control, FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { ClienteFormData } from '../../schemas/clienteSchema';
import { IdentificacaoSection } from '../forms/sections/IdentificacaoSection';
import { EnderecoSection } from '../forms/sections/EnderecoSection';
import { ContatosSection } from '../forms/sections/ContatosSection';
import { FiscalFinanceiroSection } from '../forms/sections/FiscalFinanceiroSection';
import { ObservacoesSection } from '../forms/sections/ObservacoesSection';

interface DadosClienteTabProps {
  cliente: ClienteFormData;
  isEditing?: boolean;
  control?: Control<ClienteFormData>;
  register?: UseFormRegister<ClienteFormData>;
  errors?: FieldErrors<ClienteFormData>;
  watch?: UseFormWatch<ClienteFormData>;
  setValue?: UseFormSetValue<ClienteFormData>;
}

export function DadosClienteTab({
  cliente,
  isEditing = false,
  control,
  register,
  errors,
  watch,
  setValue
}: DadosClienteTabProps) {
  const [cnpjFilled, setCnpjFilled] = React.useState(false);

  const formatCurrency = (value: number) =>
    value ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—';

  // Se estiver no modo de edição, mostrar formulário
  if (isEditing && control && register && errors && watch && setValue) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-2">Editar Informações do Cliente</h2>
          <p className="text-sm opacity-70">Preencha os campos abaixo para atualizar os dados</p>
        </div>

        {/* Formulário de Edição */}
        <form className="space-y-6">
          <IdentificacaoSection
            control={control}
            register={register}
            errors={errors}
            setValue={setValue}
            cnpjFilled={cnpjFilled}
            setCnpjFilled={setCnpjFilled}
          />

          <EnderecoSection
            control={control}
            register={register}
            errors={errors}
            setValue={setValue}
          />

          <ContatosSection
            control={control}
            register={register}
            errors={errors}
          />

          <FiscalFinanceiroSection
            control={control}
            register={register}
            errors={errors}
            watch={watch}
          />

          <ObservacoesSection
            register={register}
            errors={errors}
          />
        </form>
      </div>
    );
  }

  // Modo visualização (read-only)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-2">Informações do Cliente</h2>
        <p className="text-sm opacity-70">Dados cadastrais e informações gerais</p>
      </div>

      {/* Grid de Seções */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identificação */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Building2 className="w-5 h-5 text-fg" />
            <h3 className="text-lg font-semibold text-fg">Identificação</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs opacity-70 block mb-1">Tipo de Pessoa</label>
              <p className="text-sm font-medium">
                {cliente.tipoPessoa === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}
              </p>
            </div>

            {cliente.tipoPessoa === 'PJ' ? (
              <>
                <div>
                  <label className="text-xs opacity-70 block mb-1">Razão Social</label>
                  <p className="text-sm font-medium">{cliente.razaoSocial || '—'}</p>
                </div>

                {cliente.nomeFantasia && (
                  <div>
                    <label className="text-xs opacity-70 block mb-1">Nome Fantasia</label>
                    <p className="text-sm">{cliente.nomeFantasia}</p>
                  </div>
                )}
              </>
            ) : (
              <div>
                <label className="text-xs opacity-70 block mb-1">Nome Completo</label>
                <p className="text-sm font-medium">{cliente.nomePF || cliente.razaoSocial || '—'}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs opacity-70 block mb-1">
                  {cliente.tipoPessoa === 'PJ' ? 'CNPJ' : 'CPF'}
                </label>
                <p className="text-sm font-mono">{cliente.cpfCnpj || '—'}</p>
              </div>
              <div>
                <label className="text-xs opacity-70 block mb-1">Regime Tributário</label>
                <p className="text-sm">{cliente.regimeTrib || '—'}</p>
              </div>
            </div>

            {cliente.tipoPessoa === 'PJ' && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs opacity-70 block mb-1">Indicador IE</label>
                  <p className="text-sm">{cliente.indicadorIE || '—'}</p>
                </div>
                <div>
                  <label className="text-xs opacity-70 block mb-1">IE</label>
                  <p className="text-sm font-mono">{cliente.ie || '—'}</p>
                </div>
                <div>
                  <label className="text-xs opacity-70 block mb-1">IM</label>
                  <p className="text-sm font-mono">{cliente.im || '—'}</p>
                </div>
              </div>
            )}

            {cliente.tipoPessoa === 'PJ' && cliente.suframa && (
              <div>
                <label className="text-xs opacity-70 block mb-1">SUFRAMA</label>
                <p className="text-sm font-mono">{cliente.suframa}</p>
              </div>
            )}
          </div>
        </section>

        {/* Endereço */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <MapPin className="w-5 h-5 text-fg" />
            <h3 className="text-lg font-semibold text-fg">Endereço</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs opacity-70 block mb-1">CEP</label>
              <p className="text-sm font-mono">{cliente.cep || '—'}</p>
            </div>

            <div>
              <label className="text-xs opacity-70 block mb-1">Logradouro</label>
              <p className="text-sm">{cliente.logradouro || '—'}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs opacity-70 block mb-1">Número</label>
                <p className="text-sm">{cliente.numero || 'S/N'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-xs opacity-70 block mb-1">Complemento</label>
                <p className="text-sm">{cliente.complemento || '—'}</p>
              </div>
            </div>

            <div>
              <label className="text-xs opacity-70 block mb-1">Bairro</label>
              <p className="text-sm">{cliente.bairro || '—'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs opacity-70 block mb-1">Cidade</label>
                <p className="text-sm">{cliente.cidade || '—'}</p>
              </div>
              <div>
                <label className="text-xs opacity-70 block mb-1">UF</label>
                <p className="text-sm">{cliente.uf || '—'}</p>
              </div>
            </div>

            <div>
              <label className="text-xs opacity-70 block mb-1">País</label>
              <p className="text-sm">{cliente.pais || 'Brasil'}</p>
            </div>

          </div>
        </section>
      </div>

      {/* Segunda linha de Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contatos */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Phone className="w-5 h-5 text-fg" />
            <h3 className="text-lg font-semibold text-fg">Contatos</h3>
          </div>

          <div className="space-y-4">
            {cliente.email ? (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <label className="text-xs opacity-70 block">E-mail</label>
                  <p className="text-sm">{cliente.email}</p>
                </div>
              </div>
            ) : (
              <div className="text-sm opacity-50">E-mail não informado</div>
            )}

            {cliente.telefone ? (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <label className="text-xs opacity-70 block">Telefone</label>
                  <p className="text-sm">{cliente.telefone}</p>
                </div>
              </div>
            ) : (
              <div className="text-sm opacity-50">Telefone não informado</div>
            )}

            {(cliente.responsavel || cliente.cargo) && (
              <div className="pt-2 border-t border-border">
                {cliente.responsavel && (
                  <div className="mb-3">
                    <label className="text-xs opacity-70 block mb-1 flex items-center gap-1">
                      <User className="w-3 h-3" /> Responsável
                    </label>
                    <p className="text-sm font-medium">{cliente.responsavel}</p>
                  </div>
                )}
                {cliente.cargo && (
                  <div>
                    <label className="text-xs opacity-70 block mb-1">Cargo</label>
                    <p className="text-sm">{cliente.cargo}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Dados Comerciais e Fiscais */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <CreditCard className="w-5 h-5 text-fg" />
            <h3 className="text-lg font-semibold text-fg">Dados Comerciais e Fiscais</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs opacity-70 block mb-1">Limite de Crédito</label>
              <p className="text-lg font-semibold text-emerald-600">
                {formatCurrency(cliente.limiteCredito || 0)}
              </p>
            </div>

            <div className="col-span-2">
              <label className="text-xs opacity-70 block mb-1">Condição de Pagamento</label>
              <p className="text-sm">{cliente.condPgtoPadrao || '—'}</p>
            </div>

            <div>
              <label className="text-xs opacity-70 block mb-1 flex items-center gap-1">
                <Truck className="w-3 h-3" /> Transporte
              </label>
              <p className="text-sm">{cliente.transportePadrao || '—'}</p>
            </div>

            <div>
              <label className="text-xs opacity-70 block mb-1">Vendedor Padrão</label>
              <p className="text-sm">{cliente.vendedorPadrao || '—'}</p>
            </div>
          </div>
        </section>
      </div>

      {/* Observações */}
      {cliente.observacoes && (
        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <FileText className="w-5 h-5 text-fg" />
            <h3 className="text-lg font-semibold text-fg">Observações</h3>
          </div>

          <p className="text-sm leading-relaxed whitespace-pre-wrap">{cliente.observacoes}</p>
        </section>
      )}
    </div>
  );
}
