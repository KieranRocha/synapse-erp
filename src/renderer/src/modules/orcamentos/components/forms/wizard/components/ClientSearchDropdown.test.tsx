import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientSearchDropdown } from './ClientSearchDropdown';
import type { DatabaseClient } from '../../../../../../shared/hooks';

const mockClient: DatabaseClient = {
  id: 1,
  razao_social: 'Test Company LTDA',
  nome_fantasia: 'Test Company',
  cpf_cnpj: '12345678000195',
  cidade: 'São Paulo',
  uf: 'SP',
};

const defaultProps = {
  searchTerm: '',
  searchResults: [],
  isSearching: false,
  showDropdown: false,
  selectedClient: null,
  onSearchChange: vi.fn(),
  onSelectClient: vi.fn(),
  onFocus: vi.fn(),
  onNewClient: vi.fn(),
};

describe('ClientSearchDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input with placeholder', () => {
    render(<ClientSearchDropdown {...defaultProps} />);

    expect(screen.getByPlaceholderText('Digite o nome ou CNPJ do cliente...')).toBeInTheDocument();
    expect(screen.getByLabelText('Buscar Cliente')).toBeInTheDocument();
  });

  it('should render new client button', () => {
    render(<ClientSearchDropdown {...defaultProps} />);

    expect(screen.getByRole('button', { name: /novo/i })).toBeInTheDocument();
  });

  it('should call onSearchChange when input value changes', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();

    render(<ClientSearchDropdown {...defaultProps} onSearchChange={onSearchChange} />);

    const input = screen.getByPlaceholderText('Digite o nome ou CNPJ do cliente...');
    await user.type(input, 'test');

    expect(onSearchChange).toHaveBeenCalledWith('test');
  });

  it('should call onFocus when input is focused', async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();

    render(<ClientSearchDropdown {...defaultProps} onFocus={onFocus} />);

    const input = screen.getByPlaceholderText('Digite o nome ou CNPJ do cliente...');
    await user.click(input);

    expect(onFocus).toHaveBeenCalled();
  });

  it('should show loading spinner when searching', () => {
    render(<ClientSearchDropdown {...defaultProps} isSearching={true} />);

    expect(screen.getByTestId('loading-spinner') || document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should show success check when client is selected', () => {
    render(<ClientSearchDropdown {...defaultProps} selectedClient={mockClient} />);

    expect(document.querySelector('.text-emerald-600')).toBeInTheDocument();
  });

  it('should show dropdown with search results', () => {
    render(
      <ClientSearchDropdown
        {...defaultProps}
        searchResults={[mockClient]}
        showDropdown={true}
      />
    );

    expect(screen.getByText('Test Company')).toBeInTheDocument();
    expect(screen.getByText('Test Company LTDA')).toBeInTheDocument();
    expect(screen.getByText(/CNPJ: 12\.345\.678\/000\-95/)).toBeInTheDocument();
    expect(screen.getByText('São Paulo, SP')).toBeInTheDocument();
  });

  it('should call onSelectClient when clicking on a result', async () => {
    const user = userEvent.setup();
    const onSelectClient = vi.fn();

    render(
      <ClientSearchDropdown
        {...defaultProps}
        searchResults={[mockClient]}
        showDropdown={true}
        onSelectClient={onSelectClient}
      />
    );

    const clientButton = screen.getByText('Test Company');
    await user.click(clientButton);

    expect(onSelectClient).toHaveBeenCalledWith(mockClient);
  });

  it('should show no results message when no clients found', () => {
    render(
      <ClientSearchDropdown
        {...defaultProps}
        searchTerm="nonexistent"
        searchResults={[]}
        showDropdown={true}
        isSearching={false}
      />
    );

    expect(screen.getByText(/Nenhum cliente encontrado para "nonexistent"/)).toBeInTheDocument();
    expect(screen.getByText('Cadastrar novo cliente')).toBeInTheDocument();
  });

  it('should call onNewClient when clicking new client button', async () => {
    const user = userEvent.setup();
    const onNewClient = vi.fn();

    render(<ClientSearchDropdown {...defaultProps} onNewClient={onNewClient} />);

    const newButton = screen.getByRole('button', { name: /novo/i });
    await user.click(newButton);

    expect(onNewClient).toHaveBeenCalled();
  });

  it('should call onNewClient when clicking "Cadastrar novo cliente" link', async () => {
    const user = userEvent.setup();
    const onNewClient = vi.fn();

    render(
      <ClientSearchDropdown
        {...defaultProps}
        searchTerm="nonexistent"
        searchResults={[]}
        showDropdown={true}
        isSearching={false}
        onNewClient={onNewClient}
      />
    );

    const cadastrarLink = screen.getByText('Cadastrar novo cliente');
    await user.click(cadastrarLink);

    expect(onNewClient).toHaveBeenCalled();
  });

  it('should display client without nome_fantasia correctly', () => {
    const clientWithoutFantasia = {
      ...mockClient,
      nome_fantasia: undefined,
    };

    render(
      <ClientSearchDropdown
        {...defaultProps}
        searchResults={[clientWithoutFantasia]}
        showDropdown={true}
      />
    );

    expect(screen.getByText('Test Company LTDA')).toBeInTheDocument();
    expect(screen.queryByText('Test Company')).not.toBeInTheDocument();
  });
});