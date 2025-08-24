import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { useUIStore } from "../../store/uiStore"; // ajuste o caminho conforme seu projeto
import { useToastStore } from "../../store/toastStore";
import { computeTotals } from "./utils";
import type { Item, Fin, Meta } from "./types";
import Stepper from "./wizard/Stepper";
import SummaryMini from "./wizard/SummaryMini";
import StepDados from "./wizard/steps/StepDados";
import StepItens from "./wizard/steps/StepItens";
import StepFinanceiro from "./wizard/steps/StepFinanceiro";
import StepRevisao from "./wizard/steps/StepRevisao";
import { STEPS } from "./types";
import StepPrecoEMargem from "./wizard/steps/StepPrecoEMargem";

export default function NovoOrcamentoWizard() {
    const { isDark } = useUIStore();
    const pushToast = useToastStore((s: any) => s.push);

    const [step, setStep] = useState(0);
    const [meta, setMeta] = useState<Meta>({
        nome: "",
        cliente: "",
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
    }); const [items, setItems] = useState<Item[]>([]);
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
            const errs = [] as string[];
            if (!meta.nome.trim()) errs.push("Nome do orçamento");
            if (!meta.cliente.trim()) errs.push("Cliente");
            if (errs.length) { pushToast(`Preencha: ${errs.join(", ")}.`); return false; }
        }
        if (idx === 1) {
            if (items.length === 0) { pushToast("Adicione pelo menos um item."); return false; }
        }
        return true;
    };

    const goNext = () => { if (!validateStep(step)) return; setStep((s) => Math.min(s + 1, STEPS.length - 1)); };
    const goPrev = () => setStep((s) => Math.max(s - 1, 0));
    const onSave = () => { if (!validateStep(0) || !validateStep(1)) return; pushToast("Orçamento salvo (mock)"); };

    return (
        <div className="">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)] max-w-7xl mx-auto p-8 gap-6">
                <div>
                    <Stepper step={step} setStep={setStep} isDark={isDark} />
                    <div className="space-y-6 min-h-[100dvh] pb-24">
                        {step === 0 && <StepDados meta={meta} setMeta={setMeta} isDark={isDark} />}
                        {step === 1 && <StepItens items={items} setItems={setItems} isDark={isDark} />}
                        {step === 2 && <StepFinanceiro fin={fin} setFin={setFin} isDark={isDark} />}
                        {step === 3 && <StepPrecoEMargem items={items} fin={fin} isDark={isDark} meta={meta} setMeta={setMeta} />}

                        {step === 4 && <StepRevisao items={items} fin={fin} isDark={isDark} />}
                    </div>



                </div>

                <div className="hidden  lg:block">
                    <SummaryMini items={items} fin={fin} isDark={isDark} />
                </div>

            </div>
            {/* Sticky action bar: resumo + navegação (tudo em linha) */}
            <div className={`sticky bottom-0 inset-x-0 z-50 backdrop-blur border-t ${isDark ? "bg-neutral-950/60 border-neutral-800" : "bg-white/70 border-neutral-200"
                }`}>
                <div className=" mx-auto px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
                    {/* Resumo inline (Subtotal | Descontos | Total) */}
                    <div className="flex items-center gap-3 text-xs sm:text-sm">
                        <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border ${isDark ? "border-neutral-700/50 text-neutral-200" : "border-neutral-300 text-neutral-700"
                            }`}>
                            <span className="opacity-70">Subtotal:</span>
                            <b>{totals.subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</b>
                        </span>

                        <span className={`hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border ${isDark ? "border-neutral-700/50 text-neutral-200" : "border-neutral-300 text-neutral-700"
                            }`}>
                            <span className="opacity-70">Descontos:</span>
                            <span className="opacity-90">
                                {totals.descontoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </span>
                            <span className="opacity-60">
                                ({Number(fin.descontoPct).toFixed(2)}% + {fin.descontoValor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})
                            </span>
                        </span>

                        <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border ${isDark ? "border-neutral-700/50 text-neutral-200" : "border-neutral-300 text-neutral-700"
                            }`}>
                            <span className="opacity-70">Total:</span>
                            <b className={`${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
                                {totals.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </b>
                        </span>
                    </div>

                    {/* Navegação + Ações */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={goPrev}
                            disabled={step === 0}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? "border-neutral-700/50 text-neutral-200 hover:bg-neutral-800" : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                                }`}
                            title="Voltar"
                        >
                            <ChevronLeft className="w-4 h-4" /> Voltar
                        </button>

                        {/* Salvar rascunho */}
                        <button

                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition ${isDark ? "border-amber-500/40 text-amber-300 hover:bg-amber-500/10" : "border-amber-500/40 text-amber-700 hover:bg-amber-50"
                                }`}
                            title="Salvar rascunho"
                            type="button"
                        >
                            Salvar rascunho
                        </button>

                        {step < STEPS.length - 1 ? (
                            <button
                                onClick={goNext}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition ${isDark ? "border-blue-500/40 text-blue-300 hover:bg-blue-500/10" : "border-blue-500/40 text-blue-700 hover:bg-blue-50"
                                    }`}
                                title="Avançar"
                            >
                                Avançar <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={onSave}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition ${isDark ? "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10" : "border-emerald-500/40 text-emerald-700 hover:bg-emerald-50"
                                    }`}
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