import React, { useState, useEffect, useRef } from 'react'
import { Orcamento } from '../../../../../../modules/orcamentos/domain/entities/Orcamento'
import { CNPJ } from '../../../../../../modules/@shared/domain/valueObjects/CNPJ'
import { Loader2, PlusCircle, Search, UserPlus, X, Check } from 'lucide-react'
import { useToastStore } from '../../../../store/toastStore'
import { useNavigate } from 'react-router-dom'

// Client interface from database
interface DatabaseClient {
  id: number
  razao_social: string
  nome_fantasia?: string
  cpf_cnpj: string
  email?: string
  telefone?: string
  cidade?: string
  uf?: string
  cep?: string
  logradouro?: string
  numero?: string
  bairro?: string
  created_at?: string
}

export default function StepDados({
  meta,
  setMeta
}: {
  meta: Orcamento
  setMeta: (v: Orcamento) => void
}) {
  const input =
    'px-3 py-2 rounded-lg border border-border bg-input text-fg text-sm outline-none  focus:ring-2 focus:ring-ring/40'

  const pushToast = useToastStore((s) => s.push)
  const navigate = useNavigate()

  // Search states
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<DatabaseClient[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedClient, setSelectedClient] = useState<DatabaseClient | null>(null)

  // Legacy CNPJ search states
  const [loadingCNPJ, setLoadingCNPJ] = useState(false)
  const [cnpjMsg, setCnpjMsg] = useState<string | null>(null)

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const onlyDigits = (v: string) => (v || '').replace(/[^0-9]/g, '')
  const formatCNPJ = (v: string) => {
    const d = onlyDigits(v).slice(0, 14)
    const p1 = d.slice(0, 2)
    const p2 = d.slice(2, 5)
    const p3 = d.slice(5, 8)
    const p4 = d.slice(8, 12)
    const p5 = d.slice(12, 14)
    let out = ''
    if (p1) out = p1
    if (p2) out += `.${p2}`
    if (p3) out += `.${p3}`
    if (p4) out += `/${p4}`
    if (p5) out += `-${p5}`
    return out
  }
  const formatCEP = (v: string) => {
    const d = (v || '').replace(/\D/g, '').slice(0, 8)
    if (!d) return ''
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5, 8)}` : d
  }

  const formatDateBR = (iso: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return d.toLocaleDateString('pt-BR')
  }

  // Debounced search function
  const searchClients = async (term: string) => {
    if (!term.trim() || term.length < 2) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    try {
      setIsSearching(true)
      const results = await window.api.clients.search(term)
      setSearchResults(results)
      setShowDropdown(results.length > 0)
    } catch (error) {
      console.error('Erro na busca:', error)
      setSearchResults([])
      setShowDropdown(false)
    } finally {
      setIsSearching(false)
    }
  }

  // Debounce effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        searchClients(searchTerm)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setSelectedClient(null)
    setCnpjMsg(null)

    // Clear meta if clearing search
    if (!value.trim()) {
      setMeta({
        ...meta,
        cliente: '',
        cnpj: undefined,
        clienteEndereco: '',
        clienteBairro: '',
        clienteCidade: '',
        clienteUF: '',
        clienteCEP: '',
        clienteAtividade: '',
        clienteAbertura: ''
      })
    }
  }

  // Handle client selection from dropdown
  const selectClient = (client: DatabaseClient) => {
    setSelectedClient(client)
    setSearchTerm(client.nome_fantasia || client.razao_social)
    setShowDropdown(false)

    // Format address
    const endereco = [client.logradouro, client.numero].filter(Boolean).join(', ')

    // Fill meta data
    setMeta({
      ...meta,
      cliente: client.nome_fantasia || client.razao_social,
      cnpj: new CNPJ(client.cpf_cnpj),
      clienteEndereco: endereco,
      clienteBairro: client.bairro || '',
      clienteCidade: client.cidade || '',
      clienteUF: client.uf || '',
      clienteCEP: client.cep ? formatCEP(client.cep) : '',
      clienteAtividade: '', // Not in database yet
      clienteAbertura: client.created_at ? formatDateBR(client.created_at) : ''
    })

    pushToast(`Cliente "${client.nome_fantasia || client.razao_social}" selecionado!`)
  }

  // Clear selection
  const clearSelection = () => {
    setSelectedClient(null)
    setSearchTerm('')
    setSearchResults([])
    setShowDropdown(false)
    setMeta({
      ...meta,
      cliente: '',
      cnpj: undefined,
      clienteEndereco: '',
      clienteBairro: '',
      clienteCidade: '',
      clienteUF: '',
      clienteCEP: '',
      clienteAtividade: '',
      clienteAbertura: ''
    })
  }
  const handleCNPJChange = (v: string) => {
    try {
      const formatted = formatCNPJ(v)
      setMeta({ ...meta, cnpj: new CNPJ(formatted) })
    } catch {
      setMeta({ ...meta, cnpj: undefined })
    }
    setCnpjMsg(null)
  }

  const fetchCNPJ = async () => {
    const raw = onlyDigits(meta.cnpj?.toString() || '')
    if (raw.length !== 14) {
      setCnpjMsg('CNPJ incompleto')
      return
    }

    try {
      setLoadingCNPJ(true)
      setCnpjMsg(null)

      // Search by CNPJ in backend
      const results = await window.api.clients.search(raw)
      const cliente = results.find((c) => onlyDigits(c.cpf_cnpj) === raw)

      if (cliente) {
        selectClient(cliente) // Use existing function
        setCnpjMsg(null)
      } else {
        setCnpjMsg('Cliente não encontrado. Cadastre um novo cliente.')
      }
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error)
      setCnpjMsg('Erro ao buscar cliente.')
    } finally {
      setLoadingCNPJ(false)
    }
  }

  const novoCliente = () => {
    navigate('/clientes/novo')
  }

  return (
    <section className="bg-bg border-border text-fg rounded-2xl border p-6">
      <h3 className="font-semibold mb-4 text-lg">Dados do Orçamento</h3>

      {/* Layout SEM GRID: blocos verticais com grupos flexíveis */}
      <div className="space-y-5">
        {/* Linha: Nome do orçamento */}
        <div className="flex flex-col">
          <label className="text-xs opacity-70 mb-1">Nome do Orçamento *</label>
          <input
            className={input}
            placeholder="Ex: Linha de Pintura - Setor A"
            value={meta.nome}
            onChange={(e) => setMeta({ ...meta, nome: e.target.value })}
          />
        </div>

        {/* Cliente Search with Dropdown */}
        <div className="flex flex-col gap-2 relative ">
          <label className="text-xs  opacity-70">Buscar Cliente</label>
          <div className="relative   ">
            <div className="flex justify-between gap-2">
              <div className="  relative flex-1 mr-2">
                <input
                  ref={searchInputRef}
                  className={`${input} flex-1 pr-8  w-full`}
                  placeholder="Digite o nome ou CNPJ do cliente..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) {
                      setShowDropdown(true)
                    }
                  }}
                />

                {/* Search loading icon */}
                {isSearching && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                )}

                {/* Clear button */}

                {/* Selected client indicator */}
                {selectedClient && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-emerald-600">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={novoCliente}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-emerald-500/40 text-emerald-600 text-sm hover:bg-emerald-500/10"
                title="Cadastrar novo cliente"
              >
                <UserPlus className="w-4 h-4" /> Novo
              </button>
            </div>

            {/* Dropdown Results */}
            {showDropdown && searchResults.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                {searchResults.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => selectClient(client)}
                    className="w-full px-3 py-3 text-left hover:bg-muted border-b border-border last:border-b-0 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-fg text-sm">
                          {client.nome_fantasia || client.razao_social}
                        </div>
                        {client.nome_fantasia && (
                          <div className="text-xs text-muted-foreground">{client.razao_social}</div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          CNPJ: {formatCNPJ(client.cpf_cnpj)}
                        </div>
                        {(client.cidade || client.uf) && (
                          <div className="text-xs text-muted-foreground">
                            {[client.cidade, client.uf].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No results message */}
            {showDropdown &&
              searchResults.length === 0 &&
              searchTerm.length >= 2 &&
              !isSearching && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-lg shadow-lg p-3"
                >
                  <div className="text-sm text-muted-foreground text-center">
                    Nenhum cliente encontrado para "{searchTerm}"
                  </div>
                  <div className="mt-2 text-center">
                    <button
                      type="button"
                      onClick={novoCliente}
                      className="text-xs text-emerald-600 hover:text-emerald-700 underline"
                    >
                      Cadastrar novo cliente
                    </button>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Legacy CNPJ Search (as fallback)
                <div className="flex flex-col gap-2">
                    <label className="text-xs opacity-70">CNPJ do Cliente (busca manual)</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input className={`${input} flex-1`} inputMode="numeric" placeholder="00.000.000/0000-00" value={meta.cnpj || ""} onChange={(e) => handleCNPJChange(e.target.value)} />
                        <button type="button" onClick={fetchCNPJ} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border text-fg text-sm hover:bg-muted" title="Buscar cliente cadastrado">
                            {loadingCNPJ ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Buscar
                        </button>
                    </div>
                    {cnpjMsg && (
                        <div className="mt-1 flex items-start gap-2">
                            <p className="text-xs text-red-500">{cnpjMsg}</p>
                            {cnpjMsg.includes("não encontrado") && (
                                <button
                                    type="button"
                                    onClick={novoCliente}
                                    className="text-xs text-emerald-600 hover:text-emerald-700 underline"
                                >
                                    Cadastrar agora
                                </button>
                            )}
                        </div>
                    )}
                </div> */}

        <div className="flex flex-col gap-3">
          <p className="text-xs opacity-70">
            Dados do Cliente (preenchidos automaticamente pelo CNPJ)
          </p>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex flex-col">
              <label className="text-xs opacity-70 mb-1">Nome</label>
              <input
                className={`${input} pointer-events-none opacity-75`}
                readOnly
                value={meta.cliente || ''}
                placeholder="—"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <label className="text-xs opacity-70 mb-1">Endereço</label>
              <input
                className={`${input} pointer-events-none opacity-75`}
                readOnly
                value={meta.clienteEndereco || ''}
                placeholder="—"
              />
            </div>
            <div className="w-full md:w-56 flex flex-col">
              <label className="text-xs opacity-70 mb-1">Bairro</label>
              <input
                className={`${input} pointer-events-none opacity-75`}
                readOnly
                value={meta.clienteBairro || ''}
                placeholder="—"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex flex-col">
              <label className="text-xs opacity-70 mb-1">Cidade</label>
              <input
                className={`${input} pointer-events-none opacity-75`}
                readOnly
                value={meta.clienteCidade || ''}
                placeholder="—"
              />
            </div>
            <div className="w-full md:w-24 flex flex-col">
              <label className="text-xs opacity-70 mb-1">UF</label>
              <input
                className={`${input} pointer-events-none opacity-75 text-center`}
                readOnly
                value={meta.clienteUF || ''}
                placeholder="—"
              />
            </div>
            <div className="w-full md:w-40 flex flex-col">
              <label className="text-xs opacity-70 mb-1">CEP</label>
              <input
                className={`${input} pointer-events-none opacity-75`}
                readOnly
                value={meta.clienteCEP || ''}
                placeholder="—"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex flex-col">
              <label className="text-xs opacity-70 mb-1">Atividade Principal (CNAE)</label>
              <input
                className={`${input} pointer-events-none opacity-75`}
                readOnly
                value={meta.clienteAtividade || ''}
                placeholder="—"
              />
            </div>
            <div className="w-full md:w-52 flex flex-col">
              <label className="text-xs opacity-70 mb-1">Início de Atividade</label>
              <input
                className={`${input} pointer-events-none opacity-75`}
                readOnly
                value={meta.clienteAbertura || ''}
                placeholder="—"
              />
            </div>
          </div>
        </div>

        {/* Linha: Responsável / Datas */}
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex-1 flex flex-col">
            <label className="text-xs opacity-70 mb-1">Responsável</label>
            <input
              className={input}
              placeholder="Nome do responsável"
              value={meta.responsavel}
              onChange={(e) => setMeta({ ...meta, responsavel: e.target.value })}
            />
          </div>
          <div className="flex-1 flex flex-col">
            <label className="text-xs opacity-70 mb-1">Data de Início</label>
            <input
              type="date"
              className={input}
              value={meta.dataInicio}
              onChange={(e) => setMeta({ ...meta, dataInicio: e.target.value })}
            />
          </div>
          <div className="flex-1 flex flex-col">
            <label className="text-xs opacity-70 mb-1">Previsão de Entrega</label>
            <input
              type="date"
              className={input}
              value={meta.previsaoEntrega}
              onChange={(e) => setMeta({ ...meta, previsaoEntrega: e.target.value })}
            />
          </div>
        </div>

        {/* Linha: Descrição */}
        <div className="flex flex-col">
          <label className="text-xs opacity-70 mb-1">Descrição / Escopo do Orçamento</label>
          <textarea
            rows={3}
            className={input}
            placeholder="Detalhes sobre o projeto, ambiente, requisitos técnicos, etc."
            value={meta.descricao}
            onChange={(e) => setMeta({ ...meta, descricao: e.target.value })}
          />
        </div>
      </div>
    </section>
  )
}
