import { useEffect, useState } from "react";
import Modal from "../../../components/Modal";
import type { CashMovementCategory } from "../../../api/cashMovementsService";
import type { CashMovementType } from "../../../api/cashMovementsService";
import { getCashShiftDetail, type CashShiftDetail } from "../../../api/cashShiftsService";

function CategoryBadge({ category }: { category: CashMovementCategory }) {
  const labels: Record<CashMovementCategory, { label: string; color: string }> = {
    lunch: { label: "Almuerzo", color: "bg-orange-100 text-orange-700" },
    supplies: { label: "Insumos", color: "bg-blue-100 text-blue-700" },
    personal_withdrawal: { label: "Retiro", color: "bg-purple-100 text-purple-700" },
    change: { label: "Cambio", color: "bg-green-100 text-green-700" },
    expense: { label: "Gasto", color: "bg-teal-100 text-teal-700" },
    other: { label: "Otro", color: "bg-neutral-100 text-neutral-700" },
  };
  const { label, color } = labels[category];
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${color}`}>{label}</span>;
}

function TypeBadge({ type }: { type: CashMovementType }) {
  if (type === "in") {
    return (
      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-success-100 text-success-700">
        Entrada
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-danger-100 text-danger-700">
      Salida
    </span>
  );
}

function AmountCell({ amount, type }: { amount: number; type: CashMovementType }) {
  return (
    <span className={`font-semibold ${type === "in" ? "text-success-600" : "text-danger-600"}`}>
      {type === "in" ? "+" : "−"} ${amount.toLocaleString("es-AR")}
    </span>
  );
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(value: number | undefined) {
  return value == null ? "—" : `$${value.toLocaleString("es-AR")}`;
}

function StatusBadge({ status, difference }: { status: "open" | "closed"; difference?: number }) {
  if (status === "open") {
    return (
      <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-full bg-amber-100 text-amber-700 tracking-wide">
        Abierto
      </span>
    );
  }
  if (difference !== undefined && difference !== 0) {
    return (
      <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-full bg-red-100 text-red-600 tracking-wide">
        Diferencia
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-full bg-green-100 text-green-700 tracking-wide">
      Cerrado
    </span>
  );
}

interface CashShiftDetailModalProps {
  shiftId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CashShiftDetailModal({
  shiftId,
  isOpen,
  onClose,
}: CashShiftDetailModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<CashShiftDetail | null>(null);

  useEffect(() => {
    if (!shiftId) {
      setLoading(true);
      setDetail(null);
      setError(null);
      return;
    }

    let active = true;

    async function loadDetail() {
      try {
        setLoading(true);
        setError(null);
        const data = await getCashShiftDetail(shiftId!);
        if (active) {
          setDetail(data);
        }
      } catch (e: unknown) {
        if (active) {
          const message = e instanceof Error ? e.message : "Error al cargar el detalle del turno";
          setError(message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      active = false;
    };
  }, [shiftId]);

  if (!shiftId) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <p className="text-center">Sin turno seleccionado</p>
      </Modal>
    );
  }

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <p className="text-center">Cargando detalle del turno...</p>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <p className="text-center text-red-600">Error: {error}</p>
      </Modal>
    );
  }

  if (!detail) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <p className="text-center">Sin datos del turno</p>
      </Modal>
    );
  }

  const { shift, sales, movements } = detail;
  const { aggregated } = movements;

  const categoriesWithActivity = (Object.entries(aggregated.byCategory) as [CashMovementCategory, { in: number; out: number; count: number }][])
    .filter(([, vals]) => vals.in > 0 || vals.out > 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">
              Turno #{shift.shiftNumber} · {shift.sellerName}
            </h2>
            <div className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
              <StatusBadge status={shift.status} difference={shift.difference} />
              <span>
                {formatDateTime(shift.openedAt)}
                {shift.closedAt ? ` → ${formatDateTime(shift.closedAt)}` : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Métricas de ventas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-neutral-50 rounded-xl p-4">
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Apertura</p>
            <p className="text-lg font-bold text-neutral-800">{formatMoney(shift.openingAmount)}</p>
          </div>
          <div className="bg-neutral-50 rounded-xl p-4">
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Ventas efectivo</p>
            <p className="text-lg font-bold text-green-600">+{formatMoney(sales.cashTotal)}</p>
          </div>
          <div className="bg-neutral-50 rounded-xl p-4">
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Transferencias</p>
            <p className="text-lg font-bold text-blue-600">+{formatMoney(sales.transferTotal)}</p>
          </div>
          <div className="bg-neutral-50 rounded-xl p-4">
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Crédito</p>
            <p className="text-lg font-bold text-purple-600">+{formatMoney(sales.creditTotal)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-neutral-50 rounded-xl p-4">
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Devoluciones</p>
            <p className="text-lg font-bold text-red-500">-{formatMoney(sales.returnsTotal)}</p>
          </div>
          <div className="bg-neutral-50 rounded-xl p-4">
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Entradas movimientos</p>
            <p className="text-lg font-bold text-green-600">+{formatMoney(aggregated.cashInTotal)}</p>
          </div>
          <div className="bg-neutral-50 rounded-xl p-4">
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Salidas movimientos</p>
            <p className="text-lg font-bold text-red-500">-{formatMoney(aggregated.cashOutTotal)}</p>
          </div>
          <div className="bg-neutral-50 rounded-xl p-4">
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Neto movimientos</p>
            <p className={`text-lg font-bold ${aggregated.netMovements >= 0 ? "text-green-600" : "text-red-500"}`}>
              {aggregated.netMovements >= 0 ? "+" : ""}{formatMoney(aggregated.netMovements)}
            </p>
          </div>
        </div>

        {/* Arqueo final */}
        <div className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-100">
          <div className="flex items-center justify-between p-4">
            <span className="text-sm text-neutral-600">Total esperado</span>
            <span className="text-lg font-bold text-blue-600">{formatMoney(shift.expectedAmount)}</span>
          </div>
          <div className="flex items-center justify-between p-4">
            <span className="text-sm text-neutral-600">Conteo real</span>
            <span className="text-lg font-bold text-neutral-800">{formatMoney(shift.closingAmount)}</span>
          </div>
          <div className="flex items-center justify-between p-4">
            <span className="text-sm text-neutral-600">Diferencia</span>
            <span className={`text-lg font-bold ${shift.difference !== undefined && shift.difference !== 0 ? "text-red-500" : "text-green-600"}`}>
              {shift.difference !== undefined
                ? `${shift.difference > 0 ? "+" : ""}$${shift.difference.toLocaleString("es-AR")}`
                : "—"}
            </span>
          </div>
          {shift.note && (
            <div className="flex items-start justify-between p-4">
              <span className="text-sm text-neutral-600">Nota</span>
              <span className="text-sm text-neutral-800 text-right max-w-[60%]">{shift.note}</span>
            </div>
          )}
        </div>

        {/* Movimientos por categoría */}
        <div>
          <h3 className="text-sm font-semibold text-neutral-700 mb-2">Movimientos por categoría</h3>
          {categoriesWithActivity.length > 0 ? (
            <div className="bg-neutral-50 rounded-xl p-4 space-y-2 text-sm">
              {categoriesWithActivity.map(([category, vals]) => (
                <div key={category} className="flex justify-between items-center">
                  <CategoryBadge category={category} />
                  <span className="font-medium">
                    +${vals.in.toLocaleString("es-AR")} / −${vals.out.toLocaleString("es-AR")} ({vals.count})
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">Sin movimientos por categoría</p>
          )}
        </div>

        {/* Lista de movimientos */}
        <div>
          <h3 className="text-sm font-semibold text-neutral-700 mb-2">Movimientos registrados</h3>
          <div className="border border-neutral-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {["Fecha", "Tipo", "Categoría", "Monto", "Descripción"].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {movements.items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-neutral-400">
                      Sin movimientos registrados
                    </td>
                  </tr>
                ) : (
                  movements.items.map(m => (
                    <tr key={m.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">{formatDateTime(m.createdAt)}</td>
                      <td className="px-4 py-3"><TypeBadge type={m.type} /></td>
                      <td className="px-4 py-3"><CategoryBadge category={m.category} /></td>
                      <td className="px-4 py-3"><AmountCell amount={m.amount} type={m.type} /></td>
                      <td className="px-4 py-3 text-neutral-600 max-w-xs truncate" title={m.description}>{m.description}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
}
