import { useState } from 'react';
import { Shield, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { Field, Input, Button } from '../../../../shared/components/ui';
import { AdminFormData } from '../../schemas/onboardingSchema';

interface StepAdminProps {
  data: AdminFormData;
  onChange: (data: AdminFormData) => void;
}

type PasswordChecks = {
  length: boolean;
  number: boolean;
  upperLower: boolean;
  symbol: boolean;
};

const getPasswordChecks = (password: string): PasswordChecks => ({
  length: password.length >= 8,
  number: /\d/.test(password),
  upperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
  symbol: /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`';]/.test(password),
});

function StrengthBar({ password }: { password: string }) {
  const checks = getPasswordChecks(password);
  const score = Object.values(checks).filter(Boolean).length;

  const level = score <= 1 ? "weak" : score <= 3 ? "medium" : "strong";
  const filled = score === 0 ? 0 : score <= 1 ? 1 : score <= 3 ? 2 : 3;

  const barColor = (idx: number) => {
    if (filled === 0) return "bg-neutral-300 dark:bg-neutral-700";
    if (level === "weak") return idx < filled ? "bg-red-500" : "bg-neutral-300 dark:bg-neutral-700";
    if (level === "medium") return idx < filled ? "bg-yellow-500" : "bg-neutral-300 dark:bg-neutral-700";
    return idx < filled ? "bg-green-500" : "bg-neutral-300 dark:bg-neutral-700";
  };

  const label =
    level === "weak" ? "Senha fraca" : level === "medium" ? "Senha média" : "Senha forte";

  return (
    <div className="mt-2">
      <div className="flex items-center gap-1">
        <div className={`h-1.5 flex-1 rounded ${barColor(0)} transition-all duration-300`} />
        <div className={`h-1.5 flex-1 rounded ${barColor(1)} transition-all duration-300`} />
        <div className={`h-1.5 flex-1 rounded ${barColor(2)} transition-all duration-300`} />
      </div>
      {password ? (
        <div className="mt-2 text-xs font-medium text-text">{label}</div>
      ) : null}
    </div>
  );
}

function PasswordChecklist({ password }: { password: string }) {
  const checks = getPasswordChecks(password);
  const Item = ({ ok, children }: { ok: boolean; children: React.ReactNode }) => (
    <li className="flex items-center gap-2 text-xs">
      {ok ? (
        <CheckCircle size={16} className="text-green-500" />
      ) : (
        <XCircle size={16} className="text-red-500" />
      )}
      <span className="text-fg">{children}</span>
    </li>
  );

  return (
    <ul className="mt-3 grid grid-cols-2 gap-y-1 gap-x-4">
      <Item ok={checks.length}>Mínimo de 8 caracteres</Item>
      <Item ok={checks.upperLower}>Maiúsculas e minúsculas</Item>
      <Item ok={checks.number}>Números</Item>
      <Item ok={checks.symbol}>Símbolos</Item>
    </ul>
  );
}

export function StepAdmin({ data, onChange }: StepAdminProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChange = (field: keyof AdminFormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const passwordsMatch = data.senha && confirmPassword && data.senha === confirmPassword;
  const checks = getPasswordChecks(data.senha || '');
  const allChecksPass = Object.values(checks).every(Boolean);

  return (
    <section className=" rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <Shield size={24} className="text-primary" />
        <div>
          <h3 className="text-lg font-semibold text-fg">Administrador Principal</h3>
          <p className="text-sm text-text">
            Configure o usuário administrador que terá acesso total ao sistema
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Nome Completo */}
        <Field label="Nome Completo *">
          <Input
            type="text"
            placeholder="Ex: João Silva"
            value={data.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
          />
        </Field>

        {/* Email */}
        <Field label="Email *">
          <Input
            type="email"
            placeholder="joao@empresa.com"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </Field>

        {/* Cargo */}
        <Field label="Cargo">
          <Input
            type="text"
            placeholder="Administrador"
            value={data.cargo}
            onChange={(e) => handleChange('cargo', e.target.value)}
          />
        </Field>

        {/* Senha */}
        <Field label="Senha *">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={data.senha}
              onChange={(e) => handleChange('senha', e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text hover:text-fg"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <StrengthBar password={data.senha || ''} />
          <PasswordChecklist password={data.senha || ''} />
        </Field>

        {/* Confirmar Senha */}
        <Field label="Confirmar Senha *">
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text hover:text-fg"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {confirmPassword && !passwordsMatch && (
            <p className="text-xs text-red-500 mt-1">As senhas não coincidem</p>
          )}
          {confirmPassword && passwordsMatch && (
            <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
              <CheckCircle size={14} /> As senhas coincidem
            </p>
          )}
        </Field>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Usuário Administrador
            </p>
            <p className="text-blue-700 dark:text-blue-300">
              Este usuário terá permissões completas no sistema, incluindo gerenciamento de outros usuários,
              configurações e acesso a todos os módulos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
