import React, { forwardRef } from 'react';
import { Loader2, Check } from 'lucide-react';
import type { DatabaseClient } from '../../../../../../shared/hooks';

interface ClientSearchDropdownProps {
  searchTerm: string;
  searchResults: DatabaseClient[];
  isSearching: boolean;
  showDropdown: boolean;
  selectedClient: DatabaseClient | null;
  onSearchChange: (value: string) => void;
  onSelectClient: (client: DatabaseClient) => void;
  onFocus: () => void;
  onNewClient: () => void;
  inputClassName?: string;
}

const formatCNPJ = (v: string) => {
  const digits = v.replace(/[^0-9]/g, '').slice(0, 14);
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

export const ClientSearchDropdown = forwardRef<HTMLDivElement, ClientSearchDropdownProps>(
  ({
    searchTerm,
    searchResults,
    isSearching,
    showDropdown,
    selectedClient,
    onSearchChange,
    onSelectClient,
    onFocus,
    onNewClient,
    inputClassName = "",
  }, dropdownRef) => {
    return (
      <div className="flex flex-col gap-2 relative">
        <label className="text-xs opacity-70">Buscar Cliente</label>
        <div className="relative">
          <div className="flex justify-between gap-2">
            <div className="relative flex-1 mr-2">
              <input
                className={`px-3 py-2 rounded-lg border border-border bg-input text-fg text-sm outline-none focus:ring-2 focus:ring-ring/40 flex-1 pr-8 w-full ${inputClassName}`}
                placeholder="Digite o nome ou CNPJ do cliente..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={onFocus}
              />

              {isSearching && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              )}

              {selectedClient && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-emerald-600">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onNewClient}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-emerald-500/40 text-emerald-600 text-sm hover:bg-emerald-500/10"
              title="Cadastrar novo cliente"
            >
              <span className="text-sm">+</span> Novo
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
                  onClick={() => onSelectClient(client)}
                  className="w-full px-3 py-3 text-left hover:bg-muted border-b border-border last:border-b-0 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-fg text-sm">
                        {client.nome_fantasia || client.razao_social}
                      </div>
                      {client.nome_fantasia && (
                        <div className="text-xs text-muted-foreground">
                          {client.razao_social}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        CNPJ: {formatCNPJ(client.cpf_cnpj)}
                      </div>
                      {(client.cidade || client.uf) && (
                        <div className="text-xs text-muted-foreground">
                          {[client.cidade, client.uf].filter(Boolean).join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results message */}
          {showDropdown && searchResults.length === 0 && searchTerm.length >= 2 && !isSearching && (
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
                  onClick={onNewClient}
                  className="text-xs text-emerald-600 hover:text-emerald-700 underline"
                >
                  Cadastrar novo cliente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

ClientSearchDropdown.displayName = 'ClientSearchDropdown';