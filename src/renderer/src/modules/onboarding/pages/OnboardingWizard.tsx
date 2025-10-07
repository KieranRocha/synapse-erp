import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/Button';
import { OnboardingStepper } from '../components/OnboardingStepper';
import { StepEmpresa } from '../components/steps/StepEmpresa';
import { StepAdmin } from '../components/steps/StepAdmin';
import { StepUsuarios } from '../components/steps/StepUsuarios';
import { StepFinanceiro } from '../components/steps/StepFinanceiro';
import { StepRevisao } from '../components/steps/StepRevisao';
import { useOnboarding, ONBOARDING_STEPS } from '../hooks/useOnboarding';
import { useToastStore } from '../../../shared/hooks/useToast';
import StepBoasVindas from '../components/steps/StepBoasVindas';

export function OnboardingWizard() {
  const navigate = useNavigate();
  const pushToast = useToastStore();

  const {
    currentStep,
    setCurrentStep,
    formData,
    updateStepData,
    nextStep,
    prevStep,
    submitOnboarding,
    isSubmitting,
    canGoNext,
    canGoPrev,
    isLastStep
  } = useOnboarding();

  const handleSubmit = async () => {
    try {
      const result = await submitOnboarding();

      pushToast('Onboarding concluído com sucesso! Bem-vindo ao sistema!');

      // Redirecionar para login
      navigate('/auth/login');

    } catch (error) {
      console.error('Erro no onboarding:', error);

      const errorMessage = error instanceof Error
        ? error.message
        : 'Erro inesperado ao finalizar onboarding. Tente novamente.';

      pushToast(errorMessage);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <StepBoasVindas />;
      case 1:
        return (
          <StepEmpresa
            data={formData.empresa}
            onChange={(data) => updateStepData('empresa', data)}
          />
        );
      case 2:
        return (
          <StepAdmin
            data={formData.admin}
            onChange={(data) => updateStepData('admin', data)}
          />
        );
      case 3:
        return (
          <StepUsuarios
            data={{ ...formData.outrosUsuarios, admin: formData.admin }}
            onChange={(data) => {
              updateStepData('outrosUsuarios', { usuarios: data.usuarios });
            }}
          />
        );
      case 4:
        return (
          <StepFinanceiro
            data={formData.financeiro}
            onChange={(data) => updateStepData('financeiro', data)}
          />
        );
      case 5:
        return <StepRevisao data={formData} />;
      default:
        return null;
    }
  };

  const handleCancel = () => {
    if (window.confirm('Tem certeza que deseja cancelar o onboarding? Você será redirecionado para a tela de login.')) {
      navigate('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-4xl mx-auto py-6">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <h1 className="text-2xl font-bold text-fg mb-2">
            Configuração Inicial
          </h1>
          <p className="text-text">
            Configure sua empresa e usuários para começar a usar o ERP Synapse
          </p>

        </div>

        {/* Stepper */}
        <OnboardingStepper
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}

        />

        {/* Current Step */}
        {renderCurrentStep()}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <div className="flex items-center gap-3">
            <Button
              variant='danger'
              onClick={handleCancel}
              className=" right-0 text-sm  hover:text-fg "
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={!canGoPrev || isSubmitting}
            >
              Voltar
            </Button>

          </div>


          <div className="flex items-center gap-3">
            <span className="text-sm text-text">
              Passo {currentStep + 1} de {ONBOARDING_STEPS.length}
            </span>

            {isLastStep ? (
              <Button
                onClick={handleSubmit}
                disabled={!canGoNext || isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? 'Finalizando...' : 'Finalizar'}
              </Button>
            ) : (
              <Button
                variant={!canGoNext ? 'danger' : 'success'}
                onClick={nextStep}
                disabled={!canGoNext || isSubmitting}
              >
                Próximo
              </Button>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        {isSubmitting && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-text">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Criando sua empresa e usuários...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}