import { CNPJ } from '../../../@shared/domain/valueObjects/CNPJ'
import { Money } from '../../../@shared/domain/valueObjects/Money'

export class Orcamento {
  nome: string
  cliente: string
  cnpj?: CNPJ
  responsavel: string
  dataInicio: string
  previsaoEntrega: string
  descricao: string
  precoSugerido?: Money
  precoAprovado?: Money
  clienteEndereco?: string
  clienteBairro?: string
  clienteCidade?: string
  clienteUF?: string
  clienteCEP?: string
  clienteAtividade?: string
  clienteAbertura?: string

  constructor(props: {
    nome: string
    cliente: string
    responsavel: string
    dataInicio: string
    previsaoEntrega: string
    descricao: string
    cnpj?: CNPJ
    precoSugerido?: Money
    precoAprovado?: Money
    clienteEndereco?: string
    clienteBairro?: string
    clienteCidade?: string
    clienteUF?: string
    clienteCEP?: string
    clienteAtividade?: string
    clienteAbertura?: string
  }) {
    this.nome = props.nome
    this.cliente = props.cliente
    this.cnpj = props.cnpj
    this.responsavel = props.responsavel
    this.dataInicio = props.dataInicio
    this.previsaoEntrega = props.previsaoEntrega
    this.descricao = props.descricao
    this.precoSugerido = props.precoSugerido
    this.precoAprovado = props.precoAprovado
    this.clienteEndereco = props.clienteEndereco
    this.clienteBairro = props.clienteBairro
    this.clienteCidade = props.clienteCidade
    this.clienteUF = props.clienteUF
    this.clienteCEP = props.clienteCEP
    this.clienteAtividade = props.clienteAtividade
    this.clienteAbertura = props.clienteAbertura
  }
}
