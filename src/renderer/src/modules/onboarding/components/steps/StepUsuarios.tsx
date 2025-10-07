import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Plus, Trash2, Info, Edit, Check, X } from 'lucide-react';
import { Input, Button, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../shared/components/ui';
import { OutrosUsuariosFormData, AdminFormData } from '../../schemas/onboardingSchema';
import { StepUsuariosLabels as Labels } from '../Labels';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';

interface StepUsuariosProps {
  data: OutrosUsuariosFormData & { admin: AdminFormData };
  onChange: (data: OutrosUsuariosFormData) => void;
  onBack?: () => void;
  onNext?: () => void;
}

const cargosPermissoes = {
  Administrador: { vendas: true, compras: true, estoque: true, financeiro: true, admin: true },
  Financeiro: { vendas: false, compras: false, estoque: false, financeiro: true, admin: false },
  Engenharia: { vendas: false, compras: false, estoque: false, financeiro: false, admin: false },
  Gerente: { vendas: true, compras: true, estoque: true, financeiro: true, admin: false },
  Vendedor: { vendas: true, compras: false, estoque: false, financeiro: false, admin: false },
  Comprador: { vendas: false, compras: true, estoque: true, financeiro: false, admin: false },
  Estoquista: { vendas: false, compras: false, estoque: true, financeiro: false, admin: false },
} as const;

type CargoKey = keyof typeof cargosPermissoes;
const cargoOptions = Object.keys(cargosPermissoes) as CargoKey[];

export function StepUsuarios({ data, onChange, onBack, onNext }: StepUsuariosProps) {
  const form = useForm<OutrosUsuariosFormData>({
    defaultValues: {
      usuarios: data.usuarios || []
    },
    mode: 'onChange'
  });

  const { register, control, watch, setValue, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({ control, name: 'usuarios' });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: number]: string }>({});

  // Sincroniza para o pai
  useEffect(() => {
    const subscription = watch((value) => {
      onChange({ usuarios: value.usuarios || [] });
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  const handleAddUser = () => {
    const newUser = {
      nome: '',
      email: '',
      cargo: 'Vendedor' as CargoKey,
      permissoes: cargosPermissoes['Vendedor']
    };
    append(newUser);
    setEditingIndex(fields.length); // Começa a editar o novo usuário
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleSave = (index: number) => {
    const user = watch(`usuarios.${index}`);

    // Validação: não permite salvar usuário sem nome, email ou cargo
    if (!user.nome?.trim() || !user.email?.trim() || !user.cargo) {
      setValidationErrors(prev => ({
        ...prev,
        [index]: 'Preencha todos os campos obrigatórios (nome, email e cargo)'
      }));
      return; // Não salva se campos obrigatórios estão vazios
    }

    // Remove erro se existir
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });

    setEditingIndex(null);

    // Força uma sincronização imediata após salvar
    const usuarios = watch('usuarios') || [];
    onChange({ usuarios });
  };

  const handleCancel = (index: number) => {
    // Se for um novo usuário (ainda vazio), remove. Senão, reverte.
    const user = watch(`usuarios.${index}`);
    if (!user.nome?.trim() && !user.email?.trim()) {
      remove(index);
    }

    // Remove erro se existir
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });

    setEditingIndex(null);
    // O RHF mantém o estado anterior, então não é preciso reverter manualmente.
  };

  const handleRoleChange = (index: number, cargo: CargoKey) => {
    setValue(`usuarios.${index}.cargo`, cargo);
    setValue(`usuarios.${index}.permissoes`, cargosPermissoes[cargo]);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' && editingIndex === index) {
      e.preventDefault();
      handleSave(index);
    }
  };

  const validateAllUsers = () => {
    const usuarios = watch('usuarios');
    // Usuários opcionais - sempre válido
    if (!usuarios || usuarios.length === 0) return true;

    // Valida usuários que foram preenchidos
    return usuarios.every(user =>
      user.nome?.trim() &&
      user.email?.trim() &&
      user.cargo &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)
    );
  };

  const handleContinue = () => {
    if (editingIndex !== null) {
      // Se tem usuário sendo editado, não permite continuar
      return;
    }

    if (validateAllUsers() && onNext) {
      onNext();
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Info size={18} className="text-muted-foreground" />
            <h3 className="text-lg font-semibold text-text">{Labels.title}</h3>
          </div>
          <Button variant="success" size="sm" leftIcon={<Plus size={18} />} onClick={handleAddUser}>
            {Labels.addUser}
          </Button>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Usuários Opcionais</p>
              <p className="text-blue-700 dark:text-blue-300">
                Você pode adicionar outros usuários agora ou depois através das configurações do sistema.
                Este passo é opcional e você pode pular se desejar.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border rounded-lg border border-border">
          {fields.length === 0 && (
            <div className="px-4 py-8 text-center text-muted-foreground">{Labels.noUsersAdded}</div>
          )}

          {fields.map((field, index) => {
            const isEditing = editingIndex === index;

            return (
              <div key={field.id} onKeyDown={(e) => handleKeyDown(e, index)}>
                <div className={`flex items-center justify-between gap-4 px-4 py-3 ${isEditing ? 'bg-muted/50' : ''}`}>
                  {/* Nome e Email */}
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <Input
                        {...register(`usuarios.${index}.nome`, { required: Labels.obrigatory })}
                        placeholder={Labels.placeholders.fullName}
                        readOnly={!isEditing}
                        className={`h-9 ${!isEditing ? 'border-transparent bg-transparent' : ''}`}
                      />
                      {errors.usuarios?.[index]?.nome && <span className="text-xs text-red-500">{errors.usuarios[index].nome.message}</span>}
                    </div>
                    <div className="flex flex-col">
                      <Input
                        {...register(`usuarios.${index}.email`, {
                          required: Labels.obrigatory,
                          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
                        })}
                        placeholder={Labels.placeholders.email}
                        readOnly={!isEditing}
                        className={`h-9 ${!isEditing ? 'border-transparent bg-transparent' : ''}`}
                      />
                      {errors.usuarios?.[index]?.email && <span className="text-xs text-red-500">{errors.usuarios[index].email.message}</span>}
                    </div>
                  </div>

                  {/* Cargo */}
                  <div className="w-48">
                    {isEditing ? (
                      <Select
                        value={watch(`usuarios.${index}.cargo`)}
                        onValueChange={(value) => handleRoleChange(index, value as CargoKey)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder={Labels.table.role} />
                        </SelectTrigger>
                        <SelectContent>
                          {cargoOptions.map(cargo => (
                            <SelectItem key={cargo} value={cargo}>{Labels.roles[cargo]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="secondary">
                        {Labels.roles[watch(`usuarios.${index}.cargo`)]}
                      </Badge>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleSave(index)} className="text-green-600 hover:text-green-700">
                              <Check size={18} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{Labels.tooltips.saveUser}</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleCancel(index)} className="text-red-600 hover:text-red-700">
                              <X size={18} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{Labels.tooltips.cancelEdit}</TooltipContent>
                        </Tooltip>
                      </>
                    ) : (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(index)} className="text-muted-foreground hover:text-text">
                              <Edit size={18} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{Labels.tooltips.editUser}</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => remove(index)} className="text-muted-foreground hover:text-red-600">
                              <Trash2 size={18} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{Labels.tooltips.deleteUser}</TooltipContent>
                        </Tooltip>
                      </>
                    )}
                  </div>
                </div>
                {validationErrors[index] && (
                  <div className="px-4 py-2 bg-red-50 border-l-4 border-red-400">
                    <p className="text-sm text-red-700">{validationErrors[index]}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>


      </div>
    </TooltipProvider>
  );
}

