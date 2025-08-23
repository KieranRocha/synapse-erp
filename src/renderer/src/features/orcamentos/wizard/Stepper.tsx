import React from "react";
import { Check } from "lucide-react";
import { STEPS } from "../types";

export default function Stepper({ step, setStep, isDark }: { step: number; setStep: (n: number) => void; isDark: boolean }) {
    return (
        <div className="mb-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {STEPS.map((s, idx) => {
                    const active = idx === step;
                    const done = idx < step;
                    return (
                        <div key={s.key} className="flex items-center">
                            <button onClick={() => setStep(idx)} className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition ${active ? (isDark ? "border-blue-500/60 bg-blue-500/10 text-blue-300" : "border-blue-500/40 bg-blue-50 text-blue-700") : done ? (isDark ? "border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10" : "border-emerald-500/30 text-emerald-700 hover:bg-emerald-50") : isDark ? "border-neutral-700/50 text-neutral-300 hover:bg-neutral-800" : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"}`} title={s.label}>
                                <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${done ? (isDark ? "border-emerald-500/50 bg-emerald-500/20" : "border-emerald-500/50 bg-emerald-50") : active ? (isDark ? "border-blue-500/70 bg-blue-500/10" : "border-blue-500/50 bg-blue-50") : isDark ? "border-neutral-600" : "border-neutral-300"}`}>
                                    {done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                                </span>
                                <span className="whitespace-nowrap">{s.label}</span>
                            </button>
                            {idx < STEPS.length - 1 && <div className={`mx-2 h-px w-8 sm:w-12 ${isDark ? "bg-neutral-700/60" : "bg-neutral-300/70"}`} />}
                        </div>
                    );
                })}
            </div>
            <div className={`mt-2 h-1 rounded-full ${isDark ? "bg-neutral-800" : "bg-neutral-200"}`}>
                <div className="h-full rounded-full transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%`, background: isDark ? "rgb(59 130 246 / 0.6)" : "rgb(59 130 246 / 0.8)" }} />
            </div>
        </div>
    );
}
