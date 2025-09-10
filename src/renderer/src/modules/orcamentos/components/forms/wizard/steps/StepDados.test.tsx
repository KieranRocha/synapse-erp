// import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// import { render, screen, waitFor, fireEvent } from '@testing-library/react';
// import { BrowserRouter } from 'react-router-dom';
// import StepDados from './StepDados';
// import type { Meta } from '../../../../utils/types';

// // Mock the toast hooks
// const mockToast = {
//   success: vi.fn(),
//   error: vi.fn(),
//   warning: vi.fn(),
//   info: vi.fn(),
//   show: vi.fn()
// };

// vi.mock('../../../../../../shared/hooks', async () => {
//   const actual = await vi.importActual('../../../../../../shared/hooks');
//   return {
//     ...actual,
//     useToast: () => mockToast,
//     useToastStore: () => mockToast.success,
//   };
// });

// // Mock navigate
// const mockNavigate = vi.fn();
// vi.mock('react-router-dom', async () => {
//   const actual = await vi.importActual('react-router-dom');
//   return {
//     ...actual,
//     useNavigate: () => mockNavigate,
//   };
// });

// // Mock window API
// const mockSearch = vi.fn();
// global.window.api = {
//   ...global.window.api,
//   clients: {
//     search: mockSearch,
//   },
// };

// const mockClient = {
//   id: 1,
//   razao_social: 'Test Company LTDA',
//   nome_fantasia: 'Test Company',
//   cpf_cnpj: '12345678000195',
//   cidade: 'São Paulo',
//   uf: 'SP',
//   cep: '01000000',
//   logradouro: 'Rua Test',
//   numero: '123',
//   bairro: 'Centro',
//   created_at: '2024-01-01T00:00:00Z',
// };

// const defaultMeta: Meta = {
//   numero: '',
//   nome: '',
//   cliente: '',
//   cnpj: '',
//   clienteEndereco: '',
//   clienteBairro: '',
//   clienteCidade: '',
//   clienteUF: '',
//   clienteCEP: '',
//   clienteAtividade: '',
//   clienteAbertura: '',
//   responsavel: '',
//   dataInicio: '',
//   previsaoEntrega: '',
//   descricao: '',
// };

// const Wrapper = ({ children }: { children: React.ReactNode }) => (
//   <BrowserRouter>{children}</BrowserRouter>
// );

// describe('StepDados', () => {
//   const mockSetMeta = vi.fn();

//   beforeEach(() => {
//     vi.clearAllMocks();
//     Object.values(mockToast).forEach(fn => fn.mockClear());
//     vi.useFakeTimers();
//     mockSearch.mockResolvedValue([]);
//   });

//   afterEach(() => {
//     vi.restoreAllMocks();
//     vi.useRealTimers();
//   });

//   it('should render all form fields', () => {
//     render(
//       <Wrapper>
//         <StepDados meta={defaultMeta} setMeta={mockSetMeta} />
//       </Wrapper>
//     );

//     expect(screen.getByPlaceholderText('Ex: ORC-001')).toBeInTheDocument();
//     expect(screen.getByPlaceholderText('Ex: Linha de Pintura - Setor A')).toBeInTheDocument();
//     expect(screen.getByPlaceholderText('Digite o nome ou CNPJ do cliente...')).toBeInTheDocument();
//     expect(screen.getByPlaceholderText('Nome do responsável')).toBeInTheDocument();
//     expect(screen.getByPlaceholderText('Detalhes sobre o projeto, ambiente, requisitos técnicos, etc.')).toBeInTheDocument();
//   });

//   it('should render all labels correctly', () => {
//     render(
//       <Wrapper>
//         <StepDados meta={defaultMeta} setMeta={mockSetMeta} />
//       </Wrapper>
//     );

