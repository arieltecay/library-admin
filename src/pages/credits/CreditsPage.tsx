import { useState, useEffect, useCallback } from "react";
import {
  getCreditsSummary,
  listCredits,
  getRecentHistory,
  settleDebt,
  type CreditsSummary,
  type DebtorItem,
  type RecentMovement,
} from "../../api/creditsService";
import { exportToCSV } from "../../lib/exportToCSV";
import CreditsKPIs from "./components/CreditsKPIs";
import RecentHistoryPanel from "./components/RecentHistoryPanel";
import SettleDebtModal from "./components/SettleDebtModal";

function getDaysSince(dateStr?: string): number {
  if (!dateStr) return 0;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function AgePill({ days }: { days: number }) {
  const overdue = days >= 30;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${
        overdue ? "bg-red-100 text-red-600" : "bg-neutral-100 text-neutral-600"
      }`}
    >
      {days} días
    </span>
  );
}

function StatusBadge({ days, balance }: { days: number; balance: number }) {
  if (balance <= 0)
    return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full uppercase">Saldado</span>;
  if (days >= 30)
    return <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full uppercase">Vencido</span>;
  return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full uppercase">Vigente</span>;
}

interface SettleTarget {
  clientId: string;
  clientName: string;
  debt: number;
}

export default function CreditsPage() {
  const [summary, setSummary] = useState<CreditsSummary | null>(null);
  const [debtors, setDebtors] = useState<DebtorItem[]>([]);
  const [history, setHistory] = useState<RecentMovement[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingDebtors, setLoadingDebtors] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [settleTarget, setSettleTarget] = useState<SettleTarget | null>(null);

  const fetchAll = useCallback(async () => {
    setLoadingSummary(true);
    setLoadingDebtors(true);
    setLoadingHistory(true);
    try {
      const [s, d, h] = await Promise.all([
        getCreditsSummary(),
        listCredits({ limit: 50 }),
        getRecentHistory(5),
      ]);
      setSummary(s);
      setDebtors(d.items || []);
      setHistory(h || []);
    } catch (e) {
      console.error("Error cargando créditos", e);
    } finally {
      setLoadingSummary(false);
      setLoadingDebtors(false);
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleExport = () => {
    const flat = debtors.map(d => ({
      Cliente: d.client.fullName,
      DNI: d.client.dni,
      Saldo: d.balance,
      UltimaActividad: d.lastCreditAt ? new Date(d.lastCreditAt).toLocaleDateString("es-AR") : "-",
      Estado: d.balance <= 0 ? "SALDADO" : getDaysSince(d.lastCreditAt) >= 30 ? "VENCIDO" : "VIGENTE",
    }));
    exportToCSV(flat, "deudores_cuentas_corrientes");
  };

  const handleSettle = async (payload: { amount: number; method: "cash" | "transfer"; note?: string }) => {
    if (!settleTarget) return;
    await settleDebt(settleTarget.clientId, payload);
    setSettleTarget(null);
    fetchAll();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Cuentas corrientes</h1>
          <p className="text-sm text-neutral-500 mt-1">Gestioná los saldos pendientes de tus clientes</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-sm"
          >
            <span className="material-icons text-base">download</span>
            Exportar deudores
          </button>
          <button
            onClick={() => setSettleTarget({ clientId: "", clientName: "General", debt: 0 })}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <span className="material-icons text-base">payments</span>
            Registrar pago
          </button>
        </div>
      </div>

      {/* KPIs */}
      <CreditsKPIs summary={summary} loading={loadingSummary} />

      {/* Main grid: Tabla + Panel Historial */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Tabla de deudores (ocupa 2/3) */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100">
              <h2 className="font-semibold text-neutral-800">Detalle de deudores</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    {["Cliente", "Últ. Venta", "Antigüedad", "Saldo", "Estado", "Acciones"].map(h => (
                      <th key={h} className="px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {loadingDebtors ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {[...Array(6)].map((_, j) => (
                          <td key={j} className="px-5 py-4">
                            <div className="h-4 bg-neutral-100 rounded w-3/4" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : debtors.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-neutral-400">
                        No hay deudores activos
                      </td>
                    </tr>
                  ) : (
                    debtors.map((item) => {
                      const days = getDaysSince(item.lastCreditAt);
                      return (
                        <tr key={item.client.id} className="hover:bg-neutral-50/60 transition-colors">
                          {/* Cliente */}
                          <td className="px-5 py-4">
                            <div className="font-semibold text-neutral-900">{item.client.fullName}</div>
                            <div className="text-xs text-neutral-400">DNI {item.client.dni}</div>
                          </td>
                          {/* Últ. Venta */}
                          <td className="px-5 py-4 text-neutral-600 text-xs whitespace-nowrap">
                            {item.lastCreditAt
                              ? new Date(item.lastCreditAt).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
                              : "—"}
                          </td>
                          {/* Antigüedad */}
                          <td className="px-5 py-4">
                            {item.lastCreditAt ? <AgePill days={days} /> : <span className="text-neutral-400">—</span>}
                          </td>
                          {/* Saldo */}
                          <td className="px-5 py-4">
                            <span className={`font-bold text-base ${item.balance > 0 ? "text-red-500" : "text-neutral-500"}`}>
                              {item.balance > 0 ? `-$${item.balance.toFixed(2)}` : `$${item.balance.toFixed(2)}`}
                            </span>
                          </td>
                          {/* Estado */}
                          <td className="px-5 py-4">
                            <StatusBadge days={days} balance={item.balance} />
                          </td>
                          {/* Acciones */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              {item.balance > 0 && (
                                <button
                                  onClick={() => setSettleTarget({
                                    clientId: item.client.id,
                                    clientName: item.client.fullName,
                                    debt: item.balance,
                                  })}
                                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Saldar
                                </button>
                              )}
                              <button className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors">
                                <span className="material-icons text-base">visibility</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Panel Historial (1/3) */}
        <div className="xl:col-span-1">
          <RecentHistoryPanel
            movements={history}
            loading={loadingHistory}
          />
        </div>
      </div>

      {/* Modal Saldar deuda */}
      {settleTarget && settleTarget.clientId && (
        <SettleDebtModal
          isOpen={true}
          clientName={settleTarget.clientName}
          currentDebt={settleTarget.debt}
          onClose={() => setSettleTarget(null)}
          onConfirm={handleSettle}
        />
      )}
    </div>
  );
}
