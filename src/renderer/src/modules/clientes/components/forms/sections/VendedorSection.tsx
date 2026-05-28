import { useEffect, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { ClienteFormData } from '../../../schemas/clienteSchema'
import { Section, Field, Input, Select, SelectItem, Textarea } from '../../../../../shared/components/ui'
import { Briefcase } from 'lucide-react'

interface VendedorSectionProps {
  form: UseFormReturn<ClienteFormData>
}

interface Seller {
  id: number
  nome: string
  ativo: boolean
}

export function VendedorSection({ form }: VendedorSectionProps) {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSellers()
  }, [])

  const loadSellers = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      if (!token) return

      const data = await window.api.sellers.getActive(token)
      setSellers(data)
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Section
      title="Informações Comerciais"
      subtitle="Configurações comerciais e vendedor responsável"
      icon={<Briefcase size={18} className="opacity-80" />}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Condição de Pagamento Padrão">
            <Input
              placeholder="Ex: 30/60/90"
              {...form.register('condPgtoPadrao')}
            />
          </Field>

          <Field label="Limite de Crédito (R$)">
            <Input
              type="number"
              placeholder="0.00"
              step="0.01"
              {...form.register('limiteCredito')}
            />
          </Field>

          <Field label="Vendedor Padrão">
            <Select
              {...form.register('vendedorPadraoId', { valueAsNumber: true })}
              disabled={loading}
            >
              <option value="">Selecione um vendedor</option>
              {sellers.map((seller) => (
                <SelectItem key={seller.id} value={seller.id.toString()}>
                  {seller.nome}
                </SelectItem>
              ))}
            </Select>
          </Field>

          <Field label="Transporte Padrão">
            <Select {...form.register('transportePadrao')}>
              <SelectItem value="CIF">CIF - Custo, Seguro e Frete</SelectItem>
              <SelectItem value="FOB">FOB - Free On Board</SelectItem>
            </Select>
          </Field>
        </div>

        <Field label="Observações" hint="Observações adicionais sobre o cliente">
          <Textarea
            {...form.register('observacoes')}
            rows={4}
            placeholder="Digite observações adicionais..."
          />
        </Field>
      </div>
    </Section>
  )
}
