import type { Budget } from "../../utils/budgetFilters";
import { currency, dateBR } from "../../utils/format";


export function BudgetsTable({ rows, onEdit, onDuplicate, onPdf }: { rows: Budget[]; onEdit: (r: Budget) => void; onDuplicate: (r: Budget) => void; onPdf: (r: Budget) => void; }) {
    const btn = "px-2 py-1 rounded-lg border border-neutral-700/30 text-xs hover:bg-neutral-100/5 transition";
    return (
        <div className="rounded-2xl border border-neutral-700/20 bg-white/5 backdrop-blur">
            <div className="overflow-x-auto">
                <table className=" text-sm">
                    <thead className="text-left border-b border-neutral-700/30">
                        <tr>
                            <th className="px-4 py-3">Nº</th>
                            <th className="px-4 py-3">Cliente</th>
                            <th className="px-4 py-3">Projeto</th>
                            <th className="px-4 py-3">Valor</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Emissão</th>
                            <th className="px-4 py-3">Validade</th>
                            <th className="px-4 py-3">Resp.</th>
                            <th className="px-4 py-3">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => (
                            <tr key={r.id} className="border-b border-neutral-700/10 hover:bg-white/5">
                                <td className="px-4 py-3 font-medium">{r.numero}</td>
                                <td className="px-4 py-3">{r.cliente}</td>
                                <td className="px-4 py-3 truncate max-w-[240px]">{r.projeto}</td>
                                <td className="px-4 py-3">{currency(r.valor)}</td>
                                <td className="px-10 py-3 truncate max-w-[240px]">
                                    <span className={`px-4 py-1 rounded-lg text-xs border ${r.status === "aprovado" ? "bg-green-500/10 border-green-400/40 text-green-300" :
                                        r.status === "reprovado" ? "bg-red-500/10 border-red-400/40 text-red-300" :
                                            r.status === "vencido" ? "bg-yellow-500/10 border-yellow-400/40 text-yellow-300" :
                                                "bg-blue-500/10 border-blue-400/40 text-blue-300"}`}>{r.status}</span>
                                </td>
                                <td className="px-4 py-3">{dateBR(r.emissao)}</td>
                                <td className="px-4 py-3">{dateBR(r.validade)}</td>
                                <td className="px-4 py-3">{r.resp}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => onEdit(r)} className={btn}>Editar</button>
                                        <button onClick={() => onDuplicate(r)} className={btn}>Duplicar</button>
                                        <button onClick={() => onPdf(r)} className={btn}>PDF</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}