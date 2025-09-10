import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Mail, ArrowLeft, Loader2Icon, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoSrc from "../../assets/logo-dark.svg";
import { Button } from "../../shared/components/ui/Button";
import { apiService } from "../../shared/services/apiService";

const validateEmail = (v: string): { isValid: boolean; error?: string } => {
    const email = (v || "").trim();
    if (!email) return { isValid: false, error: "E-mail é obrigatório" };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, error: "Formato de e-mail inválido" };
    }

    return { isValid: true };
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
}: {
    label: string;
    type?: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    autoComplete?: string;
    placeholder?: string;
}) {
    return (
        <label className="block w-full">
            <span className="text-sm text-text">{label}</span>
            <div
                className={`mt-1 flex items-center gap-2 rounded-lg bg-card px-3 ${error ? " border border-red-400" : "border-gray-300"
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
            </div>
            {error ? (
                <span className="text-xs text-red-600 mt-1 block">{error}</span>
            ) : null}
        </label>
    );
}

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Countdown timer for resend button
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const submit = async (e: FormEvent) => {
        e.preventDefault();

        setError("");

        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            setError(emailValidation.error || "E-mail inválido");
            return;
        }

        try {
            setSubmitting(true);

            // Call the API for password reset request
            await apiService.requestPasswordReset(email);

            setSuccess(true);
            setCountdown(60); // Start 60-second countdown
        } catch (error: unknown) {
            console.error("Erro ao solicitar recuperação:", error);
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Erro interno. Tente novamente.");
            }
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <div className="min-h-screen flex items-center bg-bg justify-center py-12 px-4 sm:px-6 lg:px-8 ">
            <div className="w-full max-w-sm ">

                <div className="text-center mb-2">
                    <h2 className="text-xl font-semibold text-fg mb-2">Esqueceu sua senha?</h2>
                    <p className="text-sm text-text">
                        Digite seu e-mail e enviaremos um link para redefinir sua senha.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-4 text-sm">
                    <Field
                        label="E-mail"
                        icon={Mail}
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) setError("");
                        }}
                        error={error}
                        placeholder="voce@empresa.com"
                        autoComplete="email"
                        type="email"
                    />
                    {success && (
                        <div className="mt-2 p-2 px-10 mb-5 border border-blue-600 bg-blue-700/10 rounded-lg  ">
                            <div className="flex items-start ">

                                <div className="text-sm">


                                    <p className="text-blue-500 text-xs font-semibold ">
                                        E-mail Enviado, verifique sua caixa de entrada e também a caixa de spam.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    <Button
                        type="submit"
                        disabled={submitting || !email || countdown > 0}
                        variant={!email ? "danger" : "success"}
                        className="w-full py-2.5 rounded-lg cursor-pointer disabled:cursor-pointer mb-2"
                    >
                        {submitting ? <Loader2Icon className="animate-spin" /> :
                            countdown > 0 ? `Aguarde ${countdown}s para enviar novamente` :
                                success ? "Enviar novamente" : "Enviar link de recuperação"}
                    </Button>


                </form>

                <div className=" text-center">
                    <button
                        type="button"
                        onClick={() => navigate("/auth/login")}
                        className="text-sm text-neutral-600 underline cursor-pointer hover:text-neutral-500"
                    >
                        <ArrowLeft size={14} className="inline mr-1" />
                        Voltar para o login
                    </button>
                </div>

                <p className="text-[11px] text-gray-500 text-center mt-6">
                    © {new Date().getFullYear()} — ERP Synapse
                </p>
            </div>
        </div>
    );
}