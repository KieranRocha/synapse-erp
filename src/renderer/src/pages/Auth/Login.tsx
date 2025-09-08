import { useEffect, useState, ChangeEvent, FormEvent, ReactNode } from "react";
import { Factory, Mail, Lock, Eye, EyeOff, ArrowLeft, LoaderIcon, Loader2Icon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/contexts/AuthContext";
import logoSrc from "../../assets/logo-dark.svg";
import { Button } from "../../shared/components/ui/Button";
import { fromUnknown, emitToastForError } from "../../shared/errors/adapter";
import { useToast } from "../../shared/hooks/useToast";

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

const checkPasswordStrength = (password: string): { level: 'weak' | 'medium' | 'strong'; message: string } => {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const length = password.length;
    
    let score = 0;
    if (hasLower) score++;
    if (hasUpper) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;
    if (length >= 8) score++;
    if (length >= 12) score++;
    
    if (score < 3) return { level: 'weak', message: 'Senha fraca' };
    if (score < 5) return { level: 'medium', message: 'Senha média' };
    return { level: 'strong', message: 'Senha forte' };
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
    brand = "ERP Máquinas",
}: {
    brand?: string;
}) {
    const navigate = useNavigate();
    const { login, isLoading } = useAuth();
    const toast = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(true);
    const [showPass, setShowPass] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [retryCount, setRetryCount] = useState(0);

    // remember me (só mock/localStorage)
    useEffect(() => {
        const saved = localStorage.getItem("erp-auth-email");
        if (saved) setEmail(saved);
    }, []);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        
        // Validação dos campos
        const emailValidation = validateEmail(email);
        const passwordValidation = validatePassword(password);
        
        const errs: typeof errors = {};
        if (!emailValidation.isValid) errs.email = emailValidation.error;
        if (!passwordValidation.isValid) errs.password = passwordValidation.error;
        
        setErrors(errs);
        if (Object.keys(errs).length) return;

        try {
            await login(email, password);
            if (remember) localStorage.setItem("erp-auth-email", email);
            
            toast.success("Login realizado com sucesso!");
            setRetryCount(0); // Reset retry count on success
            
            // O redirecionamento será feito automaticamente pelo AuthGuard
        } catch (error) {
            console.error('🚨 [Login] Caught error:', error);
            console.error('🚨 [Login] Error type:', typeof error);
            console.error('🚨 [Login] Error instanceof Error:', error instanceof Error);
            
            const appErr = fromUnknown(error);
            console.log('🚨 [Login] Processed error:', appErr);
            
            // Emite toast baseado no tipo de erro
            console.log('🚨 [Login] Calling emitToastForError...');
            emitToastForError(toast, appErr);
            
            // Se é um erro retryable e não excedeu o limite de tentativas
            if (appErr.retryable && retryCount < 3) {
                setRetryCount(prev => prev + 1);
                setTimeout(() => {
                    toast.info(`Tentativa ${retryCount + 1} de 3...`);
                }, 2000);
            }
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
                            onChange={(e) => setEmail(e.target.value)}
                            error={errors.email}
                            placeholder="voce@empresa.com"
                            autoComplete="email"
                            type="email"

                        />

                        <Field
                            label="Senha"
                            icon={Lock}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                                onClick={() => setMessage("Funcionalidade em desenvolvimento")}
                                className="text-xs text-text underline cursor-pointer hover:underline"
                            >
                                Esqueci minha senha
                            </button>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading || !email || !password}
                            variant={!email || !password ? "danger" : "success"}
                            className={`w-full py-2.5 rounded-lg  }`}
                        >
                            {isLoading ? <Loader2Icon className="animate-spin" /> : "Entrar"}
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
