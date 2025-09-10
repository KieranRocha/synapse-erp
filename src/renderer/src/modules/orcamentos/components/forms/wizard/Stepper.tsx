import React from "react";
import { Check } from "lucide-react";
import { STEPS } from "../../../utils/types";

export default function Stepper({ step, setStep }: { step: number; setStep: (n: number) => void }) {
    return (
        <div className="mb-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {STEPS.map((s, idx) => {
                    const active = idx === step;
                    const done = idx < step;
                    return (
                        <div key={s.key} className="flex items-center">
                            <button onClick={() => setStep(idx)} className={`cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition ${active ? "badge-analise" : done ? "border-emerald-500/30 badge-aprovado hover:bg-emerald-500/10" : "border-border text-fg hover:bg-muted"}`} title={s.label}>
                                <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${done ? "border-emerald-500/50 bg-emerald-500/20" : active ? "border-primary/50 bg-primary/10" : "border-border"}`}>
                                    {done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                                </span>
                                <span className="whitespace-nowrap">{s.label}</span>
                            </button>
                            {idx < STEPS.length - 1 && <div className="mx-2 h-px w-8 sm:w-12 bg-border/60" />}
                        </div>
                    );
                })}
            </div>
            <div className="mt-2 h-1 rounded-full bg-muted">
                <div className="h-full rounded-full bg-fg transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
            </div>
        </div>
    );
}
