import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClientForm } from './ClientForm';

const mockClientData = {
  cliente: 'Test Company LTDA',
  clienteEndereco: 'Rua Test, 123',
  clienteBairro: 'Centro',
  clienteCidade: 'São Paulo',
  clienteUF: 'SP',
  clienteCEP: '01000-000',
  clienteAtividade: 'Tecnologia',
  clienteAbertura: '01/01/2020',
};

const emptyClientData = {
  cliente: '',
  clienteEndereco: '',
  clienteBairro: '',
  clienteCidade: '',
  clienteUF: '',
  clienteCEP: '',
  clienteAtividade: '',
  clienteAbertura: '',
};

describe('ClientForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render client information when data is provided', () => {
    render(<ClientForm data={mockClientData} />);
    
    expect(screen.getByDisplayValue('Test Company LTDA')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Rua Test, 123')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Centro')).toBeInTheDocument();
    expect(screen.getByDisplayValue('São Paulo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('SP')).toBeInTheDocument();
    expect(screen.getByDisplayValue('01000-000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Tecnologia')).toBeInTheDocument();
    expect(screen.getByDisplayValue('01/01/2020')).toBeInTheDocument();
  });

  it('should render empty placeholders when no data is provided', () => {
    render(<ClientForm data={emptyClientData} />);
    
    // Check if placeholders are shown for empty fields
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(8); // Should have 8 input fields
    
    inputs.forEach(input => {
      expect(input).toHaveValue('');
    });
  });

  it('should render all field labels correctly', () => {
    render(<ClientForm data={mockClientData} />);
    
    expect(screen.getByText('Nome')).toBeInTheDocument();
    expect(screen.getByText('Endereço')).toBeInTheDocument();
    expect(screen.getByText('Bairro')).toBeInTheDocument();
    expect(screen.getByText('Cidade')).toBeInTheDocument();
    expect(screen.getByText('UF')).toBeInTheDocument();
    expect(screen.getByText('CEP')).toBeInTheDocument();
    expect(screen.getByText('Atividade')).toBeInTheDocument();
    expect(screen.getByText('Data Abertura')).toBeInTheDocument();
  });

  it('should render help text', () => {
    render(<ClientForm data={mockClientData} />);
    
    expect(screen.getByText('Dados do Cliente (preenchidos automaticamente)')).toBeInTheDocument();
  });

  it('should have readonly inputs', () => {
    render(<ClientForm data={mockClientData} />);
    
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toHaveAttribute('readonly');
    });
  });

  it('should apply custom input className when provided', () => {
    const customClass = 'custom-input-class';
    render(<ClientForm data={mockClientData} inputClassName={customClass} />);
    
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toHaveClass(customClass);
    });
  });

  it('should handle partial data gracefully', () => {
    const partialData = {
      cliente: 'Only Name Company',
      clienteEndereco: '',
      clienteBairro: '',
      clienteCidade: 'Only City',
      clienteUF: '',
      clienteCEP: '',
      clienteAtividade: '',
      clienteAbertura: '',
    };

    render(<ClientForm data={partialData} />);
    
    expect(screen.getByDisplayValue('Only Name Company')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Only City')).toBeInTheDocument();
  });
});