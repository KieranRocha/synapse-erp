import { CNPJ } from '../value-objects/CNPJ';
import { Money } from '../value-objects/Money';
import { StatusOrcamento } from '../value-objects/StatusOrcamento';

export class Orcamento {
  constructor(
    private readonly id: string,
    private readonly numero: string,
    private cliente: string,
    private cnpj: CNPJ | null,
    private responsavel: string,
    private dataInicio: Date,
    private previsaoEntrega: Date,
    private valor: Money,
    private status: StatusOrcamento
  ) {}

  getId(): string {
    return this.id;
  }
}
