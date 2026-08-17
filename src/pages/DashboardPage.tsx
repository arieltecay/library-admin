import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import api from "../api/client";
import PageHeader from "../components/PageHeader";
import { money, initials } from "../lib/format";
import type {
  TodayKPIs,
  SalesChartData,
  TopProduct,
  Product,
  CashShiftSummary,
  User,
  Client,
} from "../api/types";

function KpiCard({ title, value, hint, hintColor }: {
  title: string;
  value: string;
  hint?: string;
  hintColor?: "success" | "danger" | "warning" | "neutral";
}) {
  const hintColorMap: Record<string, string> = {
    success: "text-success-600",
    danger: "text-danger-600",
    warning: "text-warning-600",
    neutral: "text-neutral-500",
  };
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-1">
      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      {hint && <span className={`text-xs font-medium ${hintColorMap[hintColor ?? "neutral"]}`}>{hint}</span>}
    </div>
  );
}

export default function DashboardPage() {
  const [kpi, setKpi] = useState<TodayKPIs | null>(null);
  const [chart, setChart] = useState<SalesChartData | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [shifts, setShifts] = useState<CashShiftSummary[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [debtors, setDebtors] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const ac = new AbortController();
    async function load() {
      try {
        const [kpiRes, chartRes, topRes, stockRes, shiftsRes, usersRes, debtorsRes] = await Promise.all([
          api.get("/dashboard/today"),
          api.get("/dashboard/sales-by-hour"),
          api.get("/dashboard/top-products", { params: { limit: 4 } }),
          api.get("/products", { params: { lowStock: true, limit: 6 } }),
          api.get("/dashboard/shifts"),
          api.get("/users", { params: { limit: 50 } }),
          api.get("/clients/debtors"),
        ]);
        setKpi(kpiRes.data);
        setChart(chartRes.data);
        setTopProducts(topRes.data);
        setLowStock(stockRes.data.items);
        setShifts(shiftsRes.data);
        setUsers(usersRes.data.items);
        setDebtors(debtorsRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Error cargando el dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => ac.abort();
  }, []);

  const filteredTop = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return topProducts;
    return topProducts.filter((p) => p.name.toLowerCase().includes(q));
  }, [topProducts, search]);

  const sellerName = (id: string) => users.find((u) => u.id === id)?.name ?? "—";

  if (loading) {
    return (
      <div className="p-6">
        <PageHeader title="Dashboard - Library Admin" showBell primaryAction={{ label: "Nueva venta", icon: "add", onClick: () => {} }} />
        <div className="mt-6 space-y-4">
          <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-neutral-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hourLabels = chart?.labels ?? [];
  const hourTotals = chart?.datasets.total ?? [];
  const maxHour = Math.max(...(hourTotals.length ? hourTotals : [0]), 1);
  const payTotal = (kpi?.cashAmount ?? 0) + (kpi?.transferAmount ?? 0) + (kpi?.creditAmount ?? 0);
  const payPct = (v: number) => (payTotal ? (v / payTotal) * 100 : 0);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Dashboard - Library Admin"
        subtitle={`Dashboard / Resumen general - ${todayLabel()}`}
        searchPlaceholder="Buscar ventas, /"
        searchValue={search}
        onSearchChange={setSearch}
        showBell
        primaryAction={{ label: "Nueva venta", icon: "add", onClick: () => {} }}
      />

      {error && <p className="text-sm text-danger-600">{error}</p>}

      <section className="grid grid-cols-4 gap-4">
        <KpiCard title="Ventas totales" value={money(kpi?.totalAmount ?? 0)} hint="+12% respecto a ayer" hintColor="success" />
        <KpiCard title="Efectivo" value={money(kpi?.cashAmount ?? 0)} />
        <KpiCard title="Créditos" value={money(kpi?.creditAmount ?? 0)} hint="Pendiente" hintColor="warning" />
        <KpiCard title="Devoluciones" value={`-${money(kpi?.returnsAmount ?? 0)}`} hintColor="danger" />
      </section>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">VENTAS POR HORA</h3>
          <div className="flex items-end items-stretch gap-2 h-40">
            {hourLabels.map((h, i) => {
              const val = hourTotals[i] ?? 0;
              const heightPct = (val / maxHour) * 100;
              return (
                <div key={h} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-neutral-500">{money(val)}</span>
                  <div
                    className={`w-full rounded-t transition-all bg-primary-600 hover:bg-primary-700 ${val === 0 ? "bg-neutral-200" : ""}`}
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] text-neutral-400">{h}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">POR MÉTODO DE PAGO</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 36 36" className="w-20 h-20">
                  <path d="M18 2 A 16 16 0 0 1 34 18 L 18 18 Z" fill="#22c55e" />
                  <path d="M18 2 A 16 16 0 0 1 18 34 L 18 18 Z" fill="#3b82f6" transform={`rotate(${(payPct(kpi?.cashAmount ?? 0) / 100) * 360} 18 18)`} />
                </svg>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-success-500" /> Efectivo {Math.round(payPct(kpi?.cashAmount ?? 0))}%</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-blue-500" /> Transferencia {Math.round(payPct(kpi?.transferAmount ?? 0))}%</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-warning-500" /> Crédito {Math.round(payPct(kpi?.creditAmount ?? 0))}%</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Acciones Rápidas</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="py-2.5 text-sm font-medium text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-50 flex items-center justify-center gap-2">
                <span className="material-icons text-base">add</span> Nuevo producto
              </button>
              <button className="py-2.5 text-sm font-medium text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-50 flex items-center justify-center gap-2">
                <span className="material-icons text-base">inventory</span> Cargar stock
              </button>
              <button className="py-2.5 text-sm font-medium text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-50 flex items-center justify-center gap-2">
                <span className="material-icons text-base">payments</span> Registrar pago
              </button>
              <button className="py-2.5 text-sm font-medium text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-50 flex items-center justify-center gap-2">
                <span className="material-icons text-base">history</span> Ver historial
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white border border-neutral-200 rounded-xl p-5">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Productos más vendidos</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-neutral-400 uppercase">
                <th className="pb-2">Producto</th>
                <th className="pb-2 text-right">Unidades</th>
                <th className="pb-2 text-right">Recaudado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredTop.map((p) => (
                <tr key={p.productId} className="align-top">
                  <td className="py-2 font-medium text-neutral-700">{p.name}</td>
                  <td className="py-2 text-right text-neutral-600">{p.quantity} un.</td>
                  <td className="py-2 text-right text-neutral-600">{money(p.revenue)}</td>
                </tr>
              ))}
              {filteredTop.length === 0 && (
                <tr><td colSpan={3} className="py-4 text-center text-neutral-400 text-sm">Sin resultados</td></tr>
              )}
            </tbody>
          </table>
          <button className="mt-2 text-xs font-medium text-primary-600 hover:underline">Ver reporte completo →</button>
        </div>

        <div className="flex flex-col gap-6">
          <BottomCard title="Stock bajo">
            {lowStock.length === 0 ? (
              <p className="text-sm text-neutral-400">Todo el stock OK</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {lowStock.map((p) => (
                  <li key={p.id} className="flex items-center justify-between">
                    <span className="text-danger-600">{p.name}</span>
                    <span className="font-semibold text-danger-600">{p.stock}/{p.minStock ?? 10}</span>
                  </li>
                ))}
              </ul>
            )}
          </BottomCard>

          <BottomCard title="Turnos del día">
            {shifts.length === 0 ? (
              <p className="text-sm text-neutral-400">Sin turnos</p>
            ) : (
              <ul className="space-y-2">
                {shifts.slice(0, 4).map((s) => (
                  <li key={s.id} className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${s.status === "open" ? "bg-success-100 text-success-700" : "bg-neutral-200 text-neutral-600"}`}>
                      {initials(sellerName(s.seller))}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">{sellerName(s.seller)}</p>
                      <p className="text-xs text-neutral-500">
                        {s.status === "open" ? "Abierto" : new Date(s.closedAt ?? s.openedAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <span className={`text-xs font-medium ${s.status === "open" ? "text-success-600" : "text-neutral-500"}`}>
                      {s.status === "open" ? "Abierto" : "Cerrado"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </BottomCard>

          <BottomCard title="Créditos pendientes">
            {debtors.length === 0 ? (
              <p className="text-sm text-neutral-400">Sin deuda pendiente</p>
            ) : (
              <div className="space-y-2">
                {debtors.slice(0, 4).map((c) => (
                  <div key={c.id} className="flex justify-between text-sm">
                    <span className="text-neutral-700">{c.fullName}</span>
                    <span className="font-semibold text-danger-600">−{money(c.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-neutral-100">
                  <span className="text-neutral-500">TOTAL PENDIENTE</span>
                  <span className="font-bold text-danger-600">
                    −{money(debtors.reduce((sum, c) => sum + c.balance, 0))}
                  </span>
                </div>
              </div>
            )}
          </BottomCard>
        </div>
      </div>
    </div>
  );
}

function BottomCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4">
      <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );
}

function todayLabel() {
  return new Date().toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}
