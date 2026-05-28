import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserCheck, Users, Plus, Trash2, Mail, Shield } from 'lucide-react';
import { Field, Input, Button, Badge } from '../../../../shared/components/ui';
import { adminSchema, AdminFormData, outrosUsuariosSchema, OutrosUsuariosFormData } from '../../schemas/onboardingSchema';
import { OnboardingStepProps } from '../../types/onboardingTypes';

interface CombinedUserData {
  admin: AdminFormData;
  outrosUsuarios: OutrosUsuariosFormData;
}

interface StepUsuariosProps extends OnboardingStepProps<CombinedUserData> { }

export function StepUsuarioAdmin({ data, onChange }: StepUsuariosProps) {
  const adminForm = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
    defaultValues: data.admin,
    mode: 'onChange'
  });

  const outrosUsuariosForm = useForm<OutrosUsuariosFormData>({
    resolver: zodResolver(outrosUsuariosSchema),
    defaultValues: data.outrosUsuarios,
    mode: 'onChange'
  });

  const { register: registerAdmin, watch: watchAdmin, formState: { errors: adminErrors } } = adminForm;
  const { register: registerUsuarios, control, watch: watchUsuarios, formState: { errors: usuariosErrors } } = outrosUsuariosForm;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "usuarios"
  });

  const adicionarUsuario = () => {
    append({
      nome: '',
      email: '',
      cargo: '',
      permissoes: {
        vendas: false,
        compras: false,
        estoque: false,
        financeiro: false,
        admin: false
      }
    });
  };

  const getPermissionBadges = (permissoes: any) => {
    return Object.entries(permissoes)
      .filter(([_, value]) => value)
      .map(([key, _]) => {
        const variants = {
          admin: 'admin',
          vendas: 'vendas',
          compras: 'compras',
          estoque: 'estoque',
          financeiro: 'financeiro'
        } as const;

        const labels = {
          admin: 'Administrador',
          vendas: 'Vendas',
          compras: 'Compras',
          estoque: 'Estoque',
          financeiro: 'Financeiro'
        } as const;

        return (
          <Badge key={key} variant={variants[key as keyof typeof variants]} size="sm">
            {labels[key as keyof typeof labels]}
          </Badge>
        );
      });
  };

  // Sync com hook principal
  useEffect(() => {
    const adminSubscription = watchAdmin((adminData) => {
      onChange({
        admin: adminData as AdminFormData,
        outrosUsuarios: data.outrosUsuarios
      });
    });

    const usuariosSubscription = watchUsuarios((usuariosData) => {
      onChange({
        admin: data.admin,
        outrosUsuarios: usuariosData as OutrosUsuariosFormData
      });
    });

    return () => {
      adminSubscription.unsubscribe();
      usuariosSubscription.unsubscribe();
    };
  }, [watchAdmin, watchUsuarios, onChange, data]);

  return (
    <section className=" text-fg rounded-2xl">
      <div className="flex items-center gap-3 mb-2">
        <Users size={25} className="text-text" />
        <h3 className="font-semibold text-text text-lg">Usuários do Sistema</h3>
      </div>
      <div className="border-b border border-card h-[0.1px] w-full mb-4"></div>

      <div className="space-y-6">
        {/* Usuário Administrador */}
        <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={20} className="text-purple-600" />
            <h4 className="font-semibold text-purple-800">Administrador Principal</h4>
            <Badge variant="admin" size="sm">Administrador</Badge>
          </div>

          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nome Completo *" error={adminErrors.nome?.message}>
                <Input
                  placeholder="Ex: João Silva"
                  {...registerAdmin('nome')}
                />
              </Field>

              <Field label="Email *" error={adminErrors.email?.message}>
                <Input
                  type="email"
                  placeholder="joao@empresa.com"
                  {...registerAdmin('email')}
                />
              </Field>
            </div>

            <Field label="Cargo">
              <Input
                placeholder="Administrador"
                {...registerAdmin('cargo')}
              />
            </Field>

            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Mail size={16} className="text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-medium">
                  Definição de senha via email
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Um email será enviado para definir a senha de acesso após a finalização do cadastro.
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Outros Usuários */}
        <div className="border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users size={20} className="text-primary" />
              <h4 className="font-semibold">Outros Usuários</h4>
              <span className="text-sm text-text bg-neutral-100 px-2 py-1 rounded">
                Opcional
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={adicionarUsuario}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Adicionar Usuário
            </Button>
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-8 text-text">
              <Users size={48} className="mx-auto mb-3 opacity-30" />
              <p>Nenhum usuário adicional</p>
              <p className="text-sm mt-1">Você pode adicionar outros usuários agora ou depois nas configurações</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border border-neutral-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">Usuário {index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field
                      label="Nome *"
                      error={usuariosErrors.usuarios?.[index]?.nome?.message}
                    >
                      <Input
                        placeholder="Nome completo"
                        {...registerUsuarios(`usuarios.${index}.nome`)}
                      />
                    </Field>

                    <Field
                      label="Email *"
                      error={usuariosErrors.usuarios?.[index]?.email?.message}
                    >
                      <Input
                        type="email"
                        placeholder="email@empresa.com"
                        {...registerUsuarios(`usuarios.${index}.email`)}
                      />
                    </Field>

                    <Field label="Cargo" className="md:col-span-2">
                      <Input
                        placeholder="Ex: Vendedor, Comprador, etc"
                        {...registerUsuarios(`usuarios.${index}.cargo`)}
                      />
                    </Field>
                  </div>

                  {/* Permissões */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Permissões</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { key: 'vendas', label: 'Vendas' },
                        { key: 'compras', label: 'Compras' },
                        { key: 'estoque', label: 'Estoque' },
                        { key: 'financeiro', label: 'Financeiro' },
                        { key: 'admin', label: 'Administrador' }
                      ].map(perm => (
                        <label key={perm.key} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            {...registerUsuarios(`usuarios.${index}.permissoes.${perm.key as keyof typeof field.permissoes}`)}
                            className="rounded border-border"
                          />
                          {perm.label}
                        </label>
                      ))}
                    </div>

                    {/* Preview das permissões selecionadas */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {getPermissionBadges(field.permissoes)}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
                    <Mail size={12} className="mt-0.5" />
                    <span>Receberá email para definir senha</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}