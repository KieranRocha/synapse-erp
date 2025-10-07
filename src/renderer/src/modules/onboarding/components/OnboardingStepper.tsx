import React from "react";
import { Check } from "lucide-react";
import { ONBOARDING_STEPS } from "../hooks/useOnboarding";

interface OnboardingStepperProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export function OnboardingStepper({ currentStep, setCurrentStep }: OnboardingStepperProps) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {ONBOARDING_STEPS.map((step, idx) => {
          const active = idx === currentStep;
          const done = idx < currentStep;

          return (
            <div key={step.key} className="flex items-center">
              <button
                onClick={() => setCurrentStep(idx)}
                className={`cursor-pointer inline-flex items-center justify-center gap-2 w-30 px-3 py-2 rounded-lg border text-sm transition ${active
                  ? "badge-analise"
                  : done
                    ? "border-emerald-500/30 badge-aprovado hover:bg-emerald-500/10"
                    : "border-border text-fg hover:bg-muted"
                  }`}
                title={step.label}
              >

                <span className="whitespace-nowrap">{step.label}</span>
              </button>
              {idx < ONBOARDING_STEPS.length - 1 && (
                <div className="mx-2 h-px w-8  bg-border/60" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-2 h-1 rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-fg transition-all"
          style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}