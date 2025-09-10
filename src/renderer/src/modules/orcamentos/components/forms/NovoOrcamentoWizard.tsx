import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { useToastStore } from "../../../../shared/hooks/useToast";
import { computeTotals } from "../../utils/utils";
import type { Item, Fin, Meta } from "../../utils/types";
import Stepper from "./wizard/Stepper";
import SummaryMini from "./wizard/SummaryMini";
import StepDados from "./wizard/steps/StepDados";
import StepItens from "./wizard/steps/StepItens";
import StepFinanceiro from "./wizard/steps/StepFinanceiro";
import StepRevisao from "./wizard/steps/StepRevisao";
import { STEPS } from "../../utils/types";
import StepPrecoEMargem from "./wizard/steps/StepPrecoEMargem";
import { useNavigate } from "react-router-dom";

export default function NovoOrcamentoWizard() {
  const pushToast = useToastStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [meta, setMeta] = useState<Meta>({
    numero: `ORC-${Date.now()}`,
    nome: "",
    cliente: "",
    clienteId: undefined,
    cnpj: "",
    responsavel: "",
    dataInicio: "",
    previsaoEntrega: "",
    descricao: "",
    clienteEndereco: "",
    clienteBairro: "",
    clienteCidade: "",
    clienteUF: "",
    clienteCEP: "",
    clienteAtividade: "",
    clienteAbertura: "",
  });
  const [items, setItems] = useState<Item[]>([]);
  const [fin, setFin] = useState<Fin>({
    regime: "SN",
    tipoOperacao: "MERCADORIA",
    cfop: "",
    naturezaOperacao: "",
    ncm: "",
    cest: "",
    nbs: "",
    descontoPct: 0,
    descontoValor: 0,
    frete: 0,
    seguro: 0,
    outrosCustos: 0,
    compoeBaseICMS: true,
    compoeBasePisCofins: true,
    compoeBaseIPI: false,
    csosn: "",
    cst: "",
    origemMercadoria: "",
    icmsAliq: 0,
    icmsRedBasePct: 0,
    icmsStMva: 0,
    icmsStAliq: 0,
    fcpAliq: 0,
    fcpStAliq: 0,
    difalAliqInter: 0,
    difalAliqInterna: 0,
    difalPartilhaDestinoPct: 0,
    ipiCst: "",
    ipiAliq: 0,
    pisCst: "",
    pisAliq: 0,
    cofinsCst: "",
    cofinsAliq: 0,
    municipioIncidencia: "",
    issAliq: 0,
    issRetido: false,
    irrfAliq: 0,
    inssAliq: 0,
    csllAliq: 0,
    pisRetAliq: 0,
    cofinsRetAliq: 0,
  });

  const totals = useMemo(() => computeTotals({ items, ...fin }), [items, fin]);

  const validateStep = (idx: number): boolean => {
    if (idx === 0) {
      const errs: string[] = [];
      if (!meta.numero.trim()) errs.push("Número do orçamento");
      if (!meta.nome.trim()) errs.push("Nome do orçamento");
      if (!meta.cliente.trim()) errs.push("Cliente");
      if (errs.length) {
        pushToast(`Preencha: ${errs.join(", ")}.`);
        return false;
      }
    }
    if (idx === 1) {
      if (items.length === 0) {
        pushToast("Adicione pelo menos um item.");
        return false;
      }
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSave = async () => {
    if (!validateStep(0) || !validateStep(1)) return;
    try {
      // Filtra itens vazios antes de enviar (evita ZodError no backend)
      const itemsToSend = items
        .map((i) => ({
          ...i,
          nome: (i.nome || '').trim(),
          un: (i.un || '').trim(),
          categoria: (i.categoria || '').trim(),
        }))
        .filter((i) => i.nome.length > 0 && i.un.length > 0);

      if (itemsToSend.length === 0) {
        pushToast('Adicione pelo menos um item com descrição e unidade.');
        return;
      }

      const payload = {
        meta: {
          numero: meta.numero,
          nome: meta.nome,
          clienteId: (meta as any).clienteId,
          responsavel: meta.responsavel,
          dataInicio: meta.dataInicio || undefined,
          previsaoEntrega: meta.previsaoEntrega || undefined,
          descricao: meta.descricao || undefined,
          precoSugerido: (meta as any).precoSugerido,
          precoAprovado: (meta as any).precoAprovado,
        },
        items: itemsToSend.map((i) => ({
          nome: i.nome,
          un: i.un,
          qtd: i.qtd,
          preco: i.preco,
          categoria: i.categoria,
        })),
        fin: {
          ...fin,
        },
      } as any;
      await window.api.budgets.create(payload);
      pushToast("Orçamento salvo com sucesso!");
      navigate("/vendas/orcamentos");
    } catch (err) {
      console.error(err);
      pushToast("Falha ao salvar orçamento");
    }
  };

  return (
    <div className="">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)] max-w-7xl mx-auto p-8 gap-6">
        <div>
          <Stepper step={step} setStep={setStep} />
          <div className="space-y-6 min-h-[100dvh] pb-24">
            {step === 0 && <StepDados meta={meta} setMeta={setMeta} />}
            {step === 1 && <StepItens items={items} setItems={setItems} />}
            {step === 2 && <StepFinanceiro fin={fin} setFin={setFin} />}
            {step === 3 && <StepPrecoEMargem items={items} fin={fin} meta={meta} setMeta={setMeta} />}
            {step === 4 && <StepRevisao items={items} fin={fin} />}
          </div>
        </div>

        <div className="hidden  lg:block">
          <SummaryMini items={items} fin={fin} />
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 inset-x-0 z-50 backdrop-blur border-t bg-card/70 border-border">
        <div className=" mx-auto px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Resumo */}
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border border-border text-fg">
              <span className="opacity-70">Subtotal:</span>
              <b>{totals.subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</b>
            </span>

            <span className={`hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border border-border text-fg`}>
              <span className="opacity-70">Descontos:</span>
              <span className="opacity-90">
                {totals.descontoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
              <span className="opacity-60">
                ({Number(fin.descontoPct).toFixed(2)}% + {fin.descontoValor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})
              </span>
            </span>

            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border border-border text-fg">
              <span className="opacity-70">Total:</span>
              <b className="text-emerald-600">
                {totals.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </b>
            </span>
          </div>

          {/* Navegação + Ações */}
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={step === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-fg text-sm transition hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              title="Voltar"
            >
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>

            {/* Salvar rascunho (futuro) */}
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border badge-vencido text-sm transition hover:bg-amber-500/10"
              title="Salvar rascunho"
              type="button"
            >
              Salvar rascunho
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={goNext}
                className="inline-flex items-center badge-analise gap-2 px-4 py-2 rounded-lg border   text-sm transition hover:bg-primary/10"
                title="Avançar"
              >
                Avançar <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-500/40 text-emerald-600 text-sm transition hover:bg-emerald-500/10"
                title="Salvar orçamento"
              >
                <Save className="w-4 h-4" /> Salvar orçamento
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
