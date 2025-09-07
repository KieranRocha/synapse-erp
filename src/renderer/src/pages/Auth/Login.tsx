import { useEffect, useState, ChangeEvent, FormEvent, ReactNode } from "react";
import { Factory, Mail, Lock, Eye, EyeOff, ArrowLeft, LoaderIcon, Loader2Icon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/contexts/AuthContext";
import logoSrc from "../../assets/logo-dark.svg";
import { Button } from "@renderer/shared";

/*****************************
 * Helpers (validators)
 *****************************/
const validateEmail = (v: string) => /[^@\s]+@[^@\s]+\.[^@\s]+/.test(v);
const validatePassword = (v: string) => (v || "").trim().length >= 6;

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
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(true);
    const [showPass, setShowPass] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
    const [message, setMessage] = useState("");

    // remember me (só mock/localStorage)
    useEffect(() => {
        const saved = localStorage.getItem("erp-auth-email");
        if (saved) setEmail(saved);
    }, []);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        const errs: typeof errors = {};
        if (!validateEmail(email)) errs.email = "E-mail inválido";
        if (!validatePassword(password)) errs.password = "Mínimo de 6 caracteres";
        setErrors(errs);
        if (Object.keys(errs).length) return;

        try {
            await login(email, password);
            if (remember) localStorage.setItem("erp-auth-email", email);
            setMessage("Login realizado com sucesso!");
            // O redirecionamento será feito automaticamente pelo AuthGuard
        } catch (error) {
            console.error('Login error:', error);
            setErrors({ general: error instanceof Error ? error.message : "Erro ao fazer login" });
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

                    {errors.general ? (
                        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mt-4">{errors.general}</p>
                    ) : null}

                    {message ? (
                        <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 mt-4">{message}</p>
                    ) : null}
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
    console.assert(validateEmail("a@b.com") === true, "Email válido falhou");
    console.assert(validateEmail("x") === false, "Email inválido passou");
    console.assert(validatePassword("123456") === true, "Senha mínima falhou");
    console.assert(validatePassword("123") === false, "Senha curta passou");
}
