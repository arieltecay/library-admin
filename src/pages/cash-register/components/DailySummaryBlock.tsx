import type { DailySummary } from "../../../api/cashShiftsService";

interface DailySummaryBlockProps {
  summary: DailySummary;
  loading: boolean;
}

function Row({ label, value, valueClass = "text-neutral-800" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-neutral-600">{label}</span>
      <span className={`text-sm font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}

export default function DailySummaryBlock({ summary, loading }: DailySummaryBlockProps) {
  const dateLabel = summary?.date
    ? new Date(summary.date + "T00:00:00").toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

  const hasDiff = summary?.difference !== 0;
  const hasPending = summary?.pendingShifts?.length > 0;

  return (
    <div className="bg-white border-2 border-blue-200 rounded-xl shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-blue-100 flex items-center gap-2">
        <span className="material-icons text-blue-600 text-xl">point_of_sale</span>
        <h2 className="font-bold text-neutral-900 text-base">
          Resumen diario {dateLabel}
        </h2>
      </div>

      {loading ? (
        <div className="p-6 grid grid-cols-2 gap-x-12 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex justify-between py-2 border-b border-neutral-100">
              <div className="h-4 bg-neutral-100 rounded w-28" />
              <div className="h-4 bg-neutral-100 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12">
          {/* Columna izquierda */}
          <div className="divide-y divide-neutral-100">
            <Row
              label="Apertura"
              value={`$${summary.totalOpening.toLocaleString("es-AR")}`}
            />
            <Row
              label="Ventas efectivo"
              value={`+$${summary.cashSales.toLocaleString("es-AR")}`}
              valueClass="text-green-600"
            />
            <Row
              label="Devoluciones"
              value={summary.returns > 0 ? `-$${summary.returns.toLocaleString("es-AR")}` : "$0"}
              valueClass={summary.returns > 0 ? "text-red-500" : "text-neutral-600"}
            />
            <Row
              label="Pagos créditos"
              value={summary.creditPayments > 0 ? `+$${summary.creditPayments.toLocaleString("es-AR")}` : "$0"}
              valueClass={summary.creditPayments > 0 ? "text-green-600" : "text-neutral-600"}
            />
            <div className="flex items-center justify-between py-3 mt-1">
              <span className="text-sm font-bold text-neutral-800 uppercase tracking-wide">Total Esperado</span>
              <span className="text-lg font-bold text-blue-600">
                ${summary.totalExpected.toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="divide-y divide-neutral-100">
            <Row
              label="Conteo final"
              value={`$${summary.finalCount.toLocaleString("es-AR")}`}
            />
            <Row
              label="Diferencia"
              value={
                hasDiff
                  ? `${summary.difference > 0 ? "+" : ""}$${summary.difference.toLocaleString("es-AR")}`
                  : "$0"
              }
              valueClass={hasDiff ? "text-red-500" : "text-green-600"}
            />
            <Row
              label="Turnos con diferencia"
              value={`${summary.shiftsWithDifference} de ${summary.totalShifts}`}
              valueClass={summary.shiftsWithDifference > 0 ? "text-amber-600" : "text-neutral-800"}
            />
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-neutral-600">Turnos pendientes</span>
              {hasPending ? (
                <span className="text-sm font-semibold text-amber-600">
                  {summary.pendingShifts.length} ({summary.pendingShifts.map(p => p.sellerName).join(", ")})
                </span>
              ) : (
                <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                  <span className="material-icons text-base">check_circle</span> Ninguno
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
