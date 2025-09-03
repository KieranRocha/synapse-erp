import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectForm } from './ProjectForm';

const mockData = {
  numero: 'ORC-001',
  nome: 'Projeto Teste',
  responsavel: 'João Silva',
  dataInicio: '2024-01-01',
  previsaoEntrega: '2024-12-31',
  descricao: 'Descrição do projeto',
};

const defaultProps = {
  data: mockData,
  onChange: vi.fn(),
};

describe('ProjectForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all form fields with correct values', () => {
    render(<ProjectForm {...defaultProps} />);
    
    expect(screen.getByDisplayValue('ORC-001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Projeto Teste')).toBeInTheDocument();
    expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-12-31')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Descrição do projeto')).toBeInTheDocument();
  });

  it('should render all labels correctly', () => {
    render(<ProjectForm {...defaultProps} />);
    
    expect(screen.getByText('Número do Orçamento *')).toBeInTheDocument();
    expect(screen.getByText('Nome do Orçamento *')).toBeInTheDocument();
    expect(screen.getByText('Responsável')).toBeInTheDocument();
    expect(screen.getByText('Data de Início')).toBeInTheDocument();
    expect(screen.getByText('Previsão de Entrega')).toBeInTheDocument();
    expect(screen.getByText('Descrição / Escopo do Orçamento')).toBeInTheDocument();
  });

  it('should call onChange when numero input changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<ProjectForm {...defaultProps} onChange={onChange} />);
    
    const numeroInput = screen.getByDisplayValue('ORC-001');
    await user.clear(numeroInput);
    await user.type(numeroInput, 'ORC-002');
    
    expect(onChange).toHaveBeenCalledWith('numero', 'ORC-002');
  });

  it('should call onChange when nome input changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<ProjectForm {...defaultProps} onChange={onChange} />);
    
    const nomeInput = screen.getByDisplayValue('Projeto Teste');
    await user.clear(nomeInput);
    await user.type(nomeInput, 'Novo Projeto');
    
    expect(onChange).toHaveBeenCalledWith('nome', 'Novo Projeto');
  });

  it('should call onChange when responsavel input changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<ProjectForm {...defaultProps} onChange={onChange} />);
    
    const responsavelInput = screen.getByDisplayValue('João Silva');
    await user.clear(responsavelInput);
    await user.type(responsavelInput, 'Maria Santos');
    
    expect(onChange).toHaveBeenCalledWith('responsavel', 'Maria Santos');
  });

  it('should call onChange when dataInicio input changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<ProjectForm {...defaultProps} onChange={onChange} />);
    
    const dataInicioInput = screen.getByDisplayValue('2024-01-01');
    await user.clear(dataInicioInput);
    await user.type(dataInicioInput, '2024-02-01');
    
    expect(onChange).toHaveBeenCalledWith('dataInicio', '2024-02-01');
  });

  it('should call onChange when previsaoEntrega input changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<ProjectForm {...defaultProps} onChange={onChange} />);
    
    const previsaoEntregaInput = screen.getByDisplayValue('2024-12-31');
    await user.clear(previsaoEntregaInput);
    await user.type(previsaoEntregaInput, '2024-11-30');
    
    expect(onChange).toHaveBeenCalledWith('previsaoEntrega', '2024-11-30');
  });

  it('should call onChange when descricao textarea changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    
    render(<ProjectForm {...defaultProps} onChange={onChange} />);
    
    const descricaoInput = screen.getByDisplayValue('Descrição do projeto');
    await user.clear(descricaoInput);
    await user.type(descricaoInput, 'Nova descrição');
    
    expect(onChange).toHaveBeenCalledWith('descricao', 'Nova descrição');
  });

  it('should render with empty data', () => {
    const emptyData = {
      numero: '',
      nome: '',
      responsavel: '',
      dataInicio: '',
      previsaoEntrega: '',
      descricao: '',
    };
    
    render(<ProjectForm data={emptyData} onChange={vi.fn()} />);
    
    // Should render empty inputs without errors
    expect(screen.getByPlaceholderText('Ex: ORC-001')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ex: Linha de Pintura - Setor A')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nome do responsável')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Detalhes sobre o projeto, ambiente, requisitos técnicos, etc.')).toBeInTheDocument();
  });

  it('should apply custom input className', () => {
    render(<ProjectForm {...defaultProps} inputClassName="custom-class" />);
    
    const numeroInput = screen.getByDisplayValue('ORC-001');
    expect(numeroInput).toHaveClass('custom-class');
  });

  it('should have correct input types for date fields', () => {
    render(<ProjectForm {...defaultProps} />);
    
    const dataInicioInput = screen.getByDisplayValue('2024-01-01');
    const previsaoEntregaInput = screen.getByDisplayValue('2024-12-31');
    
    expect(dataInicioInput).toHaveAttribute('type', 'date');
    expect(previsaoEntregaInput).toHaveAttribute('type', 'date');
  });

  it('should have correct number of rows for textarea', () => {
    render(<ProjectForm {...defaultProps} />);
    
    const textarea = screen.getByDisplayValue('Descrição do projeto');
    expect(textarea).toHaveAttribute('rows', '3');
  });
});