import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Lock, Eye, EyeOff, Loader2Icon, CheckCircle, AlertCircle, XCircle, } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import logoSrc from "../../assets/logo-dark.svg";
import { Button } from "../../shared/components/ui/Button";
import { apiService } from "../../shared/services/apiService";


type PasswordChecks = {
    length: boolean;
    number: boolean;
    upperLower: boolean;
    symbol: boolean;
};
const getPasswordChecks = (password: string): PasswordChecks => ({
    length: password.length >= 8,                              // mínimo 8
    number: /\d/.test(password),                               // Números
    upperLower: /[a-z]/.test(password) && /[A-Z]/.test(password), // Maiúsculas e minúsculas
    symbol: /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`';]/.test(password), // Símbolos
});
const validatePassword = (v: string): { isValid: boolean; error?: string } => {
    const password = (v || "").trim();
    if (!password) return { isValid: false, error: "Nova senha é obrigatória" };
    if (password.length < 8) return { isValid: false, error: "Senha deve ter no mínimo 8 caracteres" };
    return { isValid: true };
};
function StrengthBar({ password }: { password: string }) {
    const checks = getPasswordChecks(password);
    const score = Object.values(checks).filter(Boolean).length; // 0..4

    // Mapeia score -> nível e quantas barras preenche
    // 0–1 => weak (1 barra) | 2–3 => medium (2 barras) | 4 => strong (3 barras)
    const level = score <= 1 ? "weak" : score <= 3 ? "medium" : "strong";
    const filled = score === 0 ? 0 : score <= 1 ? 1 : score <= 3 ? 2 : 3;

    const barColor = (idx: number) => {
        if (filled === 0) return "bg-neutral-700/60";
        if (level === "weak") return idx < filled ? "bg-red-500" : "bg-neutral-700/60";
        if (level === "medium") return idx < filled ? "bg-yellow-500" : "bg-neutral-700/60";
        return idx < filled ? "bg-green-500" : "bg-neutral-700/60";
    };

    const label =
        level === "weak" ? "Senha fraca" : level === "medium" ? "Senha média" : "Senha forte";

    return (
        <div className="mt-2">
            {/* 3 barras independentes */}
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
    const Item = ({
        ok,
        children,
    }: {
        ok: boolean;
        children: React.ReactNode;
    }) => (
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
const getStrengthInfo = (checks: PasswordChecks) => {
    const score = Object.values(checks).filter(Boolean).length; // 0..4
    const level = score <= 1 ? "weak" : score <= 3 ? "medium" : "strong"; // weak/medium/strong
    const widthClass =
        score === 0 ? "w-0"
            : score === 1 ? "w-1/4"
                : score === 2 ? "w-1/2"
                    : score === 3 ? "w-3/4"
                        : "w-full";
    const colorClass =
        level === "weak" ? "bg-red-500"
            : level === "medium" ? "bg-yellow-500"
                : "bg-green-500";
    const label =
        level === "weak" ? "Senha fraca"
            : level === "medium" ? "Senha média"
                : "Senha forte";
    return { score, level, widthClass, colorClass, label };
};

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
    rightSlot?: React.ReactNode;
}) {
    return (
        <div className="w-full">
            <label className="block text-sm text-text mb-1">{label}</label>
            <div
                className={`flex items-center gap-2 rounded-lg bg-card px-3 border ${error ? "border-red-400" : ""
                    }`}
            >
                {Icon && <Icon size={16} className="text-gray-400" />}
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
            {error && (
                <span className="text-xs text-red-600 mt-1 block">{error}</span>
            )}
        </div>
    );
}

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; token?: string }>({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [validatingToken, setValidatingToken] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [userInfo, setUserInfo] = useState<{ nome: string; email: string } | null>(null);
    const [redirecting, setRedirecting] = useState(false);

    // Check if running in Electron
    const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;

    // Validate token on component mount
    useEffect(() => {
        const handleToken = async () => {
            console.log('🔍 ResetPassword component token:', token);
            console.log('🖥️ Running in Electron:', isElectron);

            if (!token) {
                console.log('❌ No token provided in URL parameters');
                setErrors({ token: "Token de recuperação não fornecido" });
                setValidatingToken(false);
                return;
            }

            // If running in browser, attempt to redirect to app
            if (!isElectron) {
                console.log('🌐 Running in browser - attempting to redirect to app');

                // Try to open the app first
                const protocolScheme = 'synapseapp';
                const customProtocolUrl = `${protocolScheme}://reset-password?token=${token}`;

                console.log('🚀 Attempting to launch app with URL:', customProtocolUrl);

                // Set redirecting state
                setRedirecting(true);
                setValidatingToken(false);

                // Try to open the custom protocol
                try {
                    window.location.href = customProtocolUrl;
                    // Don't set timeout - keep loading state until user opens Electron
                } catch (error) {
                    console.error('❌ Failed to redirect to app:', error);
                    // Even on error, keep the redirecting state
                }

                return;
            }

            // If in Electron, validate the token normally
            try {
                console.log('📡 Calling API validatePasswordResetToken with:', token);
                const result = await apiService.validatePasswordResetToken(token);
                console.log('📨 API validation result:', result);

                if (result.valid && result.user) {
                    console.log('✅ Token is valid for user:', result.user.email);
                    setTokenValid(true);
                    setUserInfo({ nome: result.user.nome, email: result.user.email });
                } else {
                    console.log('❌ Token validation returned invalid');
                    setErrors({ token: "Token de recuperação inválido ou expirado" });
                }
            } catch (error) {
                console.error("❌ Error validating token:", error);
                setErrors({ token: error instanceof Error ? error.message : "Erro ao validar token de recuperação" });
            } finally {
                setValidatingToken(false);
            }
        };

        handleToken();
    }, [token, isElectron]);

    const submit = async (e: FormEvent) => {
        e.preventDefault();

        setErrors({});

        const passwordValidation = validatePassword(password);
        const errs: typeof errors = {};

        if (!passwordValidation.isValid) {
            errs.password = passwordValidation.error;
        }

        if (password !== confirmPassword) {
            errs.confirmPassword = "As senhas não coincidem";
        }

        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        try {
            setSubmitting(true);

            await apiService.resetPassword(token!, password);

            setSuccess(true);
        } catch (error: unknown) {
            console.error("Erro ao redefinir senha:", error);
            if (error instanceof Error) {
                setErrors({ token: error.message });
            } else {
                setErrors({ token: "Erro interno. Tente novamente." });
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Loading state while validating token
    if (validatingToken) {
        return (
            <div className="min-h-screen flex items-center bg-bg justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-sm text-center">
                    <div className="flex items-center gap-2 mb-6 justify-center">
                        <img src={logoSrc} alt="Logo" className="h-20 w-auto" />
                    </div>
                    <Loader2Icon className="animate-spin mx-auto mb-4" size={32} />
                    <p className="text-sm text-text">Validando token de recuperação...</p>
                </div>
            </div>
        );
    }

    // Redirecting state (attempting to open app)
    if (redirecting) {
        return (
            <div className="min-h-screen flex items-center bg-bg justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-sm text-center">
                    <div className="flex items-center gap-2 mb-6 justify-center">
                        <img src={logoSrc} alt="Logo" className="h-20 w-auto" />
                    </div>
                    <Loader2Icon className="animate-spin mx-auto mb-4 text-neutral-500" size={32} />
                    <h2 className="text-xl font-semibold text-fg mb-2">Redirecionando...</h2>
                    <p className="text-sm text-text">Abrindo o app ERP Synapse para redefinir sua senha.</p>
                </div>
            </div>
        );
    }

    // Success state
    if (success) {
        return (
            <div className="min-h-screen flex items-center bg-bg justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-sm">
                    <div className="flex items-center gap-2 mb-6 justify-center">
                        <img src={logoSrc} alt="Logo" className="h-20 w-auto" />
                    </div>

                    <div className="text-center space-y-4">
                        <CheckCircle size={48} className="text-green-500 mx-auto" />
                        <h2 className="text-xl font-semibold text-fg">Senha redefinida!</h2>
                        <p className="text-sm text-text">
                            Sua senha foi alterada com sucesso. Agora você pode fazer login com sua nova senha.
                        </p>

                        <div className="pt-4">
                            <Button
                                type="button"
                                onClick={() => navigate("/auth/login")}
                                variant="success"
                                className="w-full py-2.5 rounded-lg"
                            >
                                Ir para o login
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    // Error state (invalid token)
    if (!tokenValid && errors.token && !redirecting) {
        return (
            <div className="min-h-screen flex items-center bg-bg justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    <div className="flex items-center gap-2 mb-6 justify-center">
                        <img src={logoSrc} alt="Logo" className="h-20 w-auto" />
                    </div>

                    <div className="text-center space-y-4">
                        <AlertCircle size={48} className="text-red-500 mx-auto" />
                        <h2 className="text-xl font-semibold text-fg">Token inválido</h2>
                        <p className="text-sm text-text">
                            {errors.token || "O link de recuperação é inválido ou expirou."}
                        </p>
                        <p className="text-xs text-text">
                            Solicite um novo link de recuperação de senha.
                        </p>

                        <div className="pt-4 space-y-2">
                            <Button
                                type="button"
                                onClick={() => navigate("/auth/forgot-password")}
                                variant="success"
                                className="w-full py-2.5 rounded-lg"
                            >
                                Solicitar novo link
                            </Button>
                            <Button
                                type="button"
                                onClick={() => navigate("/auth/login")}
                                variant="outline"
                                className="w-full py-2.5 rounded-lg"
                            >
                                Voltar para o login
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const checks = getPasswordChecks(password);
    const allOk = Object.values(checks).every(Boolean);
    const canSubmit = !submitting && password && confirmPassword && allOk && password === confirmPassword;
    return (
        <div className="min-h-screen flex items-center bg-bg justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-sm">

                <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-fg mb-2">Redefinir senha</h2>
                    {userInfo && (
                        <p className="text-sm text-text">
                            Olá, <strong>{userInfo.nome}</strong>. Digite sua nova senha abaixo.
                        </p>
                    )}
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <Field
                        label="Nova senha"
                        icon={Lock}
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                        }}
                        error={errors.password}
                        placeholder="••••••••"
                        autoComplete="new-password"
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



                    <Field
                        label="Confirmar nova senha"
                        icon={Lock}
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                        }}
                        error={errors.confirmPassword}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        type={showConfirmPass ? "text" : "password"}
                        rightSlot={
                            <button
                                type="button"
                                onClick={() => setShowConfirmPass((s) => !s)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                aria-label={showConfirmPass ? "Ocultar senha" : "Mostrar senha"}
                            >
                                {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        }
                    />
                    {password && confirmPassword && password !== confirmPassword && (
                        <p className="text-xs text-red-500 ">As senhas não coincidem</p>
                    )}
                    <StrengthBar password={password} />
                    <PasswordChecklist password={password} />
                    <Button
                        type="submit"
                        disabled={!canSubmit}
                        variant={canSubmit ? "success" : "success"}
                        className="w-full py-2.5 rounded-lg"
                    >
                        {submitting ? <Loader2Icon className="animate-spin" /> : "Redefinir senha"}
                    </Button>
                </form>

                <div className="mt-4 text-center flex justify-center items-center">
                    <button
                        type="button"
                        onClick={() => navigate("/auth/login")}
                        className="text-sm text-neutral-600 underline cursor-pointer hover:text-neutral-500"
                    >
                        Voltar para o login
                    </button>
                </div>


            </div>
        </div>
    );
}