import React from 'react';
import { CheckCircle2, Building2, Users, Calculator, Mail, MapPin, FileText, Shield, Info } from 'lucide-react';
import { OnboardingFormData } from '../../schemas/onboardingSchema';
import { Badge } from '../../../../shared/components/ui';

interface StepRevisaoProps {
  data: OnboardingFormData;
}

export function StepRevisao({ data }: StepRevisaoProps) {
  const { empresa, admin, outrosUsuarios, financeiro } = data;

  const getRegimeLabel = (regime: string) => {
    const regimes = {
      'MEI': 'MEI',
      'SIMPLES': 'Simples Nacional',
      'LUCRO_PRESUMIDO': 'Lucro Presumido',
      'LUCRO_REAL': 'Lucro Real'
    } as const;
    return regimes[regime as keyof typeof regimes] || regime;
  };

  const DataRow = ({ label, value }: { label: string; value?: string | null }) => {
    if (!value) return null;
    return (
      <div className="space-y-1">
        <p className="text-xs text-text">{label}</p>
        <p className="text-sm font-medium text-fg">{value}</p>
      </div>
    );
  };

  return (
    <section className="bg-bg text-fg rounded-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Info size={20} className="text-text" />
        <h3 className="font-semibold text-text text-lg">Revisão dos Dados</h3>
      </div>
      <div className="border-b border border-card h-[0.1px] w-full mb-6"></div>

      <div className="space-y-6">
        {/* Dados da Empresa */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Building2 size={20} className="text-text" />
            <h4 className="font-semibold text-fg text-base">Informações da Empresa</h4>
          </div>
          <div className="border-b border border-card h-[0.1px] w-full mb-4"></div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <DataRow label="Razão Social" value={empresa.razaoSocial} />
              <DataRow label="Nome Fantasia" value={empresa.nomeFantasia} />
              <DataRow label="CNPJ" value={empresa.cnpj} />
              <DataRow label="Inscrição Estadual" value={empresa.ie} />
              <DataRow label="Inscrição Municipal" value={empresa.im} />
              <DataRow label="Email" value={empresa.email} />
              <DataRow label="Telefone" value={empresa.telefone} />
            </div>

            {/* Endereço */}
            {empresa.endereco && (
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={16} className="text-text" />
                  <p className="text-xs font-medium text-text">Endereço</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <DataRow label="CEP" value={empresa.cep} />
                  <DataRow label="Logradouro" value={empresa.endereco} />
                  <DataRow label="Número" value={empresa.numero} />
                  <DataRow label="Complemento" value={empresa.complemento} />
                  <DataRow label="Bairro" value={empresa.bairro} />
                  <DataRow label="Cidade" value={empresa.cidade} />
                  <DataRow label="Estado" value={empresa.uf} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Administrador */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Shield size={20} className="text-text" />
            <h4 className="font-semibold text-fg text-base">Administrador Principal</h4>
            <Badge variant="admin" size="sm">Admin</Badge>
          </div>
          <div className="border-b border border-card h-[0.1px] w-full mb-4"></div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <DataRow label="Nome Completo" value={admin.nome} />
              <DataRow label="Email" value={admin.email} />
              <DataRow label="Cargo" value={admin.cargo} />
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
              <Mail size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-300 font-medium">Senha via email</p>
                <p className="text-xs text-blue-400 mt-0.5">
                  Um email será enviado para <strong>{admin.email}</strong> com instruções para definir a senha.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Outros Usuários */}
        {outrosUsuarios.usuarios.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Users size={20} className="text-text" />
              <h4 className="font-semibold text-fg text-base">Outros Usuários</h4>
              <span className="text-xs text-text bg-card px-2 py-1 rounded">
                {outrosUsuarios.usuarios.length} usuário{outrosUsuarios.usuarios.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="border-b border border-card h-[0.1px] w-full mb-4"></div>

            <div className="space-y-3">
              {outrosUsuarios.usuarios.map((usuario, index) => (
                <div key={index} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <DataRow label="Nome" value={usuario.nome} />
                    <DataRow label="Email" value={usuario.email} />
                    <DataRow label="Cargo" value={usuario.cargo || 'Não informado'} />

                    <div className="space-y-1">
                      <p className="text-xs text-text">Permissões</p>
                      <div className="flex flex-wrap gap-1">
                        {usuario.permissoes.admin && <Badge variant="admin" size="sm">Admin</Badge>}
                        {usuario.permissoes.vendas && <Badge variant="vendas" size="sm">Vendas</Badge>}
                        {usuario.permissoes.compras && <Badge variant="compras" size="sm">Compras</Badge>}
                        {usuario.permissoes.estoque && <Badge variant="estoque" size="sm">Estoque</Badge>}
                        {usuario.permissoes.financeiro && <Badge variant="financeiro" size="sm">Financeiro</Badge>}
                        {!Object.values(usuario.permissoes).some(p => p) && (
                          <span className="text-xs text-text">Nenhuma permissão</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                    <Mail size={12} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-blue-400">Receberá email para definir senha</span>
                  </div>

                  {index < outrosUsuarios.usuarios.length - 1 && (
                    <div className="border-t border-border mt-4"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configuração Financeira */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Calculator size={20} className="text-text" />
            <h4 className="font-semibold text-fg text-base">Configuração Fiscal e Tributária</h4>
          </div>
          <div className="border-b border border-card h-[0.1px] w-full mb-4"></div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <DataRow label="Regime Tributário" value={getRegimeLabel(financeiro.regimeTributario)} />

              {/* Simples Nacional */}
              {financeiro.regimeTributario === 'SIMPLES' && (
                <>
                  <DataRow label="Anexo do Simples" value={financeiro.anexoSimples ? `Anexo ${financeiro.anexoSimples}` : undefined} />
                  <DataRow label="Alíquota Média Estimada" value={financeiro.aliquotaMediaEstimada ? `${financeiro.aliquotaMediaEstimada}%` : undefined} />
                </>
              )}

              {/* Lucro Presumido */}
              {financeiro.regimeTributario === 'LUCRO_PRESUMIDO' && (
                <>
                  <DataRow label="ICMS" value={financeiro.icms} />
                  <DataRow label="ISS" value={financeiro.issPercentual ? `${financeiro.issPercentual}%` : undefined} />
                  <DataRow label="PIS" value={financeiro.pisPercentual ? `${financeiro.pisPercentual}%` : undefined} />
                  <DataRow label="COFINS" value={financeiro.cofinsPercentual ? `${financeiro.cofinsPercentual}%` : undefined} />
                  <DataRow label="CSLL" value={financeiro.csllPercentual ? `${financeiro.csllPercentual}%` : undefined} />
                  <DataRow label="IRPJ" value={financeiro.irpjPercentual ? `${financeiro.irpjPercentual}%` : undefined} />
                </>
              )}

              {/* Lucro Real */}
              {financeiro.regimeTributario === 'LUCRO_REAL' && (
                <>
                  <DataRow label="ICMS" value={financeiro.icms} />
                  <DataRow label="ISS" value={financeiro.issPercentual ? `${financeiro.issPercentual}%` : undefined} />
                  <DataRow label="PIS" value={financeiro.pisPercentual ? `${financeiro.pisPercentual}%` : undefined} />
                  <DataRow label="COFINS" value={financeiro.cofinsPercentual ? `${financeiro.cofinsPercentual}%` : undefined} />
                  <DataRow label="CSLL" value={financeiro.csllPercentual ? `${financeiro.csllPercentual}%` : undefined} />
                  <DataRow label="IRPJ" value={financeiro.irpjPercentual ? `${financeiro.irpjPercentual}%` : undefined} />
                </>
              )}
            </div>

            {/* Configurações Gerais */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={16} className="text-text" />
                <p className="text-xs font-medium text-text">Configurações Gerais</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DataRow label="CFOP" value={financeiro.cfop} />
                <div className="space-y-1">
                  <p className="text-xs text-text">Contribuinte</p>
                  <div className="flex gap-2">
                    {financeiro.contribuinteICMS && (
                      <Badge variant="success" size="sm">ICMS</Badge>
                    )}
                    {financeiro.contribuinteISS && (
                      <Badge variant="success" size="sm">ISS</Badge>
                    )}
                    {!financeiro.contribuinteICMS && !financeiro.contribuinteISS && (
                      <span className="text-xs text-text">Nenhum</span>
                    )}
                  </div>
                </div>
                {financeiro.comentariosAdicionais && (
                  <div className="col-span-2 space-y-1">
                    <p className="text-xs text-text">Comentários Adicionais</p>
                    <p className="text-sm text-fg bg-card rounded p-3">{financeiro.comentariosAdicionais}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem Final */}
        <div className="flex items-start gap-3 p-4 bg-emerald-900/20 border border-emerald-700 rounded-lg">
          <CheckCircle2 size={20} className="text-emerald-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-emerald-300 font-semibold">Tudo pronto para começar!</p>
            <p className="text-xs text-emerald-400 mt-1">
              Clique em <strong>Finalizar</strong> para criar sua empresa e configurar o sistema. Todos os usuários receberão emails para definir suas senhas de acesso.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}