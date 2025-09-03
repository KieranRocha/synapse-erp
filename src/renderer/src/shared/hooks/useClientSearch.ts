import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from './useDebounce';

export interface DatabaseClient {
  id: number;
  razao_social: string;
  nome_fantasia?: string;
  cpf_cnpj: string;
  email?: string;
  telefone?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  created_at?: string;
}

export interface UseClientSearchReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: DatabaseClient[];
  isSearching: boolean;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  selectedClient: DatabaseClient | null;
  setSelectedClient: (client: DatabaseClient | null) => void;
  selectClient: (client: DatabaseClient) => void;
  clearSelection: () => void;
}

/**
 * Hook personalizado para busca de clientes
 */
export function useClientSearch(): UseClientSearchReturn {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<DatabaseClient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState<DatabaseClient | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Função para buscar clientes
  const searchClients = useCallback(async (term: string) => {
    if (!term.trim() || term.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    try {
      setIsSearching(true);
      const results = await window.api.clients.search(term);
      setSearchResults(results);
      setShowDropdown(results.length > 0);
    } catch (error) {
      console.error('Erro na busca:', error);
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Effect para executar a busca quando o termo debounced mudar
  useEffect(() => {
    if (debouncedSearchTerm) {
      searchClients(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchClients]);

  const selectClient = useCallback((client: DatabaseClient) => {
    setSelectedClient(client);
    setSearchTerm(client.nome_fantasia || client.razao_social);
    setShowDropdown(false);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedClient(null);
    setSearchTerm('');
    setSearchResults([]);
    setShowDropdown(false);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    showDropdown,
    setShowDropdown,
    selectedClient,
    setSelectedClient,
    selectClient,
    clearSelection,
  };
}