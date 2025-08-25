import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { currency } from "../../utils/format";

type KPIs = {
    conversao: number;
    ticketMedio: number;
    vencidosPct: number;
    margemMedia: number;
    prazoMedio: number;
    revisadosPct: number;
};

export function KpiCards({ kpis }: { kpis: KPIs }) {
    const Trend = ({ trend }: { trend?: number }) => {
        if (typeof trend !== "number") return null;

        const cls =
            trend > 0
                ? "text-success"
                : trend < 0
                    ? "text-danger"
                    : "text-muted-foreground";

        return (
            <div className={`mt-1 text-xs flex items-center gap-1 ${cls}`} aria-live="polite">
                {trend > 0 && <ArrowUpRight className="w-3 h-3" aria-hidden />}
                {trend < 0 && <ArrowDownRight className="w-3 h-3" aria-hidden />}
                {trend !== 0 ? `${Math.abs(trend)}%` : "—"}
            </div>
        );
    };

    const KPICard = ({
        title,
        value,
        trend,
    }: {
        title: string;
        value: string | number;
        trend?: number;
    }) => (
        <div className="rounded-2xl border border-border bg-card shadow-card backdrop-blur p-4">
            <p className="text-xs text-muted-foreground mb-1">{title}</p>
            <div className="text-xl font-semibold text-fg">{value}</div>
            <Trend trend={trend} />
        </div>
    );

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <KPICard title="Taxa de Conversão" value={`${kpis.conversao.toFixed(0)}%`} trend={+5} />
            <KPICard title="Ticket Médio" value={currency(kpis.ticketMedio)} trend={+3} />
            <KPICard title="% Vencidos" value={`${kpis.vencidosPct.toFixed(0)}%`} trend={-2} />
            <KPICard title="Margem Média" value={`${kpis.margemMedia.toFixed(0)}%`} trend={+1} />
            <KPICard title="Prazo Médio (dias)" value={kpis.prazoMedio.toFixed(1)} trend={0} />
            <KPICard title="% Revisados" value={`${kpis.revisadosPct.toFixed(0)}%`} trend={0} />
        </div>
    );
}
