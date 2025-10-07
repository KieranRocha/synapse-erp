import { useState } from 'react';
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react';
import { Contato } from '../../../schemas/clienteSchema';
import { Input, Button } from '../../../../../shared/components/ui';

interface ContatosTableProps {
  contatos: Contato[];
  onAdd: (contato: Contato) => void;
  onEdit: (index: number, contato: Contato) => void;
  onRemove: (index: number) => void;
}

export function ContatosTable({ contatos, onAdd, onEdit, onRemove }: ContatosTableProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Contato>>({
    nome: '',
    cargo: '',
    email: '',
    telefone: '',
    celular: '',
    principal: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      nome: '',
      cargo: '',
      email: '',
      telefone: '',
      celular: '',
      principal: false,
    });
    setErrors({});
    setIsAdding(false);
    setEditingIndex(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome || formData.nome.trim().length < 3) {
      newErrors.nome = 'Nome deve ter no mínimo 3 caracteres';
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.telefone || formData.telefone.trim().length === 0) {
      newErrors.telefone = 'Telefone obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const novoContato: Contato = {
      id: editingIndex !== null ? contatos[editingIndex].id : `temp-${Date.now()}`,
      nome: formData.nome!,
      cargo: formData.cargo || '',
      email: formData.email!,
      telefone: formData.telefone!,
      celular: formData.celular || '',
      principal: formData.principal || false,
    };

    if (editingIndex !== null) {
      onEdit(editingIndex, novoContato);
    } else {
      onAdd(novoContato);
    }

    resetForm();
  };

  const handleEdit = (index: number) => {
    const contato = contatos[index];
    setFormData(contato);
    setEditingIndex(index);
    setIsAdding(true);
  };

  const formatTelefone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  return (
    <div className="space-y-4">
      {/* Tabela de contatos */}
      {contatos.length > 0 && (
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Nome</th>
                <th className="px-4 py-2 text-left font-medium">Cargo</th>
                <th className="px-4 py-2 text-left font-medium">Email</th>
                <th className="px-4 py-2 text-left font-medium">Telefone</th>
                <th className="px-4 py-2 text-left font-medium">Celular</th>
                <th className="px-4 py-2 text-center font-medium w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              {contatos.map((contato, index) => (
                <tr key={contato.id || index} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-2">
                    {contato.nome}
                    {contato.principal && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-primary/20 text-primary rounded">
                        Principal
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">{contato.cargo || '-'}</td>
                  <td className="px-4 py-2">{contato.email}</td>
                  <td className="px-4 py-2">{contato.telefone}</td>
                  <td className="px-4 py-2">{contato.celular || '-'}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(index)}
                        className="p-1.5 rounded hover:bg-primary/10 text-primary transition"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="p-1.5 rounded hover:bg-red-500/10 text-red-500 transition"
                        title="Remover"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Formulário de adicionar/editar */}
      {isAdding ? (
        <div className="border border-border rounded-lg p-4 bg-muted/20">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            {editingIndex !== null ? (
              <>
                <Pencil size={16} />
                Editar Contato
              </>
            ) : (
              <>
                <Plus size={16} />
                Novo Contato
              </>
            )}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium block mb-1">
                Nome *
              </label>
              <Input
                placeholder="Nome completo"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
              {errors.nome && (
                <p className="text-xs text-red-500 mt-1">{errors.nome}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Cargo
              </label>
              <Input
                placeholder="Ex.: Gerente"
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Email *
              </label>
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Telefone *
              </label>
              <Input
                placeholder="(00) 0000-0000"
                value={formData.telefone}
                onChange={(e) => {
                  const formatted = formatTelefone(e.target.value);
                  setFormData({ ...formData, telefone: formatted });
                }}
              />
              {errors.telefone && (
                <p className="text-xs text-red-500 mt-1">{errors.telefone}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Celular
              </label>
              <Input
                placeholder="(00) 00000-0000"
                value={formData.celular}
                onChange={(e) => {
                  const formatted = formatTelefone(e.target.value);
                  setFormData({ ...formData, celular: formatted });
                }}
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="principal"
                checked={formData.principal}
                onChange={(e) => setFormData({ ...formData, principal: e.target.checked })}
                className="w-4 h-4 rounded border-border"
              />
              <label htmlFor="principal" className="text-sm">
                Contato principal
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition inline-flex items-center gap-2 text-sm"
            >
              <Check size={16} />
              {editingIndex !== null ? 'Salvar Alterações' : 'Adicionar Contato'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition inline-flex items-center gap-2 text-sm"
            >
              <X size={16} />
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition inline-flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Plus size={16} />
          Adicionar Contato
        </button>
      )}
    </div>
  );
}
