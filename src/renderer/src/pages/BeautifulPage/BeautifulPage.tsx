import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Star, Home } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Página lindona/hero de placeholder, seguindo o padrão visual escuro do ERP.
 * - Gradientes suaves + glassmorphism
 * - Animações sutis com Framer Motion
 * - Botão "Voltar" obrigatório (navigate(-1) por padrão)
 *
 * Props opcionais:
 *  - title: string
 *  - subtitle: string
 *  - backTo: number|string (padrão -1) → -1 volta histórico; ou passe uma rota string
 *  - showHome: boolean (padrão true) → mostra botão para dashboard
 */
export default function BeautifulPage({
    title = "Em breve",
    subtitle = "Estamos preparando algo especial por aqui.",
    backTo = -1,
    showHome = true,
}) {
    const navigate = useNavigate();
    const handleBack = () => {
        if (typeof backTo === "string") navigate(backTo);
        else navigate(-1);
    };

    return (
        <section className="relative overflow-hidden rounded-3xl border border-slate-700/60 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 shadow-2xl">
            {/* Glow decorativo */}
            <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />
            {/* Grid sutil */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />

            <div className="relative px-6 py-16 sm:px-10 lg:px-16 lg:py-20">
                {/* Badge + ícones animados */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-800/60 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur"
                >
                    <Sparkles size={14} className="text-blue-300" />
                    Nova seção do ERP
                </motion.div>

                {/* Título/Descrição */}
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.05 }}
                    className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-cyan-200 to-indigo-300"
                >
                    {title}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mt-3 max-w-2xl text-base sm:text-lg text-slate-300/90"
                >
                    {subtitle}
                </motion.p>

                {/* Cart/Faixa com glass */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.12 }}
                    className="mt-8 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-xl shadow-lg"
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3 text-slate-200">
                            <div className="rounded-xl bg-slate-900/70 p-2 ring-1 ring-white/10">
                                <Star className="h-5 w-5 text-yellow-300" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Padrão visual do ERP mantido</p>
                                <p className="text-xs text-slate-400">
                                    Interações, cores e hovers compatíveis com a Sidebar/Header.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={handleBack}
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-white shadow-lg shadow-blue-900/30 ring-1 ring-white/10 transition-transform hover:scale-[1.02] hover:shadow-indigo-900/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <ArrowLeft className="h-4 w-4" /> Voltar
                            </button>
                            {showHome && (
                                <Link
                                    to="/"
                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900/70 px-4 py-2 text-slate-200 ring-1 ring-white/10 transition-colors hover:bg-slate-800/80 hover:text-white"
                                >
                                    <Home className="h-4 w-4" /> Ir para o Dashboard
                                </Link>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Blocos decorativos no rodapé */}
                <div className="pointer-events-none mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.05 * i }}
                            className="h-16 rounded-xl border border-slate-700/60 bg-slate-800/50 backdrop-blur"
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