//     expect(screen.getByText('Número do Orçamento *')).toBeInTheDocument();
//     expect(screen.getByText('Nome do Orçamento *')).toBeInTheDocument();
//     expect(screen.getByText('Buscar Cliente')).toBeInTheDocument();
//     expect(screen.getByText('Responsável')).toBeInTheDocument();
//     expect(screen.getByText('Data de Início')).toBeInTheDocument();
//     expect(screen.getByText('Previsão de Entrega')).toBeInTheDocument();
//     expect(screen.getByText('Descrição / Escopo do Orçamento')).toBeInTheDocument();
//   });

//   it('should update meta when numero input changes', () => {
//     render(
//       <Wrapper>
//         <StepDados meta={defaultMeta} setMeta={mockSetMeta} />
//       </Wrapper>
//     );

//     const numeroInput = screen.getByPlaceholderText('Ex: ORC-001');
//     fireEvent.change(numeroInput, { target: { value: 'ORC-002' } });

//     expect(mockSetMeta).toHaveBeenCalledWith({
//       ...defaultMeta,
//       numero: 'ORC-002',
//     });
//   });

//   it('should update meta when nome input changes', () => {
//     render(
//       <Wrapper>
//         <StepDados meta={defaultMeta} setMeta={mockSetMeta} />
//       </Wrapper>
//     );

//     const nomeInput = screen.getByPlaceholderText('Ex: Linha de Pintura - Setor A');
//     fireEvent.change(nomeInput, { target: { value: 'Novo Projeto' } });

//     expect(mockSetMeta).toHaveBeenCalledWith({
//       ...defaultMeta,
//       nome: 'Novo Projeto',
//     });
//   });

//   it('should perform client search with debounce', async () => {
//     mockSearch.mockResolvedValue([mockClient]);

//     render(
//       <Wrapper>
//         <StepDados meta={defaultMeta} setMeta={mockSetMeta} />
//       </Wrapper>
//     );

//     const searchInput = screen.getByPlaceholderText('Digite o nome ou CNPJ do cliente...');
//     fireEvent.change(searchInput, { target: { value: 'test search' } });

//     // Fast-forward debounce timer
//     vi.advanceTimersByTime(100);

//     await waitFor(() => {
//       expect(mockSearch).toHaveBeenCalledWith('test search');
//     });
//   });

//   it('should show loading spinner during search', async () => {
//     let resolveSearch: (value: any) => void;
//     mockSearch.mockImplementation(() => new Promise(resolve => {
//       resolveSearch = resolve;
//     }));

//     render(
//       <Wrapper>
//         <StepDados meta={defaultMeta} setMeta={mockSetMeta} />
//       </Wrapper>
//     );

//     const searchInput = screen.getByPlaceholderText('Digite o nome ou CNPJ do cliente...');
//     fireEvent.change(searchInput, { target: { value: 'test' } });

//     vi.advanceTimersByTime(300);

//     // Should show loading spinner
//     await waitFor(() => {
//       expect(document.querySelector('.animate-spin')).toBeInTheDocument();
//     });

//     // Resolve search
//     resolveSearch([]);
//   });

//   it('should display search results in dropdown', async () => {
//     mockSearch.mockResolvedValue([mockClient]);

//     render(
//       <Wrapper>
//         <StepDados meta={defaultMeta} setMeta={mockSetMeta} />
//       </Wrapper>
//     );

//     const searchInput = screen.getByPlaceholderText('Digite o nome ou CNPJ do cliente...');
//     fireEvent.change(searchInput, { target: { value: 'test' } });

//     vi.advanceTimersByTime(300);

//     await waitFor(() => {
//       expect(screen.getByText('Test Company')).toBeInTheDocument();
//       expect(screen.getByText('Test Company LTDA')).toBeInTheDocument();
//       expect(screen.getByText(/CNPJ: 12\.345\.678\/000\-95/)).toBeInTheDocument();
//       expect(screen.getByText('São Paulo, SP')).toBeInTheDocument();
//     });
//   });

//   it('should select client and update meta', async () => {
//     mockSearch.mockResolvedValue([mockClient]);

