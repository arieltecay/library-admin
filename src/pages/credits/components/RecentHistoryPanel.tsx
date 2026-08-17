import type { RecentMovement } from "../../../api/creditsService";

interface RecentHistoryPanelProps {
  movements: RecentMovement[];
  loading: boolean;
  onViewAll?: () => void;
}

function getMovementColor(movement: RecentMovement): string {
  if (movement.type === "payment") {
    const note = movement.note?.toLowerCase() || "";
    if (note.includes("promesa")) return "bg-amber-400";
    return "bg-green-400";
  }
  return "bg-blue-400";
}

function getMovementLabel(movement: RecentMovement): string {
  const note = movement.note?.toLowerCase() || "";
  if (movement.type === "debt") return "Crédito otorgado";
  if (note.includes("promesa")) return "Promesa de pago";
  if (note.includes("parcial")) return "Pago parcial";
  if (note.includes("total")) return "Pago total";
  return "Pago registrado";
}

export default function RecentHistoryPanel({
  movements,
  loading,
  onViewAll,
}: RecentHistoryPanelProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-2">
        <span className="material-icons text-neutral-500 text-lg">history</span>
        <h3 className="font-semibold text-neutral-800 text-sm">Historial reciente</h3>
      </div>

      {/* Lista */}
      <div className="flex-1 p-4 space-y-1">
        {loading ? (
          <div className="space-y-3 mt-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-200 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-neutral-100 rounded w-3/4" />
                  <div className="h-2.5 bg-neutral-100 rounded w-1/2" />
                </div>
                <div className="h-3 bg-neutral-100 rounded w-14" />
              </div>
            ))}
          </div>
        ) : movements.length === 0 ? (
          <div className="text-center py-8 text-neutral-400 text-sm">
            Sin movimientos recientes
          </div>
        ) : (
          movements.map((mov) => (
            <div
              key={mov.id}
              className="flex items-center gap-3 py-2.5 px-1 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              {/* Dot */}
              <div
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getMovementColor(mov)}`}
              />
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 truncate">
                  {mov.client?.fullName || "—"}
                </p>
                <p className="text-xs text-neutral-500">{getMovementLabel(mov)}</p>
              </div>
              {/* Monto */}
              <span
                className={`text-sm font-semibold flex-shrink-0 ${
                  mov.type === "payment" ? "text-green-600" : "text-neutral-700"
                }`}
              >
                {mov.type === "payment" ? "+" : "-"}${mov.amount.toFixed(2)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-neutral-100">
        <button
          onClick={onViewAll}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
        >
          Ver historial completo
          <span className="material-icons text-base">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
