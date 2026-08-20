import { useState, useEffect, useCallback } from "react";
import {
  listCashMovements,
  getCashMovementsAggregated,
  type CashMovementItem,
  type CashMovementAggregated,
  type ListCashMovementsParams,
  type CashMovementCategory,
  type CashMovementType,
} from "../../../api/cashMovementsService";
import { exportToCSV } from "../../../lib/exportToCSV";

type TabFilter = "all" | "in" | "out";

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

interface CashMovementsTabProps {
  cashShiftId?: string;
}

export default function CashMovementsTab({ cashShiftId }: CashMovementsTabProps) {
  const [movements, setMovements] = useState<CashMovementItem[]>([]);
  const [aggregated, setAggregated] = useState<CashMovementAggregated | null>(null);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<ListCashMovementsParams>({
    limit: 50,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [activeTab, setActiveTab] = useState<TabFilter>("all");

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams: ListCashMovementsParams = { ...params };
      if (cashShiftId) queryParams.cashShiftId = cashShiftId;
      if (activeTab === "in") queryParams.type = "in";
      if (activeTab === "out") queryParams.type = "out";

      const [movementsResult, aggregatedResult] = await Promise.all([
        listCashMovements(queryParams),
        cashShiftId ? getCashMovementsAggregated(cashShiftId) : Promise.resolve(null),
      ]);
      setMovements(movementsResult.items || []);
      setAggregated(aggregatedResult);
    } catch (e) {
      console.error("Error cargando movimientos", e);
    } finally {
      setLoading(false);
    }
  }, [params, activeTab, cashShiftId]);

  useEffect(() => { fetchMovements(); }, [fetchMovements]);

  const handleExport = () => {
    const flat = movements.map(m => ({
      Turno: `#${m.shiftNumber}`,
      Vendedor: m.sellerName,
      Tipo: m.type === "in" ? "Entrada" : "Salida",
      Categoría: m.category,
      Monto: m.amount,
      Descripción: m.description,
      Fecha: formatDateTime(m.createdAt),
    }));
    exportToCSV(flat, `movimientos_caja_${cashShiftId ? `turno_${cashShiftId}` : "todos"}`);
  };

  const tabs: { id: TabFilter; label: string }[] = [
    { id: "all", label: "Todos" },
    { id: "in", label: "Entradas" },
    { id: "out", label: "Salidas" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            {cashShiftId ? `Movimientos - Turno #${cashShiftId}` : "Movimientos de Caja"}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {cashShiftId
              ? "Detalle de entradas y salidas de este turno"
              : "Historial global de movimientos de caja"}
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-sm"
        >
          <span className="material-icons text-base">download</span>
          Exportar CSV
        </button>
      </div>

      {/* KPIs Aggregated */}
      {aggregated && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Entradas (+)</p>
            <p className="text-2xl font-bold text-success-600 mt-1">
              +${aggregated.cashInTotal.toLocaleString("es-AR")}
            </p>
            <p className="text-xs text-neutral-400 mt-1">{aggregated.byCategory?.change?.in > 0 ? `Cambio: +${aggregated.byCategory.change.in.toLocaleString("es-AR")}` : ""}</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Salidas (−)</p>
            <p className="text-2xl font-bold text-danger-600 mt-1">
              −${aggregated.cashOutTotal.toLocaleString("es-AR")}
            </p>
            <p className="text-xs text-neutral-400 mt-1">{aggregated.byCategory?.lunch?.out > 0 ? `Almuerzo: −${aggregated.byCategory.lunch.out.toLocaleString("es-AR")}` : ""}</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Neto</p>
            <p className={`text-2xl font-bold mt-1 ${aggregated.netMovements >= 0 ? "text-primary-600" : "text-danger-600"}`}>
              {aggregated.netMovements >= 0 ? "+" : ""}${aggregated.netMovements.toLocaleString("es-AR")}
            </p>
            <p className="text-xs text-neutral-400 mt-1">{aggregated.movementsCount} movimientos</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Por Categoría</p>
            <div className="mt-2 space-y-1 text-xs text-neutral-600">
              {Object.entries(aggregated.byCategory).map(([cat, vals]) => (
                vals.in > 0 || vals.out > 0 ? (
                  <div key={cat} className="flex justify-between">
                    <span>{cat}</span>
                    <span className="font-medium">+${vals.in} / −${vals.out} (${vals.count})</span>
                  </div>
                ) : null
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filtros y tabla */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        {/* Barra de filtros */}
        <div className="px-5 py-4 border-b border-neutral-100 flex flex-wrap items-center gap-3">
          {/* Rango de fechas */}
          <div className="flex items-center gap-2 text-sm text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2">
            <span className="material-icons text-base text-neutral-400">calendar_today</span>
            <input
              type="date"
              className="outline-none bg-transparent text-sm"
              onChange={e =>
                setParams(p => ({ ...p, fromDate: e.target.value ? new Date(e.target.value).toISOString() : undefined }))
              }
            />
            <span className="text-neutral-400">-</span>
            <input
              type="date"
              className="outline-none bg-transparent text-sm"
              onChange={e =>
                setParams(p => ({ ...p, toDate: e.target.value ? new Date(e.target.value).toISOString() : undefined }))
              }
            />
          </div>

          {/* Tipo select */}
          <select
            className="px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none bg-neutral-50 text-neutral-600"
            onChange={e => setParams(p => ({ ...p, type: e.target.value as CashMovementType | undefined }))}
          >
            <option value="">Tipo: Todos</option>
            <option value="in">Entradas</option>
            <option value="out">Salidas</option>
          </select>

          {/* Categoría select */}
          <select
            className="px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none bg-neutral-50 text-neutral-600"
            onChange={e => setParams(p => ({ ...p, category: e.target.value as CashMovementCategory | undefined }))}
          >
            <option value="">Categoría: Todas</option>
            <option value="lunch">Almuerzo</option>
            <option value="supplies">Insumos</option>
            <option value="personal_withdrawal">Retiro personal</option>
            <option value="change">Cambio</option>
            <option value="expense">Gasto operativo</option>
            <option value="other">Otro</option>
          </select>

          {/* Tabs */}
          <div className="ml-auto flex items-center bg-neutral-100 rounded-lg p-1 gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {["Turno", "Vendedor", "Tipo", "Categoría", "Monto", "Descripción", "Fecha", ""].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-neutral-100 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center text-neutral-400">
                    No hay movimientos para mostrar
                  </td>
                </tr>
              ) : (
                movements.map(mov => (
                  <tr key={mov.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="px-5 py-4 font-semibold text-neutral-800">#{mov.shiftNumber}</td>
                    <td className="px-5 py-4 text-neutral-700">{mov.sellerName}</td>
                    <td className="px-5 py-4"><TypeBadge type={mov.type} /></td>
                    <td className="px-5 py-4"><CategoryBadge category={mov.category} /></td>
                    <td className="px-5 py-4"><AmountCell amount={mov.amount} type={mov.type} /></td>
                    <td className="px-5 py-4 text-neutral-600 max-w-xs truncate" title={mov.description}>{mov.description}</td>
                    <td className="px-5 py-4 text-neutral-500 whitespace-nowrap">{formatDateTime(mov.createdAt)}</td>
                    <td className="px-5 py-4">
                      <button className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors" title="Eliminar (solo admin)">
                        <span className="material-icons text-base">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && movements.length > 0 && (
          <div className="px-6 py-3 border-t border-neutral-100 text-xs text-neutral-500">
            Mostrando 1-{movements.length} de {movements.length} movimientos
          </div>
        )}
      </div>
    </div>
  );
}

