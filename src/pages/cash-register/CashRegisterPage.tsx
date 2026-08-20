import { useState, useEffect, useCallback } from "react";
import {
  listCashShifts,
  getDailySummary,
  type CashShiftItem,
  type DailySummary,
  type ListCashShiftsParams,
} from "../../api/cashShiftsService";
import { exportToCSV } from "../../lib/exportToCSV";
import CashShiftKPIs from "./components/CashShiftKPIs";
import DailySummaryBlock from "./components/DailySummaryBlock";
import CashMovementsTab from "./components/CashMovementsTab";

type TabFilter = "all" | "closed" | "open" | "difference" | "movements";

function StatusBadge({ status, difference }: { status: "open" | "closed"; difference?: number }) {
  if (status === "open")
    return (
      <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-full bg-amber-100 text-amber-700 tracking-wide">
        Abierto
      </span>
    );
  if (difference !== undefined && difference !== 0)
    return (
      <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-full bg-red-100 text-red-600 tracking-wide">
        Diferencia
      </span>
    );
  return (
    <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-full bg-green-100 text-green-700 tracking-wide">
      Cerrado
    </span>
  );
}

function DiffCell({ value }: { value?: number }) {
  const v = value ?? 0;
  if (v === 0)
    return (
      <span className="text-green-600 font-semibold flex items-center gap-1">
        $0 <span className="material-icons text-base">check_circle</span>
      </span>
    );
  return (
    <span className="text-red-500 font-semibold flex items-center gap-1">
      {v > 0 ? "+" : ""}${v.toLocaleString("es-AR")}
      <span className="material-icons text-base">cancel</span>
    </span>
  );
}

function formatTime(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

export default function CashRegisterPage() {
  const [shifts, setShifts] = useState<CashShiftItem[]>([]);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loadingShifts, setLoadingShifts] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [activeTab, setActiveTab] = useState<TabFilter>("closed");
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [params, setParams] = useState<ListCashShiftsParams>({ limit: 50, sortOrder: "desc" });

  const fetchData = useCallback(async () => {
    setLoadingShifts(true);
    setLoadingSummary(true);
    try {
      const queryParams: ListCashShiftsParams = { ...params };
      if (activeTab === "closed") queryParams.status = "closed";
      if (activeTab === "open") queryParams.status = "open";
      if (activeTab === "difference") queryParams.hasDifference = true;

      const [shiftsResult, summaryResult] = await Promise.all([
        listCashShifts(queryParams),
        getDailySummary(),
      ]);
      setShifts(shiftsResult.items || []);
      setSummary(summaryResult);
    } catch (e) {
      console.error("Error cargando arqueos", e);
    } finally {
      setLoadingShifts(false);
      setLoadingSummary(false);
    }
  }, [params, activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = () => {
    const flat = shifts.map(s => ({
      Turno: `#${s.shiftNumber}`,
      Vendedor: s.sellerName,
      Estado: s.status === "open" ? "ABIERTO" : "CERRADO",
      Apertura: formatTime(s.openedAt),
      Cierre: formatTime(s.closedAt),
      "Monto Apertura": s.openingAmount,
      "Monto Esperado": s.expectedAmount ?? "",
      "Monto Real": s.closingAmount ?? "",
      Diferencia: s.difference ?? "",
    }));
    exportToCSV(flat, "arqueo_de_caja");
  };

  const tabs: { id: TabFilter; label: string }[] = [
    { id: "closed", label: "Cerrados" },
    { id: "open", label: "Abiertos" },
    { id: "difference", label: "Con diferencia" },
    { id: "movements", label: "Movimientos" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Arqueo de caja</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Revisá los turnos cerrados, diferencias y arqueos diarios
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-sm"
        >
          <span className="material-icons text-base">download</span>
          Exportar arqueos
        </button>
      </div>

      {/* KPIs */}
      <CashShiftKPIs
        summary={summary}
        loading={loadingSummary}
      />

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

          {/* Vendedor select placeholder */}
          <select
            className="px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none bg-neutral-50 text-neutral-600"
            onChange={e => setParams(p => ({ ...p, sellerId: e.target.value || undefined }))}
          >
            <option value="">Vendedor: Todos</option>
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
                {["Turno", "Vendedor", "Estado", "Apertura/Cierre", "Apertura $", "Esperado $", "Real $", "Diferencia", ""].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loadingShifts ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(9)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-neutral-100 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : shifts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-14 text-center text-neutral-400">
                    No hay turnos para mostrar
                  </td>
                </tr>
              ) : (
                shifts.map(shift => (
                  <tr
                    key={shift.id}
                    className={`hover:bg-neutral-50/60 transition-colors ${
                      shift.difference !== undefined && shift.difference !== 0 ? "bg-red-50/30" : ""
                    }`}
                  >
                    <td className="px-5 py-4 font-semibold text-neutral-800">
                      #{shift.shiftNumber}
                    </td>
                    <td className="px-5 py-4 text-neutral-700">{shift.sellerName}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={shift.status} difference={shift.difference} />
                    </td>
                    <td className="px-5 py-4 text-neutral-600 whitespace-nowrap">
                      {formatTime(shift.openedAt)} / {formatTime(shift.closedAt)}
                    </td>
                    <td className="px-5 py-4 text-neutral-700">
                      ${shift.openingAmount.toLocaleString("es-AR")}
                    </td>
                    <td className="px-5 py-4 text-neutral-700">
                      {shift.expectedAmount != null ? `$${shift.expectedAmount.toLocaleString("es-AR")}` : "—"}
                    </td>
                    <td className="px-5 py-4 text-neutral-700">
                      {shift.closingAmount != null ? `$${shift.closingAmount.toLocaleString("es-AR")}` : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <DiffCell value={shift.difference} />
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelectedShiftId(shift.id)}
                        className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
                      >
                        <span className="material-icons text-base">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loadingShifts && shifts.length > 0 && activeTab !== "movements" && (
          <div className="px-6 py-3 border-t border-neutral-100 text-xs text-neutral-500">
            Mostrando 1-{shifts.length} de {shifts.length} turnos
          </div>
        )}
      </div>

      {/* Movimientos Tab */}
      {activeTab === "movements" && (
        <CashMovementsTab cashShiftId={selectedShiftId || undefined} />
      )}

      {/* Resumen diario */}
      {summary && activeTab !== "movements" && (
        <DailySummaryBlock summary={summary} loading={loadingSummary} />
      )}
    </div>
  );
}
