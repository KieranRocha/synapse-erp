import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { currency } from "../../utils/format";


export function KpiCards({ kpis }: { kpis: { conversao: number; ticketMedio: number; vencidosPct: number; margemMedia: number; prazoMedio: number; revisadosPct: number; } }) {
    const KPICard = ({ title, value, trend }: { title: string; value: string | number; trend?: number }) => (
        <div className="rounded-2xl border border-neutral-700/20 bg-white/5 backdrop-blur p-4">
            <p className="text-xs opacity-70 mb-1">{title}</p>
            <div className="text-xl font-semibold">{value}</div>
            {typeof trend === "number" && (
                <div className={`mt-1 text-xs flex items-center gap-1 ${trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : "opacity-70"}`}>
                    {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : trend < 0 ? <ArrowDownRight className="w-3 h-3" /> : null}
                    {trend !== 0 ? `${Math.abs(trend)}%` : "—"}
                </div>
            )}
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