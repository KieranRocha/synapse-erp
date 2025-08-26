import React, { useState } from "react";
import type { Meta } from "../../types";
import { Loader2, PlusCircle, Search, UserPlus } from "lucide-react";
import { useToastStore } from "../../../../store/toastStore";
import { useClientesStore } from "../../../../store/clientesStore";
import { useNavigate } from "react-router-dom";

export default function StepDados({ meta, setMeta }: { meta: Meta; setMeta: (v: Meta) => void }) {
    const input = "px-3 py-2 rounded-lg border border-border bg-input text-fg text-sm outline-none  focus:ring-2 focus:ring-ring/40";

    const pushToast = useToastStore((s: any) => s.push);
    const { searchCliente } = useClientesStore();
    const navigate = useNavigate();
    const [loadingCNPJ, setLoadingCNPJ] = useState(false);
    const [cnpjMsg, setCnpjMsg] = useState<string | null>(null);

    const onlyDigits = (v: string) => (v || "").replace(/[^0-9]/g, "");
    const formatCNPJ = (v: string) => {
        const d = onlyDigits(v).slice(0, 14);
        const p1 = d.slice(0, 2);
        const p2 = d.slice(2, 5);
        const p3 = d.slice(5, 8);
        const p4 = d.slice(8, 12);
        const p5 = d.slice(12, 14);
        let out = "";
        if (p1) out = p1;
        if (p2) out += `.${p2}`;
        if (p3) out += `.${p3}`;
        if (p4) out += `/${p4}`;
        if (p5) out += `-${p5}`;
        return out;
    };
    const formatCEP = (v: string) => {
        const d = (v || "").replace(/\D/g, "").slice(0, 8);
        if (!d) return "";
        return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5, 8)}` : d;
    };

    const formatDateBR = (iso: string) => {
        if (!iso) return "";
        const d = new Date(iso);
        if (isNaN(d.getTime())) return iso;
        return d.toLocaleDateString("pt-BR");
    };
    const handleCNPJChange = (v: string) => {
        setMeta({ ...meta, cnpj: formatCNPJ(v) });
        setCnpjMsg(null);
    };

    const fetchCNPJ = async () => {
        const raw = onlyDigits(meta.cnpj || "");
        if (raw.length !== 14) { setCnpjMsg("CNPJ incompleto"); return; }

        try {
            setLoadingCNPJ(true);
            setCnpjMsg(null);

            // Buscar cliente na base local
            const cliente = searchCliente(raw);

            if (cliente) {
                const endereco = [cliente.endereco, cliente.numero].filter(Boolean).join(", ");

                setMeta({
                    ...meta,
                    cliente: cliente.nomeFantasia || cliente.razaoSocial,
                    cnpj: formatCNPJ(raw),
                    clienteEndereco: endereco,
                    clienteBairro: cliente.bairro,
                    clienteCidade: cliente.cidade,
                    clienteUF: cliente.uf,
                    clienteCEP: cliente.cep,
                    clienteAtividade: cliente.atividade,
                    clienteAbertura: formatDateBR(cliente.dataAbertura),
                });

                pushToast(`Cliente "${cliente.nomeFantasia || cliente.razaoSocial}" encontrado e preenchido.`);
            } else {
                setCnpjMsg("Cliente não encontrado. Cadastre um novo cliente.");
            }
        } catch {
            setCnpjMsg("Erro ao buscar cliente.");
        } finally {
            setLoadingCNPJ(false);
        }
    };


    const novoCliente = () => {
        navigate('/clientes/novo');
    };

    return (
        <section className="bg-bg border-border text-fg rounded-2xl border p-6">
            <h3 className="font-semibold mb-4 text-lg">Dados do Orçamento</h3>

            {/* Layout SEM GRID: blocos verticais com grupos flexíveis */}
            <div className="space-y-5">
                {/* Linha: Nome do orçamento */}
                <div className="flex flex-col">
                    <label className="text-xs opacity-70 mb-1">Nome do Orçamento *</label>
                    <input className={input} placeholder="Ex: Linha de Pintura - Setor A" value={meta.nome} onChange={(e) => setMeta({ ...meta, nome: e.target.value })} />
                </div>

                {/* Linha: CNPJ + Buscar */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs opacity-70">CNPJ do Cliente</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input className={`${input} flex-1`} inputMode="numeric" placeholder="00.000.000/0000-00" value={meta.cnpj || ""} onChange={(e) => handleCNPJChange(e.target.value)} />
                        <div className="flex gap-2">
                            <button type="button" onClick={fetchCNPJ} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border text-fg text-sm hover:bg-muted" title="Buscar cliente cadastrado">
                                {loadingCNPJ ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Buscar
                            </button>
                            <button type="button" onClick={novoCliente} className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-emerald-500/40 text-emerald-600 text-sm hover:bg-emerald-500/10" title="Cadastrar novo cliente">
                                <UserPlus className="w-4 h-4" /> Novo
                            </button>
                        </div>
                    </div>
                    {cnpjMsg && (
                        <div className="mt-1 flex items-start gap-2">
                            <p className="text-xs text-red-500">{cnpjMsg}</p>
                            {cnpjMsg.includes("não encontrado") && (
                                <button
                                    type="button"
                                    onClick={novoCliente}
                                    className="text-xs text-emerald-600 hover:text-emerald-700 underline"
                                >
                                    Cadastrar agora
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <p className="text-xs opacity-70">Dados do Cliente (preenchidos automaticamente pelo CNPJ)</p>

                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 flex flex-col">
                            <label className="text-xs opacity-70 mb-1">Nome</label>
                            <input className={`${input} pointer-events-none opacity-75`} readOnly value={meta.cliente || ""} placeholder="—" />

                        </div>
                        <div className="flex-1 flex flex-col">
                            <label className="text-xs opacity-70 mb-1">Endereço</label>
                            <input className={`${input} pointer-events-none opacity-75`} readOnly value={meta.clienteEndereco || ""} placeholder="—" />
                        </div>
                        <div className="w-full md:w-56 flex flex-col">
                            <label className="text-xs opacity-70 mb-1">Bairro</label>
                            <input className={`${input} pointer-events-none opacity-75`} readOnly value={meta.clienteBairro || ""} placeholder="—" />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 flex flex-col">
                            <label className="text-xs opacity-70 mb-1">Cidade</label>
                            <input className={`${input} pointer-events-none opacity-75`} readOnly value={meta.clienteCidade || ""} placeholder="—" />
                        </div>
                        <div className="w-full md:w-24 flex flex-col">
                            <label className="text-xs opacity-70 mb-1">UF</label>
                            <input className={`${input} pointer-events-none opacity-75 text-center`} readOnly value={meta.clienteUF || ""} placeholder="—" />
                        </div>
                        <div className="w-full md:w-40 flex flex-col">
                            <label className="text-xs opacity-70 mb-1">CEP</label>
                            <input className={`${input} pointer-events-none opacity-75`} readOnly value={meta.clienteCEP || ""} placeholder="—" />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 flex flex-col">
                            <label className="text-xs opacity-70 mb-1">Atividade Principal (CNAE)</label>
                            <input className={`${input} pointer-events-none opacity-75`} readOnly value={meta.clienteAtividade || ""} placeholder="—" />
                        </div>
                        <div className="w-full md:w-52 flex flex-col">
                            <label className="text-xs opacity-70 mb-1">Início de Atividade</label>
                            <input className={`${input} pointer-events-none opacity-75`} readOnly value={meta.clienteAbertura || ""} placeholder="—" />
                        </div>
                    </div>
                </div>

                {/* Linha: Responsável / Datas */}
                <div className="flex flex-col gap-3 md:flex-row">
                    <div className="flex-1 flex flex-col">
                        <label className="text-xs opacity-70 mb-1">Responsável</label>
                        <input className={input} placeholder="Nome do responsável" value={meta.responsavel} onChange={(e) => setMeta({ ...meta, responsavel: e.target.value })} />
                    </div>
                    <div className="flex-1 flex flex-col">
                        <label className="text-xs opacity-70 mb-1">Data de Início</label>
                        <input type="date" className={input} value={meta.dataInicio} onChange={(e) => setMeta({ ...meta, dataInicio: e.target.value })} />
                    </div>
                    <div className="flex-1 flex flex-col">
                        <label className="text-xs opacity-70 mb-1">Previsão de Entrega</label>
                        <input type="date" className={input} value={meta.previsaoEntrega} onChange={(e) => setMeta({ ...meta, previsaoEntrega: e.target.value })} />
                    </div>
                </div>

                {/* Linha: Descrição */}
                <div className="flex flex-col">
                    <label className="text-xs opacity-70 mb-1">Descrição / Escopo do Orçamento</label>
                    <textarea rows={3} className={input} placeholder="Detalhes sobre o projeto, ambiente, requisitos técnicos, etc." value={meta.descricao} onChange={(e) => setMeta({ ...meta, descricao: e.target.value })} />
                </div>
            </div>
        </section>
    );
}