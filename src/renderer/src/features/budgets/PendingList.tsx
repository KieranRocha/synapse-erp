import type { Budget } from "../../shared/types";
import { dateBR } from "../../utils/format";


export function PendingList({ rows }: { rows: Budget[] }) {
    const pendentes = rows.filter((r) => r.status === "em análise");
    return (
        <div className="rounded-2xl border border-neutral-700/20 bg-white/5 backdrop-blur p-4 h-64 overflow-auto">
            <p className="text-sm mb-3">Pendentes de Resposta</p>
            <ul className="space-y-2 text-sm">
                {pendentes.map((p) => (
                    <li key={p.id} className="flex items-center justify-between">
                        <span className="truncate mr-3">{p.numero} — {p.cliente}</span>
                        <span className="opacity-70">Validade: {dateBR(p.validade)}</span>
                    </li>
                ))}
                {pendentes.length === 0 && <li className="opacity-70">Sem pendências 🎉</li>}
            </ul>
        </div>
    );
}