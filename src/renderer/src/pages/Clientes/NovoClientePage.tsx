import React, { useState } from "react";
import {
  Save,
  Mail,
  Phone,
  MapPin,
  Building2,
  Landmark,
  CheckCircle2,
  Search,
  Loader2,
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useClientesStore, type Cliente } from '../../store/clientesStore';
import { useToastStore } from '../../store/toastStore';

type TipoPessoa = "PJ" | "PF";
type RegimeTrib = "Simples Nacional" | "Lucro Presumido" | "Lucro Real";

interface ClienteForm {
  tipoPessoa: TipoPessoa;
  razaoSocial: string;
  nomeFantasia: string;
  nomePF: string;
  cpfCnpj: string;
  ie: string;
  im: string;
  suframa: string;
  indicadorIE: "Contribuinte" | "Isento" | "Não Contribuinte";
  regimeTrib: RegimeTrib;

  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  pais: string;

  email: string;
  telefone: string;
  responsavel: string;
  cargo: string;

  condPgtoPadrao: string;
  limiteCredito: string;
  vendedorPadrao: string;
  transportePadrao: string;
  observacoes: string;
}

interface CNPJResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  email: string;
  telefone: string;
  atividade_principal: Array<{
    codigo: string;
    descricao: string;
  }>;
  situacao: string;
}

const initialForm: ClienteForm = {
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
  limiteCredito: "",
  vendedorPadrao: "",
  transportePadrao: "CIF",
  observacoes: "",
};

