// store/clientesStore.ts
import { create } from 'zustand';

export type Cliente = {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  email?: string;
  telefone?: string;
  atividade: string;
  dataAbertura: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  regime: 'SN' | 'LP' | 'LR';
  observacoes?: string;
};

type ClientesState = {
  clientes: Cliente[];
  searchCliente: (cnpj: string) => Cliente | null;
  addCliente: (cliente: Omit<Cliente, 'id'>) => void;
  updateCliente: (id: string, cliente: Partial<Cliente>) => void;
  removeCliente: (id: string) => void;
};

// Mock data
const mockClientes: Cliente[] = [
  {
    id: '1',
    cnpj: '12.345.678/0001-95',
    razaoSocial: 'Indústria Metalúrgica ABC Ltda',
    nomeFantasia: 'MetalABC',
    endereco: 'Rua das Indústrias',
    numero: '1500',
    bairro: 'Distrito Industrial',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '01234-567',
    email: 'contato@metalabc.com.br',
    telefone: '(11) 3456-7890',
    atividade: 'Fabricação de estruturas metálicas',
    dataAbertura: '2010-03-15',
    inscricaoEstadual: '123.456.789.012',
    regime: 'LP'
  },
  {
    id: '2',
    cnpj: '98.765.432/0001-10',
    razaoSocial: 'Automação Industrial XYZ S/A',
    nomeFantasia: 'AutoXYZ',
    endereco: 'Av. Tecnológica',
    numero: '2000',
    complemento: 'Galpão B',
    bairro: 'Techno Park',
    cidade: 'Campinas',
    uf: 'SP',
    cep: '13087-654',
    email: 'vendas@autoxyz.com.br',
    telefone: '(19) 2345-6789',
    atividade: 'Fabricação de equipamentos de automação industrial',
    dataAbertura: '2015-07-22',
    inscricaoEstadual: '987.654.321.098',
    inscricaoMunicipal: '123456789',
    regime: 'LR'
  },
  {
    id: '3',
    cnpj: '11.222.333/0001-44',
    razaoSocial: 'Soluções Têxteis DEF ME',
    nomeFantasia: 'TêxtilDEF',
    endereco: 'Rua dos Tecelões',
    numero: '850',
    bairro: 'Centro Industrial',
    cidade: 'Americana',
    uf: 'SP',
    cep: '13466-123',
    email: 'info@textildef.com.br',
    telefone: '(19) 3456-1234',
    atividade: 'Fabricação de tecidos especiais',
    dataAbertura: '2018-11-08',
    regime: 'SN',
    observacoes: 'Cliente preferenciaл, desconto 5%'
  }
];

export const useClientesStore = create<ClientesState>((set, get) => ({
  clientes: mockClientes,

  searchCliente: (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    const cliente = get().clientes.find(c => 
      c.cnpj.replace(/\D/g, '') === cleanCnpj
    );
    return cliente || null;
  },

  addCliente: (clienteData) => {
    const newCliente: Cliente = {
      ...clienteData,
      id: crypto.randomUUID()
    };
    set((state) => ({
      clientes: [...state.clientes, newCliente]
    }));
  },

  updateCliente: (id, updates) => {
    set((state) => ({
      clientes: state.clientes.map(c => 
        c.id === id ? { ...c, ...updates } : c
      )
    }));
  },

  removeCliente: (id) => {
    set((state) => ({
      clientes: state.clientes.filter(c => c.id !== id)
    }));
  }
}));