//     render(
//       <Wrapper>
//         <StepDados meta={defaultMeta} setMeta={mockSetMeta} />
//       </Wrapper>
//     );

//     const searchInput = screen.getByPlaceholderText('Digite o nome ou CNPJ do cliente...');
//     fireEvent.change(searchInput, { target: { value: 'test' } });

//     vi.advanceTimersByTime(300);

//     await waitFor(() => {
//       expect(screen.getByText('Test Company')).toBeInTheDocument();
//     });

//     const clientButton = screen.getByText('Test Company');
//     fireEvent.click(clientButton);

//     expect(mockSetMeta).toHaveBeenCalledWith({
//       ...defaultMeta,
//       clienteId: 1,
//       cliente: 'Test Company',
//       cnpj: '12.345.678/000-95',
//       clienteEndereco: 'Rua Test, 123',
//       clienteBairro: 'Centro',
//       clienteCidade: 'São Paulo',
//       clienteUF: 'SP',
//       clienteCEP: '01000-000',
//       clienteAtividade: '',
//       clienteAbertura: '01/01/2024',
//     });

//     expect(mockToast.success).toHaveBeenCalledWith('Cliente "Test Company" selecionado!');
//   });

//   it('should show "no results" message when no clients found', async () => {
//     mockSearch.mockResolvedValue([]);

//     render(
//       <Wrapper>
//         <StepDados meta={defaultMeta} setMeta={mockSetMeta} />
//       </Wrapper>
//     );

//     const searchInput = screen.getByPlaceholderText('Digite o nome ou CNPJ do cliente...');
//     fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

//     vi.advanceTimersByTime(300);

//     await waitFor(() => {
//       expect(screen.getByText(/Nenhum cliente encontrado para "nonexistent"/)).toBeInTheDocument();
//       expect(screen.getByText('Cadastrar novo cliente')).toBeInTheDocument();
//     });
//   });

//   it('should navigate to new client page when clicking "Novo" button', () => {
//     render(
//       <Wrapper>
//         <StepDados meta={defaultMeta} setMeta={mockSetMeta} />
//       </Wrapper>
//     );

//     const novoButton = screen.getByRole('button', { name: /novo/i });
//     fireEvent.click(novoButton);

//     expect(mockNavigate).toHaveBeenCalledWith('/clientes/novo');
//   });

//   it('should navigate to new client page when clicking "Cadastrar novo cliente" link', async () => {
//     mockSearch.mockResolvedValue([]);

//     render(
//       <Wrapper>
//         <StepDados meta={defaultMeta} setMeta={mockSetMeta} />
//       </Wrapper>
//     );

//     const searchInput = screen.getByPlaceholderText('Digite o nome ou CNPJ do cliente...');
//     fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

//     vi.advanceTimersByTime(300);

//     await waitFor(() => {
//       expect(screen.getByText('Cadastrar novo cliente')).toBeInTheDocument();
//     });

//     const cadastrarLink = screen.getByText('Cadastrar novo cliente');
//     fireEvent.click(cadastrarLink);

//     expect(mockNavigate).toHaveBeenCalledWith('/clientes/novo');
//   });

//   it('should show check icon when client is selected', async () => {
//     mockSearch.mockResolvedValue([mockClient]);

//     render(
//       <Wrapper>
//         <StepDados meta={defaultMeta} setMeta={mockSetMeta} />
//       </Wrapper>
//     );

//     const searchInput = screen.getByPlaceholderText('Digite o nome ou CNPJ do cliente...');
//     fireEvent.change(searchInput, { target: { value: 'test' } });

//     vi.advanceTimersByTime(300);

//     await waitFor(() => {
//       expect(screen.getByText('Test Company')).toBeInTheDocument();
//     });

//     const clientButton = screen.getByText('Test Company');
//     fireEvent.click(clientButton);

//     expect(document.querySelector('.text-emerald-600')).toBeInTheDocument();
//   });

