import { useState } from 'react'
import {
  OnboardingFormData,
  onboardingCompleteSchema,
  empresaSchema,
  adminSchema,
  usuarioSchema,
  outrosUsuariosSchema,
  financeiroSchema
} from '../schemas/onboardingSchema'
import { CreateTenantResponse } from '../types/onboardingTypes'

export const ONBOARDING_STEPS = [
  { key: 'boasVindas', label: 'Boas vindas' },
  { key: 'empresa', label: 'Empresa' },
  { key: 'admin', label: 'Administrador' },
  { key: 'usuarios', label: 'Usuários' },
  { key: 'financeiro', label: 'Financeiro' },
  { key: 'revisao', label: 'Revisão' }
] as const

export function useOnboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<OnboardingFormData>({
    empresa: {
      razaoSocial: '',
      nomeFantasia: '',
      cnpj: '',
      ie: '',
      im: '',
      email: '',
      telefone: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      municipioIbge: '',
      uf: '',
      cep: '',
      timezone: 'America/Sao_Paulo',
      moeda: 'BRL'
    },
    admin: {
      nome: '',
      email: '',
      senha: '',
      cargo: 'Administrador'
    },
    outrosUsuarios: {
      usuarios: []
    },
    financeiro: {
      regimeTributario: 'SIMPLES' as const,
      numeroRegistroMei: '',
      anexoSimples: 'I' as const,
      faturamentoAnual: '',
      contadorResponsavel: '',
      crcContador: '',
      emailContador: '',
      telefoneContador: '',
      utilizaEstoque: true,
      controlaFluxoCaixa: true,
      emiteNFe: false,
      emiteNFSe: false
    }
  })

  const updateStepData = <T extends keyof OnboardingFormData>(
    step: T,
    data: Partial<OnboardingFormData[T]>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [step]: { ...prev[step], ...data }
    }))
  }

  const validateCurrentStep = () => {
    const step = ONBOARDING_STEPS[currentStep].key

    try {
      switch (step) {
        case 'boasVindas':
          return true
        case 'empresa':
          return empresaSchema.safeParse(formData.empresa).success
        case 'admin':
          return adminSchema.safeParse(formData.admin).success
        case 'usuarios':
          // Valida apenas os outros usuários que estão completos (não vazios)
          const otherUsersValid = formData.outrosUsuarios.usuarios.every(user => {
            // Se o usuário tem nome ou email preenchido, deve ser válido
            if (user.nome || user.email) {
              return usuarioSchema.safeParse(user).success
            }
            // Usuários vazios são permitidos (podem ser removidos)
            return true
          })
          return otherUsersValid
        case 'financeiro':
          return financeiroSchema.safeParse(formData.financeiro).success
        case 'revisao':
          return onboardingCompleteSchema.safeParse(formData).success
        default:
          return false
      }
    } catch {
      return false
    }
  }

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1 && validateCurrentStep()) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const goToStep = (step: number) => {
    if (step >= 0 && step < ONBOARDING_STEPS.length) {
      setCurrentStep(step)
    }
  }

  const submitOnboarding = async (): Promise<CreateTenantResponse> => {
    try {
      setIsSubmitting(true)

      // Validar dados completos
      const validatedData = onboardingCompleteSchema.parse(formData)

      // Chamar API do Electron
      const result: CreateTenantResponse = await window.electronAPI.invoke(
        'createTenantWithOnboarding',
        validatedData
      )

      if (result.success) {
        return result
      } else {
        throw new Error(result.error || 'Erro ao criar tenant')
      }
    } catch (error) {
      console.error('Erro no onboarding:', error)

      if (error instanceof Error) {
        throw error
      } else {
        throw new Error('Erro inesperado durante o onboarding')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    currentStep,
    setCurrentStep: goToStep,
    formData,
    updateStepData,
    validateCurrentStep,
    nextStep,
    prevStep,
    submitOnboarding,
    isSubmitting,
    canGoNext: validateCurrentStep(),
    canGoPrev: currentStep > 0,
    isLastStep: currentStep === ONBOARDING_STEPS.length - 1
  }
}
