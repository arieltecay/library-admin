import { useEffect, useMemo, useState } from "react";
import { getOverview, type DashboardOverview } from "../api/dashboard";
import PageHeader from "../components/PageHeader";
import { money } from "../lib/format";
import { formatPercent } from "../lib/profit";

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

function BarChart({ labels, values, maxValue, title, className }: {
  labels: string[];
  values: number[];
  maxValue: number;
  title: string;
  className?: string;
}) {
  return (
    <div className={`bg-white border border-neutral-200 rounded-xl p-5 space-y-3 ${className ?? ""}`}>
      <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{title}</h3>
      <div className="flex items-end gap-2 h-40">
        {labels.map((label, i) => {
          const val = values[i] ?? 0;
          const heightPct = maxValue > 0 ? (val / maxValue) * 100 : 0;
          return (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-neutral-500">{money(val)}</span>
              <div
                className={`w-full rounded-t transition-all bg-primary-600 hover:bg-primary-700 ${val === 0 ? "bg-neutral-200" : ""}`}
                style={{ height: `${heightPct}%` }}
              />
              <span className="text-[10px] text-neutral-400">{label.split("-").slice(1).join("-")}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PaymentMethodBreakdown({ cash, transfer, credit }: { cash: number; transfer: number; credit: number }) {
  const total = cash + transfer + credit;
  const pct = (v: number) => total ? Math.round((v / total) * 100) : 0;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
      <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">POR MÉTODO DE PAGO</h3>
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20">
          <svg viewBox="0 0 36 36" className="w-20 h-20">
            <path d="M18 2 A 16 16 0 0 1 34 18 L 18 18 Z" fill="#22c55e" />
            <path
              d="M18 2 A 16 16 0 0 1 18 34 L 18 18 Z"
              fill="#3b82f6"
              transform={`rotate(${(pct(cash) / 100) * 360} 18 18)`}
            />
          </svg>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-success-500" /> Efectivo {pct(cash)}%</div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-blue-500" /> Transferencia {pct(transfer)}%</div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-warning-500" /> Crédito {pct(credit)}%</div>
        </div>
      </div>
    </div>
  );
}

function ProfitabilityCard({ revenue, cogs, grossProfit, grossMarginPercent }: {
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPercent: number | null;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
      <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">RENTABILIDAD</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-neutral-600">Revenue</span><span className="font-medium text-neutral-900">{money(revenue)}</span></div>
        <div className="flex justify-between"><span className="text-neutral-600">COGS</span><span className="font-medium text-neutral-900">{money(cogs)}</span></div>
        <div className="flex justify-between border-t border-neutral-100 pt-2"><span className="text-neutral-600">Ganancia bruta</span><span className="font-bold text-neutral-900">{money(grossProfit)}</span></div>
        <div className="flex justify-between"><span className="text-neutral-600">Margen bruto</span><span className={`font-bold ${grossMarginPercent !== null && grossMarginPercent < 0 ? "text-danger-600" : "text-success-600"}`}>{formatPercent(grossMarginPercent)}</span></div>
      </div>
    </div>
  );
}

function TopProductsTable({ products, className }: { products: { productId: string; name: string; quantity: number; revenue: number }[]; className?: string }) {
  return (
    <div className={`bg-white border border-neutral-200 rounded-xl p-5 ${className ?? ""}`}>
      <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">PRODUCTOS MÁS VENDIDOS</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs font-semibold text-neutral-400 uppercase">
            <th className="pb-2">Producto</th>
            <th className="pb-2 text-right">Unidades</th>
            <th className="pb-2 text-right">Recaudado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {products.map((p) => (
            <tr key={p.productId} className="align-top">
              <td className="py-2 font-medium text-neutral-700">{p.name}</td>
              <td className="py-2 text-right text-neutral-600">{p.quantity} un.</td>
              <td className="py-2 text-right text-neutral-600">{money(p.revenue)}</td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr><td colSpan={3} className="py-4 text-center text-neutral-400 text-sm">Sin ventas en el período</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function LowStockList({ items }: { items: { id: string; name: string; stock: number; minStock?: number }[] }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4">
      <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">STOCK BAJO</h3>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-400">Todo el stock OK</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {items.map((p) => (
            <li key={p.id} className="flex items-center justify-between">
              <span className="text-danger-600">{p.name}</span>
              <span className="font-semibold text-danger-600">{p.stock}/{p.minStock ?? 10}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CreditSummary({ totalOutstanding, clientsWithDebt }: { totalOutstanding: number; clientsWithDebt: number }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4">
      <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">CRÉDITOS PENDIENTES</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-700">Clientes con deuda</span>
          <span className="font-semibold text-neutral-900">{clientsWithDebt}</span>
        </div>
        <div className="flex justify-between text-sm pt-2 border-t border-neutral-100">
          <span className="text-neutral-500">TOTAL PENDIENTE</span>
          <span className="font-bold text-danger-600">−{money(totalOutstanding)}</span>
        </div>
      </div>
    </div>
  );
}

function SkeletonKpi() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 animate-pulse">
      <div className="h-4 w-24 bg-neutral-200 rounded mb-2" />
      <div className="h-8 w-32 bg-neutral-200 rounded" />
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 animate-pulse">
      <div className="h-4 w-40 bg-neutral-200 rounded mb-3" />
      <div className="flex items-end gap-2 h-40">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="h-4 w-16 bg-neutral-200 rounded" />
            <div className="w-full bg-neutral-200 rounded-t" style={{ height: "50%" }} />
            <div className="h-3 w-8 bg-neutral-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 animate-pulse">
      <div className="h-4 w-40 bg-neutral-200 rounded mb-3" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-32 bg-neutral-200 rounded" />
            <div className="h-4 w-16 bg-neutral-200 rounded" />
            <div className="h-4 w-20 bg-neutral-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 animate-pulse">
      <div className="h-4 w-32 bg-neutral-200 rounded mb-3" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-neutral-200 rounded" />
          <div className="h-4 w-20 bg-neutral-200 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-neutral-200 rounded" />
          <div className="h-4 w-20 bg-neutral-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [from, setFrom] = useState(() => new Date().toISOString().split("T")[0] ?? "");
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0] ?? "");
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const ac = new AbortController();
    async function load() {
      try {
        setLoading(true);
        setError("");
        const result = await getOverview({ from, to });
        setData(result);
      } catch (err: any) {
        setError(err.response?.data?.message || "Error cargando el dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => ac.abort();
  }, [from, to]);

  if (loading) {
    return (
      <div className="p-6">
        <PageHeader title="Dashboard - Library Admin" showBell primaryAction={{ label: "Nueva venta", icon: "add", onClick: () => {} }} />
        <div className="mt-6 space-y-4">
          <div className="flex gap-4">
            <input type="date" className="px-3 py-2 border border-neutral-300 rounded-lg w-40 bg-neutral-100" disabled />
            <span className="self-center text-neutral-400">–</span>
            <input type="date" className="px-3 py-2 border border-neutral-300 rounded-lg w-40 bg-neutral-100" disabled />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonKpi key={i} />)}
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2"><SkeletonChart /></div>
            <div><SkeletonCard /><SkeletonCard /></div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2"><SkeletonTable /></div>
            <div className="flex flex-col gap-6"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <PageHeader title="Dashboard - Library Admin" showBell primaryAction={{ label: "Nueva venta", icon: "add", onClick: () => {} }} />
        <p className="mt-4 text-sm text-danger-600">{error}</p>
      </div>
    );
  }

  const empty = !data || data.sales.count === 0;

  const maxSeries = useMemo(() => Math.max(...(data?.series.total ?? [0]), 1), [data?.series.total]);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Dashboard - Library Admin"
        subtitle={`Dashboard / Resumen general`}
        showBell
        primaryAction={{ label: "Nueva venta", icon: "add", onClick: () => {} }}
      />

      <div className="flex items-center gap-4">
        <label className="text-sm text-neutral-600">Desde</label>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-3 py-2 border border-neutral-300 rounded-lg w-40" />
        <label className="text-sm text-neutral-600">Hasta</label>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-3 py-2 border border-neutral-300 rounded-lg w-40" />
      </div>

      {error && <p className="text-sm text-danger-600">{error}</p>}

      {!empty && (
        <section className="grid grid-cols-4 gap-4">
          <KpiCard title="Ventas del período" value={money(data?.sales.total ?? 0)} hint={`${data?.sales.count ?? 0} ventas`} />
          <KpiCard title="Ticket promedio" value={money(data?.sales.avgTicket ?? 0)} hint={`${data?.sales.productsSold ?? 0} unidades`} />
          <KpiCard
            title="Ganancia bruta"
            value={money(data?.profitability.grossProfit ?? 0)}
            hint={formatPercent(data?.profitability.grossMarginPercent ?? null)}
            hintColor={data?.profitability.grossMarginPercent !== null && data?.profitability.grossMarginPercent < 0 ? "danger" : "success"}
          />
          <KpiCard title="Devoluciones" value={`−${money(data?.returns.amount ?? 0)}`} hint={`${data?.returns.count ?? 0}`} hintColor="danger" />
        </section>
      )}

      {!empty && (
        <div className="grid grid-cols-3 gap-6">
          <BarChart
            labels={data?.series.labels ?? []}
            values={data?.series.total ?? []}
            maxValue={maxSeries}
            title="VENTAS POR DÍA"
            className="col-span-2"
          />
          <div className="flex flex-col gap-6">
            <PaymentMethodBreakdown
              cash={data?.sales.cash ?? 0}
              transfer={data?.sales.transfer ?? 0}
              credit={data?.sales.credit ?? 0}
            />
            <ProfitabilityCard
              revenue={data?.profitability.revenue ?? 0}
              cogs={data?.profitability.cogs ?? 0}
              grossProfit={data?.profitability.grossProfit ?? 0}
              grossMarginPercent={data?.profitability.grossMarginPercent ?? null}
            />
          </div>
        </div>
      )}

      {!empty && (
        <div className="grid grid-cols-3 gap-6">
          <TopProductsTable products={data?.topProducts ?? []} className="col-span-2" />
          <div className="flex flex-col gap-6">
            <LowStockList items={data?.lowStock ?? []} />
            <CreditSummary
              totalOutstanding={data?.credit.totalOutstanding ?? 0}
              clientsWithDebt={data?.credit.clientsWithDebt ?? 0}
            />
          </div>
        </div>
      )}

      {empty && (
        <div className="text-center py-12 text-neutral-400">
          <span className="material-icons text-6xl mb-2 block">inbox</span>
          <p className="text-lg">Sin datos para el rango seleccionado</p>
        </div>
      )}
    </div>
  );
}