import React from 'react';

interface ProjectData {
  numero: string;
  nome: string;
  responsavel: string;
  dataInicio: string;
  previsaoEntrega: string;
  descricao: string;
}

interface ProjectFormProps {
  data: ProjectData;
  onChange: (field: keyof ProjectData, value: string) => void;
  inputClassName?: string;
}

export function ProjectForm({ data, onChange, inputClassName = "" }: ProjectFormProps) {
  const inputClass = `px-3 py-2 rounded-lg border border-border bg-input text-fg text-sm outline-none focus:ring-2 focus:ring-ring/40 ${inputClassName}`;

  return (
    <>
      {/* Número e Nome do orçamento */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="w-full md:w-48 flex flex-col">
          <label className="text-xs opacity-70 mb-1">Número do Orçamento *</label>
          <input
            className={inputClass}
            placeholder="Ex: ORC-001"
            value={data.numero}
            onChange={(e) => onChange('numero', e.target.value)}
          />
        </div>
        <div className="flex-1 flex flex-col">
          <label className="text-xs opacity-70 mb-1">Nome do Orçamento *</label>
          <input
            aria-label="Nome do Orçamento"
            className={inputClass}
            placeholder="Ex: Linha de Pintura - Setor A"
            value={data.nome}
            onChange={(e) => onChange('nome', e.target.value)}
          />
        </div>
      </div>

      {/* Responsável e Datas */}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="flex-1 flex flex-col">
          <label className="text-xs opacity-70 mb-1">Responsável</label>
          <input
            className={inputClass}
            placeholder="Nome do responsável"
            value={data.responsavel}
            onChange={(e) => onChange('responsavel', e.target.value)}
          />
        </div>
        <div className="flex-1 flex flex-col">
          <label className="text-xs opacity-70 mb-1">Data de Início</label>
          <input
            type="date"
            className={inputClass}
            value={data.dataInicio}
            onChange={(e) => onChange('dataInicio', e.target.value)}
          />
        </div>
        <div className="flex-1 flex flex-col">
          <label className="text-xs opacity-70 mb-1">Previsão de Entrega</label>
          <input
            type="date"
            className={inputClass}
            value={data.previsaoEntrega}
            onChange={(e) => onChange('previsaoEntrega', e.target.value)}
          />
        </div>
      </div>

      {/* Descrição */}
      <div className="flex flex-col">
        <label className="text-xs opacity-70 mb-1">Descrição / Escopo do Orçamento</label>
        <textarea
          rows={3}
          className={inputClass}
          placeholder="Detalhes sobre o projeto, ambiente, requisitos técnicos, etc."
          value={data.descricao}
          onChange={(e) => onChange('descricao', e.target.value)}
        />
      </div>
    </>
  );
}