//   it('should update responsavel in meta', () => {
//     render(
//       <Wrapper>
//         <StepDados meta={defaultMeta} setMeta={mockSetMeta} />
//       </Wrapper>
//     );

//     const responsavelInput = screen.getByPlaceholderText('Nome do responsável');
//     fireEvent.change(responsavelInput, { target: { value: 'João Silva' } });

//     expect(mockSetMeta).toHaveBeenCalledWith({
//       ...defaultMeta,
//       responsavel: 'João Silva',
//     });
//   });

//   it('should update date fields in meta', () => {
//     render(
//       <Wrapper>
//         <StepDados meta={defaultMeta} setMeta={mockSetMeta} />
//       </Wrapper>
//     );

//     const dateInputs = screen.getAllByDisplayValue('');
//     const dataInicioInput = dateInputs.find(input =>
//       input.getAttribute('type') === 'date' &&
//       input.closest('.flex-col')?.textContent?.includes('Data de Início')
//     );

//     if (dataInicioInput) {
//       fireEvent.change(dataInicioInput, { target: { value: '2024-01-01' } });

//       expect(mockSetMeta).toHaveBeenCalledWith({
//         ...defaultMeta,
//         dataInicio: '2024-01-01',
//       });
//     }
//   });

//   it('should update description in meta', () => {
//     render(
//       <Wrapper>
//         <StepDados meta={defaultMeta} setMeta={mockSetMeta} />
//       </Wrapper>
//     );

//     const descricaoInput = screen.getByPlaceholderText('Detalhes sobre o projeto, ambiente, requisitos técnicos, etc.');
//     fireEvent.change(descricaoInput, { target: { value: 'Descrição do projeto' } });

//     expect(mockSetMeta).toHaveBeenCalledWith({
//       ...defaultMeta,
//       descricao: 'Descrição do projeto',
//     });
//   });

//   it('should handle search errors gracefully', async () => {
//     const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
//     mockSearch.mockRejectedValue(new Error('API Error'));

//     render(
//       <Wrapper>
//         <StepDados meta={defaultMeta} setMeta={mockSetMeta} />
//       </Wrapper>
//     );

//     const searchInput = screen.getByPlaceholderText('Digite o nome ou CNPJ do cliente...');
//     fireEvent.change(searchInput, { target: { value: 'error test' } });

//     vi.advanceTimersByTime(300);

//     await waitFor(() => {
//       expect(consoleSpy).toHaveBeenCalledWith('Erro na busca:', expect.any(Error));
//     });

//     consoleSpy.mockRestore();
//   });

//   it('should format CNPJ correctly', async () => {
//     mockSearch.mockResolvedValue([mockClient]);

//     render(
//       <Wrapper>
//         <StepDados meta={defaultMeta} setMeta={mockSetMeta} />
//       </Wrapper>
//     );

//     const searchInput = screen.getByPlaceholderText('Digite o nome ou CNPJ do cliente...');
//     fireEvent.change(searchInput, { target: { value: 'test' } });

//     vi.advanceTimersByTime(300);

//     await waitFor(() => {
//       expect(screen.getByText(/CNPJ: 12\.345\.678\/000\-95/)).toBeInTheDocument();
//     });
//   });

//   it('should close dropdown when clicking outside', async () => {
//     mockSearch.mockResolvedValue([mockClient]);

//     render(
//       <Wrapper>
//         <StepDados meta={defaultMeta} setMeta={mockSetMeta} />
//       </Wrapper>
//     );

//     const searchInput = screen.getByPlaceholderText('Digite o nome ou CNPJ do cliente...');
//     fireEvent.change(searchInput, { target: { value: 'test' } });

//     vi.advanceTimersByTime(300);

//     await waitFor(() => {
//       expect(screen.getByText('Test Company')).toBeInTheDocument();
//     });

//     // Click outside
//     fireEvent.click(document.body);

//     await waitFor(() => {
//       expect(screen.queryByText('Test Company')).not.toBeInTheDocument();
//     });
//   });
// });