import React from 'react';

interface ClientData {
  cliente: string;
  clienteEndereco: string;
  clienteBairro: string;
  clienteCidade: string;
  clienteUF: string;
  clienteCEP: string;
  clienteAtividade: string;
  clienteAbertura: string;
}

interface ClientFormProps {
  data: ClientData;
  inputClassName?: string;
}

export function ClientForm({ data, inputClassName = "" }: ClientFormProps) {
  const inputClass = `px-3 py-2 rounded-lg border border-border bg-input text-fg text-sm outline-none focus:ring-2 focus:ring-ring/40 pointer-events-none opacity-75 ${inputClassName}`;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs opacity-70">Dados do Cliente (preenchidos automaticamente)</p>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 flex flex-col">
          <label className="text-xs opacity-70 mb-1">Nome</label>
          <input
            className={inputClass}
            readOnly
            value={data.cliente || ""}
            placeholder="—"
          />
        </div>
        <div className="flex-1 flex flex-col">
          <label className="text-xs opacity-70 mb-1">Endereço</label>
          <input
            className={inputClass}
            readOnly
            value={data.clienteEndereco || ""}
            placeholder="—"
          />
        </div>
        <div className="w-full md:w-56 flex flex-col">
          <label className="text-xs opacity-70 mb-1">Bairro</label>
          <input
            className={inputClass}
            readOnly
            value={data.clienteBairro || ""}
            placeholder="—"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 flex flex-col">
          <label className="text-xs opacity-70 mb-1">Cidade</label>
          <input
            className={inputClass}
            readOnly
            value={data.clienteCidade || ""}
            placeholder="—"
          />
        </div>
        <div className="w-full md:w-24 flex flex-col">
          <label className="text-xs opacity-70 mb-1">UF</label>
          <input
            className={`${inputClass} text-center`}
            readOnly
            value={data.clienteUF || ""}
            placeholder="—"
          />
        </div>
        <div className="w-full md:w-40 flex flex-col">
          <label className="text-xs opacity-70 mb-1">CEP</label>
          <input
            className={inputClass}
            readOnly
            value={data.clienteCEP || ""}
            placeholder="—"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 flex flex-col">
          <label className="text-xs opacity-70 mb-1">Atividade Principal (CNAE)</label>
          <input
            className={inputClass}
            readOnly
            value={data.clienteAtividade || ""}
            placeholder="—"
          />
        </div>
        <div className="w-full md:w-52 flex flex-col">
          <label className="text-xs opacity-70 mb-1">Início de Atividade</label>
          <input
            className={inputClass}
            readOnly
            value={data.clienteAbertura || ""}
            placeholder="—"
          />
        </div>
      </div>
    </div>
  );
}