import type { Budget } from "../../shared/types";
import { currency, dateBR } from "../../utils/format";

/**
 * BudgetsTable usando tokens de tema (Tailwind v4 CSS-first) e badges semânticas.
 * Requer as classes .badge-analise, .badge-andamento, .badge-aprovado, .badge-reprovado no CSS global.
 */

export function BudgetsTable({
    rows,
    onView,
    onEdit,
    onDuplicate,
    onPdf,
}: {
    rows: Budget[];
    onView: (r: Budget) => void;
    onEdit: (r: Budget) => void;
    onDuplicate: (r: Budget) => void;
    onPdf: (r: Budget) => void;
}) {
    const btn =
        "px-2 py-1 rounded-lg border border-input text-xs text-fg hover:bg-muted/50 transition";

    const statusToBadge = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes("aprov")) return "badge badge-aprovado";
        if (s.includes("reprov")) return "badge badge-reprovado";
        if (s.includes("venc")) return "badge badge-vencido "; // mantém 'vencido' com amarelo padrão
        if (s.includes("andament")) return "badge badge-andamento";
        if (s.includes("anális") || s.includes("analise") || s.includes("analse"))
            return "badge badge-analise";
        // fallback informativo
        return "badge badge-info";
    };

    return (
        <div className="rounded-2xl border border-border bg-card/70 backdrop-blur">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="text-left border-b border-border bg-muted/40">
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
                            <tr
                                key={r.id}
                                className="border-b border-border/50 hover:bg-muted/30 transition"
                            >
                                <td className="px-4 py-3 font-medium text-fg">{r.numero}</td>
                                <td className="px-4 py-3">{r.cliente}</td>
                                <td className="px-4 py-3 truncate max-w-[320px]">{r.projeto}</td>
                                <td className="px-4 py-3">{currency(r.valor)}</td>
                                <td className="px- py-3 ">
                                    <span className={statusToBadge(r.status)}>{r.status}</span>
                                </td>
                                <td className="px-4 py-3">{dateBR(r.emissao)}</td>
                                <td className="px-4 py-3">{dateBR(r.validade)}</td>
                                <td className="px-4 py-3">{r.resp}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => onView(r)} className={btn}>
                                            Detalhes
                                        </button>
                                        <button onClick={() => onEdit(r)} className={btn}>
                                            Editar
                                        </button>
                                        <button onClick={() => onDuplicate(r)} className={btn}>
                                            Duplicar
                                        </button>
                                        <button onClick={() => onPdf(r)} className={btn}>
                                            PDF
                                        </button>
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