function Section({ title, subtitle, icon, children }: { title: string; subtitle?: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-card border border-border rounded-2xl">
      <header className="px-4 md:px-5 py-3 border-b border-border flex items-center gap-2">
        {icon}
        <div>
          <h3 className="font-semibold leading-tight">{title}</h3>
          {subtitle && <p className="text-xs opacity-70 mt-0.5">{subtitle}</p>}
        </div>
      </header>
      <div className="px-4 md:px-5 py-4">{children}</div>
    </section>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium opacity-90">{label}</label>
      {children}
      {hint && !error && <p className="text-[11px] opacity-60">{hint}</p>}
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", autoCapitalize, maxLength, disabled = false, readonly = false }: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  autoCapitalize?: string;
  maxLength?: number;
  disabled?: boolean;
  readonly?: boolean;
}) {
  return (
    <input
      className={`w-full px-3 py-2 rounded-lg border border-input text-sm placeholder:text-muted-foreground/30 ${disabled || readonly ? 'bg-muted opacity-70 cursor-not-allowed' : 'bg-card'
        }`}
      value={value}
      onChange={(e) => !disabled && !readonly && onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
      autoCapitalize={autoCapitalize}
      maxLength={maxLength}
      disabled={disabled}
      readOnly={readonly}
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <select
      className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

function Textarea({ value, onChange, rows = 3, placeholder }: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm  placeholder:text-muted-foreground resize-none"
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] opacity-60">{children}</p>;
}

function Divider() {
  return <div className="h-px bg-border" />;
}

function NovoClienteForm() {
  const navigate = useNavigate();
  const { addCliente } = useClientesStore();
  const pushToast = useToastStore((s: any) => s.push);
  const [form, setForm] = useState<ClienteForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingCNPJ, setIsLoadingCNPJ] = useState(false);
  const [cnpjFilled, setCnpjFilled] = useState(false);

  const onChange = (key: keyof ClienteForm, value: any) => setForm((s) => ({ ...s, [key]: value }));

  const formatCNPJ = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    return digits.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5'
    );
  };

  const searchCNPJ = async (cnpj: string) => {
    const raw = cnpj.replace(/\D/g, '');

    if (raw.length !== 14) {
      pushToast('CNPJ deve ter 14 dígitos');
      return;
    }

    setIsLoadingCNPJ(true);

    // Limpar dados anteriores antes de fazer nova busca
    setForm(prev => ({
      ...prev,
      razaoSocial: "",
      nomeFantasia: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      cep: "",
    }));
    setCnpjFilled(false);

    try {
      const resp = await fetch(`/api/cnpj/${raw}`);
      if (!resp.ok) throw new Error("Falha na consulta de CNPJ");
      const data = await resp.json();

      const nome = data?.razao_social || data?.nome_fantasia || "";
      const logradouro = data?.logradouro || "";
      const numero = data?.numero || "";
      const complemento = data?.complemento || "";
      const bairro = data?.bairro || "";
      const cidade = data?.municipio || data?.cidade || "";
      const uf = data?.uf || "";
      const cep = data?.cep?.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2') || "";

      // Preencher formulário com dados da API
      setForm(prev => ({
        ...prev,
        razaoSocial: nome,
        nomeFantasia: data?.nome_fantasia || "",
        logradouro: logradouro,
        numero: numero,
        complemento: complemento,
        bairro: bairro,
        cidade: cidade,
        uf: uf,
        cep: cep,
      }));

      setCnpjFilled(true);

      if (nome) {
        pushToast(`Cliente preenchido com "${nome}" a partir do CNPJ.`);
      } else {
        pushToast('Dados carregados do CNPJ.');
      }

    } catch (error) {
      pushToast('Erro ao buscar CNPJ. Verifique o número e tente novamente.');
      setCnpjFilled(false);
    } finally {
      setIsLoadingCNPJ(false);
    }
  };

  const handleCNPJChange = (value: string) => {
    const formatted = formatCNPJ(value);
    onChange("cpfCnpj", formatted);
    setCnpjFilled(false); // Reset quando CNPJ muda
  };

  const handleCNPJSearch = () => {
    console.log('handleCNPJSearch called with:', {
      tipoPessoa: form.tipoPessoa,
      cpfCnpj: form.cpfCnpj,
      cleanCNPJ: form.cpfCnpj.replace(/\D/g, '')
    });

    if (form.tipoPessoa === "PJ" && form.cpfCnpj) {
      searchCNPJ(form.cpfCnpj);
    } else {
      console.log('Search not triggered - conditions not met');
    }
  };

  const clearCNPJData = () => {
    setCnpjFilled(false);
    pushToast('Campos liberados para edição manual. Dados mantidos.');
  };

  function validar() {
    const e: Record<string, string> = {};
    if (!form.cpfCnpj.trim()) e.cpfCnpj = "Informe CPF/CNPJ";
    if (form.tipoPessoa === "PJ") {
      if (!form.razaoSocial.trim()) e.razaoSocial = "Razão social obrigatória";
    } else {
      if (!form.nomePF.trim()) e.nomePF = "Nome obrigatório";
    }
    if (!form.email.trim()) e.email = "E-mail obrigatório";
    if (!form.telefone.trim()) e.telefone = "Telefone obrigatório";
    if (!form.logradouro.trim()) e.logradouro = "Endereço obrigatório";
    if (!form.cidade.trim()) e.cidade = "Cidade obrigatória";
    if (!form.uf.trim()) e.uf = "UF obrigatória";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function salvar() {
    if (!validar()) {
      pushToast("Corrija os campos destacados");
      return;
    }

    try {
      const clienteData: Omit<Cliente, 'id'> = {
        cnpj: form.cpfCnpj,
        razaoSocial: form.tipoPessoa === "PJ" ? form.razaoSocial : form.nomePF,
        nomeFantasia: form.nomeFantasia,
        endereco: form.logradouro,
        numero: form.numero,
        complemento: form.complemento,
        bairro: form.bairro,
        cidade: form.cidade,
        uf: form.uf,
        cep: form.cep,
        email: form.email,
        telefone: form.telefone,
        atividade: "",
        dataAbertura: "",
        inscricaoEstadual: form.ie,
        inscricaoMunicipal: form.im,
        regime: form.regimeTrib === "Simples Nacional" ? "SN" : form.regimeTrib === "Lucro Presumido" ? "LP" : "LR",
        observacoes: form.observacoes
      };

      addCliente(clienteData);
      pushToast(`Cliente "${clienteData.razaoSocial}" cadastrado com sucesso!`);
      navigate('/clientes');
    } catch (error) {
      pushToast('Erro ao cadastrar cliente. Tente novamente.');
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Section title="Identificação" subtitle="Tipo de pessoa e dados base" icon={<Building2 size={18} className="opacity-80" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
            <Field label="Tipo de pessoa" hint="Selecione PJ ou PF.">
              <Select value={form.tipoPessoa} onChange={(v) => onChange("tipoPessoa", v)} options={["PJ", "PF"]} />
            </Field>
            <Field label="CPF/CNPJ *" hint={form.tipoPessoa === "PJ" ? "Ex.: 00.000.000/0000-00" : "Ex.: 000.000.000-00"} error={errors.cpfCnpj}>
              <div className="flex gap-2">
                <Input
                  value={form.cpfCnpj}
                  onChange={form.tipoPessoa === "PJ" ? handleCNPJChange : (v) => onChange("cpfCnpj", v)}
                  placeholder={form.tipoPessoa === "PJ" ? "00.000.000/0000-00" : "000.000.000-00"}
                />
                {form.tipoPessoa === "PJ" && (
                  <button
                    type="button"
                    onClick={handleCNPJSearch}
                    disabled={isLoadingCNPJ || !form.cpfCnpj}
                    className="px-3 py-2 rounded-lg border border-emerald-500/40 text-emerald-600 text-sm hover:bg-emerald-500/10 hover:bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {isLoadingCNPJ ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Search size={16} />
                    )}
                  </button>
                )}
              </div>
            </Field>
            {form.tipoPessoa === "PJ" ? (
              <>
                <Field label="Razão social *" error={errors.razaoSocial}>
                  <Input
                    value={form.razaoSocial}
                    onChange={(v) => onChange("razaoSocial", v)}
                    placeholder="Nome jurídico"
                    readonly={cnpjFilled}
                  />
                </Field>
                <Field label="Nome fantasia" hint="Opcional">
                  <Input
                    value={form.nomeFantasia}
                    onChange={(v) => onChange("nomeFantasia", v)}
                    placeholder="Como o cliente é conhecido"
                    readonly={cnpjFilled}
                  />
                </Field>
              </>
            ) : (
              <Field label="Nome completo *" error={errors.nomePF}>
                <Input value={form.nomePF} onChange={(v) => onChange("nomePF", v)} placeholder="Ex.: Maria Silva" />
              </Field>
            )}
          </div>
          <Divider />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
            <Field label="Indicador IE" hint="Contribuinte/Isento/Não Contribuinte">
              <Select value={form.indicadorIE} onChange={(v) => onChange("indicadorIE", v)} options={["Contribuinte", "Isento", "Não Contribuinte"]} />
            </Field>
            <Field label="IE" hint="Inscrição Estadual (se houver)">
              <Input value={form.ie} onChange={(v) => onChange("ie", v)} placeholder="Isento?" />
            </Field>
            <Field label="IM" hint="Inscrição Municipal (se houver)">
              <Input value={form.im} onChange={(v) => onChange("im", v)} />
            </Field>
            <Field label="Regime Tributário" hint="Usado em faturamento e fiscal">
              <Select value={form.regimeTrib} onChange={(v) => onChange("regimeTrib", v)} options={["Simples Nacional", "Lucro Presumido", "Lucro Real"]} />
            </Field>
            <Field label="SUFRAMA" hint="Se aplicável">
              <Input value={form.suframa} onChange={(v) => onChange("suframa", v)} />
            </Field>
          </div>
        </Section>

        <Section title="Endereço" subtitle="Localização para faturamento/entrega" icon={<MapPin size={18} className="opacity-80" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="CEP">
              <Input
                value={form.cep}
                onChange={(v) => onChange("cep", v)}
                placeholder="00000-000"
                readonly={cnpjFilled && form.tipoPessoa === "PJ"}
              />
            </Field>
            <Field label="Logradouro *" error={errors.logradouro}>
              <Input
                value={form.logradouro}
                onChange={(v) => onChange("logradouro", v)}
                placeholder="Rua/Av."
                readonly={cnpjFilled && form.tipoPessoa === "PJ"}
              />
            </Field>
            <Field label="Número">
              <Input
                value={form.numero}
                onChange={(v) => onChange("numero", v)}
                readonly={cnpjFilled && form.tipoPessoa === "PJ"}
              />
            </Field>
            <Field label="Complemento">
              <Input
                value={form.complemento}
                onChange={(v) => onChange("complemento", v)}
                placeholder="Bloco, sala, etc."
                readonly={cnpjFilled && form.tipoPessoa === "PJ"}
              />
            </Field>
            <Field label="Bairro">
              <Input
                value={form.bairro}
                onChange={(v) => onChange("bairro", v)}
                readonly={cnpjFilled && form.tipoPessoa === "PJ"}
              />
            </Field>
            <Field label="Cidade *" error={errors.cidade}>
              <Input
                value={form.cidade}
                onChange={(v) => onChange("cidade", v)}
                readonly={cnpjFilled && form.tipoPessoa === "PJ"}
              />
            </Field>
            <Field label="UF *" error={errors.uf}>
              <Input
                value={form.uf}
                onChange={(v) => onChange("uf", v.toUpperCase().slice(0, 2))}
                maxLength={2}
                placeholder="SP"
                readonly={cnpjFilled && form.tipoPessoa === "PJ"}
              />
            </Field>
            <Field label="País">
              <Input value={form.pais} onChange={(v) => onChange("pais", v)} />
            </Field>
          </div>
          {cnpjFilled && form.tipoPessoa === "PJ" ? (
            <div className="flex items-center justify-between mt-4">
              <Hint>✅ Dados preenchidos automaticamente via CNPJ. Campos bloqueados para edição.</Hint>
              <button
                type="button"
                onClick={clearCNPJData}
                className="text-xs px-2 py-1 rounded-lg border border-border hover:bg-muted transition"
              >
                Editar manualmente
              </button>
            </div>
          ) : (
            <Hint>🚀 Para PJ: preencha o CNPJ e clique no botão de busca para auto-completar os dados.</Hint>
          )}
        </Section>

        <Section title="Contatos" subtitle="Canais de comunicação" icon={<Phone size={18} className="opacity-80" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="E-mail *" error={errors.email}>
              <Input
                value={form.email}
                onChange={(v) => onChange("email", v)}
                placeholder="contato@empresa.com"
              />
            </Field>
            <Field label="Telefone *" error={errors.telefone}>
              <Input
                value={form.telefone}
                onChange={(v) => onChange("telefone", v)}
                placeholder="(00) 00000-0000"
              />
            </Field>
            <Field label="Responsável">
              <Input value={form.responsavel} onChange={(v) => onChange("responsavel", v)} placeholder="Pessoa de contato" />
            </Field>
            <Field label="Cargo">
              <Input value={form.cargo} onChange={(v) => onChange("cargo", v)} />
            </Field>
          </div>
        </Section>

        <Section title="Fiscal & Financeiro" subtitle="Preferências e limites" icon={<Landmark size={18} className="opacity-80" />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Field label="Condição de pagamento (padrão)" hint="Ex.: à vista, 28dd, 30/60">
              <Input value={form.condPgtoPadrao} onChange={(v) => onChange("condPgtoPadrao", v)} placeholder="28dd" />
            </Field>
            <Field label="Limite de crédito (R$)">
              <Input value={form.limiteCredito} onChange={(v) => onChange("limiteCredito", v)} placeholder="R$ 0,00" />
            </Field>
            <Field label="Vendedor padrão">
              <Input value={form.vendedorPadrao} onChange={(v) => onChange("vendedorPadrao", v)} />
            </Field>
            <Field label="Transporte padrão">
              <Select value={form.transportePadrao} onChange={(v) => onChange("transportePadrao", v)} options={["CIF", "FOB", "Retira"]} />
            </Field>
            <div className="md:col-span-3">
              <Field label="Observações" hint="Janelas de recebimento, preferências, anexos fiscais, etc.">
                <Textarea rows={3} value={form.observacoes} onChange={(v) => onChange("observacoes", v)} />
              </Field>
            </div>
          </div>
        </Section>

        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="text-sm opacity-80 flex items-center gap-2">
            <CheckCircle2 size={18} className="opacity-70" />
            Revise os campos obrigatórios para habilitar o salvamento.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setForm(initialForm)}
              className="px-4 py-2 rounded-lg border border-border bg-transparent text-sm hover:bg-muted transition"
            >
              Limpar
            </button>
            <button
              onClick={salvar}
              className="px-4 py-2 rounded-lg border  inline-flex items-center gap-2  border-emerald-500/40 text-emerald-600 text-sm hover:bg-emerald-500/10"

            >
              <Save className="w-4 h-4" /> Salvar Cliente
            </button>
          </div>
        </div>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-5 h-fit">


        <Section title="Checklist" subtitle="Campos essenciais" icon={<CheckCircle2 size={18} className="opacity-80" />}>
          <ul className="space-y-1.5 text-sm">
            {[
              { k: "cpfCnpj", label: "CPF/CNPJ" },
              { k: form.tipoPessoa === "PJ" ? "razaoSocial" : "nomePF", label: form.tipoPessoa === "PJ" ? "Razão social" : "Nome completo" },
              { k: "email", label: "E-mail" },
              { k: "telefone", label: "Telefone" },
              { k: "logradouro", label: "Endereço" },
              { k: "cidade", label: "Cidade" },
              { k: "uf", label: "UF" },
            ].map((it) => (
              <li key={it.label} className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${form[it.k as keyof ClienteForm] ? "bg-green-500" : "bg-amber-500"}`} />
                <span className="opacity-80">{it.label}</span>
              </li>
            ))}
          </ul>
        </Section>
      </aside>
    </div>
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

function compactAddress(f: ClienteForm) {
  const parts = [
    f.logradouro && `${f.logradouro}${f.numero ? ", " + f.numero : ""}`,
    f.bairro,
    f.cidade && `${f.cidade}${f.uf ? "/" + f.uf : ""}`,
    f.cep,
  ].filter(Boolean);
  return parts.join(" · ");
}