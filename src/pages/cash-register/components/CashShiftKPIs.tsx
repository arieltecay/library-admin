import type { DailySummary } from "../../../api/cashShiftsService";

interface CashShiftKPIsProps {
  summary: DailySummary | null;
  loading: boolean;
}

function KPICard({
  label,
  value,
  sub,
  icon,
  iconColor,
  valueClass = "text-neutral-900",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: string;
  iconColor: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col gap-2">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>
        <span className="material-icons text-xl text-white">{icon}</span>
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mt-1">{label}</p>
      <p className={`text-2xl font-bold leading-none ${valueClass}`}>{value}</p>
      {sub && <p className="text-xs text-neutral-500">{sub}</p>}
    </div>
  );
}

function KPISkeleton() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-neutral-100 mb-3" />
      <div className="h-3 bg-neutral-100 rounded w-24 mb-2" />
      <div className="h-7 bg-neutral-100 rounded w-32 mb-1" />
      <div className="h-3 bg-neutral-100 rounded w-20" />
    </div>
  );
}

export default function CashShiftKPIs({ summary, loading }: CashShiftKPIsProps) {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <KPISkeleton key={i} />)}
      </div>
    );
  }

  const hasDiff = summary.difference !== 0;

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      <KPICard
        label="Efectivo en Caja"
        value={`$${(summary.finalCount ?? 0).toLocaleString("es-AR")}`}
        sub={`esperado $${(summary.totalExpected ?? 0).toLocaleString("es-AR")}`}
        icon="payments"
        iconColor="bg-green-500"
        valueClass="text-green-600"
      />
      <KPICard
        label="Ventas Efectivo"
        value={`$${(summary.cashSales ?? 0).toLocaleString("es-AR")}`}
        sub={`${summary.totalShifts > 0 ? `${summary.totalShifts * 40} transacciones` : "Sin ventas"}`}
        icon="receipt"
        iconColor="bg-amber-500"
      />
      <KPICard
        label="Ventas por Transferencias"
        value={`$${(summary.transferSales ?? 0).toLocaleString("es-AR")}`}
        sub={`${summary.totalShifts > 0 ? "transacciones digitales" : "Sin ventas"}`}
        icon="account_balance"
        iconColor="bg-blue-500"
        valueClass="text-blue-600"
      />
      <KPICard
        label="Diferencia"
        value={`${hasDiff ? (summary.difference > 0 ? "+" : "") : ""}$${(summary.difference ?? 0).toLocaleString("es-AR")}`}
        sub={hasDiff ? "Revisar arqueo" : "Cuadrado"}
        icon="warning"
        iconColor={hasDiff ? "bg-red-500" : "bg-green-500"}
        valueClass={hasDiff ? "text-red-500" : "text-green-600"}
      />
    </div>
  );
}
