import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUIStore } from "../../../store/uiStore";
import { useToastStore } from "../../../store/toastStore";
import ToastViewport from "../../../components/Ui/ToastViewport";
import { MOCK_DETALHE } from "./mockOrcamentoDetalhe";

type Status = "em análise" | "aprovado" | "reprovado" | "vencido";

export default function OrcamentoEdicaoPage() {
  const { isDark } = useUIStore();
  const pushToast = useToastStore((s) => s.push);
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(MOCK_DETALHE.cliente);
  const [projeto, setProjeto] = useState(MOCK_DETALHE.projeto);
  const [responsavel, setResponsavel] = useState(MOCK_DETALHE.responsavel);
  const [emissao, setEmissao] = useState(MOCK_DETALHE.emissao);
  const [validade, setValidade] = useState(MOCK_DETALHE.validade);
  const [status, setStatus] = useState<Status>(MOCK_DETALHE.status);
  const [margem, setMargem] = useState(MOCK_DETALHE.margem);
  const [condPgto, setCondPgto] = useState(MOCK_DETALHE.condPgto);
  const [entrega, setEntrega] = useState(MOCK_DETALHE.entrega);
  const [garantia, setGarantia] = useState(MOCK_DETALHE.garantia);
  const [observacoes, setObservacoes] = useState(MOCK_DETALHE.observacoes || "");

  const onSave = () => {
    console.log("Salvar orçamento", {
      cliente,
      projeto,
      responsavel,
      emissao,
      validade,
      status,
      margem,
      condPgto,
      entrega,
      garantia,
      observacoes,
    });
    pushToast("Orçamento salvo (mock)");
  };

  const inputCls =
    "w-full p-2 rounded-xl border border-neutral-700/40 bg-transparent text-sm";

  return (
    <div className={isDark ? "bg-neutral-950 text-neutral-100" : "bg-neutral-50 text-neutral-900"}>
      <main className="max-w-3xl mx-auto w-full p-4 md:p-6 lg:p-8 space-y-4">
        <h1 className="text-xl font-semibold">Editar Orçamento</h1>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm mb-1">Cliente</label>
            <input className={inputCls} value={cliente} onChange={(e) => setCliente(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Projeto</label>
            <input className={inputCls} value={projeto} onChange={(e) => setProjeto(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Responsável</label>
              <input className={inputCls} value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">Status</label>
              <select
                className={inputCls}
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
              >
                <option value="em análise">em análise</option>
                <option value="aprovado">aprovado</option>
                <option value="reprovado">reprovado</option>
                <option value="vencido">vencido</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Emissão</label>
              <input
                type="date"
                className={inputCls}
                value={emissao}
                onChange={(e) => setEmissao(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Validade</label>
              <input
                type="date"
                className={inputCls}
                value={validade}
                onChange={(e) => setValidade(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Margem</label>
              <input
                type="number"
                step="0.01"
                className={inputCls}
                value={margem}
                onChange={(e) => setMargem(parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Condição de Pagamento</label>
              <input className={inputCls} value={condPgto} onChange={(e) => setCondPgto(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Entrega</label>
            <input className={inputCls} value={entrega} onChange={(e) => setEntrega(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Garantia</label>
            <input className={inputCls} value={garantia} onChange={(e) => setGarantia(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Observações</label>
            <textarea
              className={inputCls + " h-24"}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={onSave}
            className="px-4 py-2 rounded-xl border border-neutral-700/40 bg-transparent text-sm hover:bg-neutral-100/5 transition"
          >
            Salvar
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl border border-neutral-700/40 bg-transparent text-sm hover:bg-neutral-100/5 transition"
          >
            Cancelar
          </button>
        </div>
      </main>
      <ToastViewport />
    </div>
  );
}
