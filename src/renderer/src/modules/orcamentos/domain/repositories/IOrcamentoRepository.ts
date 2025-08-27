import { Orcamento } from '../entities/Orcamento';

export interface IOrcamentoRepository {
  findAll(): Promise<Orcamento[]>;
  findById(id: string): Promise<Orcamento | null>;
  save(orcamento: Orcamento): Promise<void>;
}
