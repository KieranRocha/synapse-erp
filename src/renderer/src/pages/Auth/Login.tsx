import { useEffect, useState, ChangeEvent, FormEvent, ReactNode } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2Icon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/contexts/AuthContext";
import logoSrc from "../../assets/logo-dark.svg";
import { Button } from "../../shared/components/ui/Button";

/*****************************
 * Helpers (validators)
 *****************************/
const validateEmail = (v: string): { isValid: boolean; error?: string } => {
    const email = (v || "").trim();
    if (!email) return { isValid: false, error: "E-mail é obrigatório" };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, error: "Formato de e-mail inválido" };
    }

    return { isValid: true };
};

const validatePassword = (v: string): { isValid: boolean; error?: string } => {
    const password = (v || "").trim();
    if (!password) return { isValid: false, error: "Senha é obrigatória" };

    if (password.length < 6) {
        return { isValid: false, error: "Senha deve ter no mínimo 6 caracteres" };
    }

    return { isValid: true };
};



/*****************************
 * Minimal Input (same visual style do Auth Minimal)
 *****************************/
function Field({
    label,
    type = "text",
    icon: Icon,
    value,
    onChange,
    error,
    autoComplete,
    placeholder,
    rightSlot,
}: {
    label: string;
    type?: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    autoComplete?: string;
    placeholder?: string;
    rightSlot?: ReactNode;
}) {
    return (
        <label className="block w-full">
            <span className="text-sm text-text">{label}</span>
            <div
                className={`mt-1 flex items-center gap-2 rounded-lg bg-card px-3  ${error ? " border border-red-400" : "border-gray-300"
                    }`}
            >
                {Icon ? <Icon size={16} className="text-gray-400" /> : null}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className="w-full py-2 outline-none bg-transparent placeholder-gray-400 text-fg"
                />
                {rightSlot}
            </div>
            {error ? (
                <span className="text-xs text-red-600 mt-1 block">{error}</span>
            ) : null}
        </label>
    );
}

/*****************************
 * Login Only Screen
 *****************************/
export default function AuthLogin({
    brand = "ERP Synapse",
}: {
    brand?: string;
}) {
    const navigate = useNavigate();
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(true);
    const [showPass, setShowPass] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [retryCount, setRetryCount] = useState(0); const [submitting, setSubmitting] = useState(false);

    // remember me (só mock/localStorage)
    useEffect(() => {
        const saved = localStorage.getItem("erp-auth-email");
        if (saved) setEmail(saved);
    }, []);

    const submit = async (e: FormEvent) => {
        e.preventDefault();

        // Limpa erros anteriores
        setErrors({});

        // validação ANTES de chamar login()
        const emailValidation = validateEmail(email);
        const passwordValidation = validatePassword(password);
        const errs: typeof errors = {};

        if (!emailValidation.isValid) errs.email = emailValidation.error;
        if (!passwordValidation.isValid) errs.password = passwordValidation.error;

        // Se há erros, mostra e para aqui (SEM chamar login)
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        try {
            setSubmitting(true);
            await login(email, password);

            if (remember) localStorage.setItem("erp-auth-email", email);

            setRetryCount(0);
            setSubmitting(false);
        } catch (error: unknown) {
            const isBackendError = (
                e: unknown
            ): e is { code?: string; message?: string; details?: any } =>
                !!e && typeof e === "object" && "code" in (e as any);

            if (isBackendError(error)) {
                switch (error.code) {
                    case "AUTH_EMAIL_NOT_FOUND":
                        setErrors(prev => ({ ...prev, email: "E-mail não encontrado" }));
                        break;
                    case "AUTH_INVALID_CREDENTIALS":
                        setErrors(prev => ({ ...prev, password: "Senha incorreta" }));
                        setRetryCount((r) => r + 1);
                        break;
                    default:
                        break;
                }
            } else {
                console.error("Erro inesperado:", error);
            }
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center bg-bg justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-sm">

                {/* Brand */}
                <div className="flex items-center gap-2 mb-6 justify-center">
                    <img src={logoSrc} alt="Logo" className="h-20 w-auto" />
                </div>

                {/* Card */}
                <div className="">

                    <form onSubmit={submit} className="space-y-3">
                        <Field
                            label="E-mail"
                            icon={Mail}
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(prev => ({ ...prev, email: undefined })); }}
                            error={errors.email}
                            placeholder="voce@empresa.com"
                            autoComplete="email"
                            type="email"

                        />

                        <Field
                            label="Senha"
                            icon={Lock}
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(prev => ({ ...prev, password: undefined })); }}
                            error={errors.password}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            type={showPass ? "text" : "password"}
                            rightSlot={
                                <button
                                    type="button"
                                    onClick={() => setShowPass((s) => !s)}
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                    aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            }
                        />

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 select-none">
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                />
                                <span className="text-sm text-gray-700">Manter conectado</span>
                            </label>

                            <button
                                type="button"
                                onClick={() => navigate("/auth/forgot-password")}
                                className='text-xs text-neutral-600 underline cursor-pointer hover:text-neutral-500'
                            >
                                Esqueci minha senha
                            </button>
                        </div>

                        <Button
                            type="submit"
                            disabled={submitting || !email || !password}
                            variant={!email || !password ? "danger" : "success"}
                            className={`w-full py-2.5 rounded-lg cursor-pointer disabled:cursor-pointer`}                        >
                            {submitting ? <Loader2Icon className="animate-spin" /> : "Entrar"}
                        </Button>
                    </form>

                </div>

                {/* Footer */}
                <p className="text-[11px] text-gray-500 text-center mt-3">
                    © {new Date().getFullYear()} — {brand}
                </p>
            </div>
        </div>
    );
}

/*****************************
 * Dev tests (run only in dev)
 *****************************/
if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
    console.assert(validateEmail("a@b.com").isValid === true, "Email válido falhou");
    console.assert(validateEmail("x").isValid === false, "Email inválido passou");
    console.assert(validatePassword("123456").isValid === true, "Senha mínima falhou");
    console.assert(validatePassword("123").isValid === false, "Senha curta passou");
    console.assert(validateEmail("").isValid === false, "Email vazio passou");
    console.assert(validatePassword("").isValid === false, "Senha vazia passou");
}


