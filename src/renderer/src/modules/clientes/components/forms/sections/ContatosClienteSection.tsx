import { useState, useEffect } from 'react'
import { Button } from '../../../../../shared/components/ui'
import { Trash2, Plus, Star, Phone } from 'lucide-react'
import { CARGOS } from '../../../../../shared/constants/cargos'
import { Section, Field, Input, Select, SelectItem } from '../../../../../shared/components/ui'

interface Contact {
  id?: number
  nome: string
  cargo: string
  email: string
  telefone: string
  celular: string
  principal: boolean
  ativo: boolean
  observacoes: string
}

interface ContatosClienteSectionProps {
  clientId?: number
  onContactsChange?: (contacts: Contact[]) => void
}

const emptyContact: Contact = {
  nome: '',
  cargo: '',
  email: '',
  telefone: '',
  celular: '',
  principal: true,
  ativo: true,
  observacoes: ''
}

export function ContatosClienteSection({ clientId, onContactsChange }: ContatosClienteSectionProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [currentContact, setCurrentContact] = useState<Contact>(emptyContact)

  useEffect(() => {
    onContactsChange?.(contacts)
  }, [contacts])

  const handleAddCurrentContact = () => {
    if (!currentContact.nome || !currentContact.cargo || !currentContact.email || !currentContact.telefone) {
      return
    }

    const newContact = { ...currentContact, id: Date.now() }

    if (newContact.principal) {
      setContacts(prev => [...prev.map(c => ({ ...c, principal: false })), newContact])
    } else {
      setContacts(prev => [...prev, newContact])
    }

    setCurrentContact({ ...emptyContact, principal: contacts.length === 0 })
  }

  const handleAddNewContact = () => {
    handleAddCurrentContact()
  }

  const handleDeleteContact = (id: number) => {
    setContacts(prev => prev.filter(c => c.id !== id))
  }

  const handleSetPrimary = (id: number) => {
    setContacts(prev => prev.map(c => ({ ...c, principal: c.id === id })))
    setCurrentContact(prev => ({ ...prev, principal: false }))
  }

  return (
    <Section
      title="Contatos"
      subtitle="Adicione contatos da empresa"
      icon={<Phone size={18} className="opacity-80" />}
      action={
        <button
          type="button"
          onClick={handleAddNewContact}
          className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition inline-flex items-center gap-2 text-sm"
        >
          <Plus size={16} />
          Adicionar Contato
        </button>
      }
    >
      <div className="space-y-4">
        {/* Saved Contacts List */}
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="border border-border rounded-lg p-4 bg-bg"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{contact.nome}</h4>
                  {contact.principal && (
                    <span className="flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-600 px-2 py-0.5 rounded">
                      <Star size={12} fill="currentColor" />
                      Principal
                    </span>
                  )}
                </div>
                <p className="text-sm opacity-70">
                  {CARGOS.find(c => c.value === contact.cargo)?.label || contact.cargo}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                  <div>
                    <span className="opacity-70">Email:</span> {contact.email}
                  </div>
                  <div>
                    <span className="opacity-70">Telefone:</span> {contact.telefone}
                  </div>
                  {contact.celular && (
                    <div>
                      <span className="opacity-70">Celular:</span> {contact.celular}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {!contact.principal && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(contact.id!)}
                    className="p-1.5 rounded hover:bg-yellow-500/10 text-yellow-600 transition"
                    title="Definir como principal"
                  >
                    <Star size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteContact(contact.id!)}
                  className="p-1.5 rounded hover:bg-red-500/10 text-red-500 transition"
                  title="Remover contato"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Current Contact Form */}
        <div className="border border-border rounded-lg p-4 bg-bg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nome *">
              <Input
                value={currentContact.nome}
                onChange={(e) => setCurrentContact({ ...currentContact, nome: e.target.value })}
                placeholder="Nome completo"
              />
            </Field>

            <Field label="Cargo *">
              <Select
                value={currentContact.cargo}
                onChange={(e) => setCurrentContact({ ...currentContact, cargo: e.target.value })}
              >
                <option value="">Selecione um cargo</option>
                {CARGOS.map((cargo) => (
                  <SelectItem key={cargo.value} value={cargo.value}>
                    {cargo.label}
                  </SelectItem>
                ))}
              </Select>
            </Field>

            <Field label="Email *">
              <Input
                type="email"
                value={currentContact.email}
                onChange={(e) => setCurrentContact({ ...currentContact, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </Field>

            <Field label="Telefone *">
              <Input
                type="tel"
                value={currentContact.telefone}
                onChange={(e) => setCurrentContact({ ...currentContact, telefone: e.target.value })}
                placeholder="(00) 0000-0000"
              />
            </Field>

            <Field label="Celular">
              <Input
                type="tel"
                value={currentContact.celular}
                onChange={(e) => setCurrentContact({ ...currentContact, celular: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </Field>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentContact.principal}
                  onChange={(e) => setCurrentContact({ ...currentContact, principal: e.target.checked })}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm">Contato Principal</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
