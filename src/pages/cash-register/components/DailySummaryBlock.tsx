import type { DailySummary } from "../../../api/cashShifts";

interface DailySummaryBlockProps {
  summary: DailySummary;
  loading: boolean;
  onCloseShift?: (shiftId: string, sellerName: string) => void;
}

function Row({ label, value, valueClass = "text-neutral-800" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-neutral-600">{label}</span>
      <span className={`text-sm font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}

export default function DailySummaryBlock({ summary, loading, onCloseShift }: DailySummaryBlockProps) {
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
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex justify-between py-2 border-b border-neutral-100">
              <div className="h-4 bg-neutral-100 rounded w-28" />
              <div className="h-4 bg-neutral-100 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12">
          {/* Columna izquierda - Arqueo de caja */}
          <div className="divide-y divide-neutral-100">
            <Row
              label="Apertura"
              value={`$${(summary.totalOpening ?? 0).toLocaleString("es-AR")}`}
            />
            <Row
              label="Ventas efectivo"
              value={`+$${(summary.cashSales ?? 0).toLocaleString("es-AR")}`}
              valueClass="text-green-600"
            />
            <Row
              label="Devoluciones (efectivo)"
              value={`-$${(summary.returns ?? 0).toLocaleString("es-AR")}`}
              valueClass="text-red-500"
            />
            <Row
              label="Entradas movimientos"
              value={`+$${(summary.cashInTotal ?? 0).toLocaleString("es-AR")}`}
              valueClass="text-green-600"
            />
            <Row
              label="Salidas movimientos"
              value={`-$${(summary.cashOutTotal ?? 0).toLocaleString("es-AR")}`}
              valueClass="text-red-500"
            />
            <Row
              label="Neto movimientos"
              value={`${(summary.netMovements ?? 0) >= 0 ? "+" : ""}$${(summary.netMovements ?? 0).toLocaleString("es-AR")}`}
              valueClass={(summary.netMovements ?? 0) >= 0 ? "text-green-600" : "text-red-500"}
            />
            <Row
              label="Pagos créditos"
              value={(summary.creditPayments ?? 0) > 0 ? `+$${(summary.creditPayments ?? 0).toLocaleString("es-AR")}` : "$0"}
              valueClass={(summary.creditPayments ?? 0) > 0 ? "text-green-600" : "text-neutral-600"}
            />
            <div className="flex items-center justify-between py-3 mt-1">
              <span className="text-sm font-bold text-neutral-800 uppercase tracking-wide">Total Operación</span>
              <span className="text-lg font-bold text-blue-600">
                ${(summary.totalExpected ?? 0).toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          {/* Columna derecha - Cierre */}
          <div className="divide-y divide-neutral-100">
            <Row
              label="Conteo final (turnos cerrados)"
              value={`$${(summary.finalCount ?? 0).toLocaleString("es-AR")}`}
            />
            {(summary.inheritedOpening ?? 0) > 0 && (
              <Row
                label="Apertura de turnos heredados (no es plata de hoy)"
                value={`-$${(summary.inheritedOpening ?? 0).toLocaleString("es-AR")}`}
                valueClass="text-neutral-500"
              />
            )}
            <Row
              label="En caja, pendiente de conteo"
              value={`$${(summary.salesInOpenShifts ?? 0).toLocaleString("es-AR")}`}
              valueClass={(summary.salesInOpenShifts ?? 0) > 0 ? "text-amber-600" : "text-neutral-800"}
            />
            <Row
              label="Diferencia real"
              value={
                hasDiff
                  ? `${(summary.difference ?? 0) > 0 ? "+" : ""}$${(summary.difference ?? 0).toLocaleString("es-AR")}`
                  : "$0"
              }
              valueClass={hasDiff ? "text-red-500" : "text-green-600"}
            />
            <Row
              label="Turnos con diferencia"
              value={`${(summary.shiftsWithDifference ?? 0)} de ${(summary.totalShifts ?? 0)}`}
              valueClass={(summary.shiftsWithDifference ?? 0) > 0 ? "text-amber-600" : "text-neutral-800"}
            />
            <div className="py-2">
              <span className="text-sm text-neutral-600">Turnos pendientes de cierre</span>
              {hasPending ? (
                <div className="mt-2 space-y-1.5">
                  {summary.pendingShifts.map(p => (
                    <div key={p.id} className="flex items-center justify-between gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                      <span className="text-sm font-medium text-amber-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        {p.sellerName}
                      </span>
                      {onCloseShift && (
                        <button
                          type="button"
                          onClick={() => onCloseShift(p.id, p.sellerName)}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
                        >
                          Cerrar turno
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="block text-sm font-semibold text-green-600 flex items-center gap-1 mt-1">
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
