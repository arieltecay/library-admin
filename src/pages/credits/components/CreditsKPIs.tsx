import type { CreditsSummary } from "../../../api/creditsService";

interface CreditsKPIsProps {
  summary: CreditsSummary | null;
  loading: boolean;
}

function KPICard({
  label,
  value,
  sub,
  icon,
  iconBg,
  valueClass = "text-neutral-900",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: string;
  iconBg: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">{label}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
          <span className="material-icons text-lg text-white">{icon}</span>
        </div>
      </div>
      <div>
        <p className={`text-2xl font-bold leading-none ${valueClass}`}>{value}</p>
        {sub && (
          <p className="text-xs text-neutral-500 mt-1.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

function KPICardSkeleton() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-3 bg-neutral-100 rounded w-24" />
        <div className="w-9 h-9 rounded-lg bg-neutral-100" />
      </div>
      <div className="h-7 bg-neutral-100 rounded w-32 mb-1.5" />
      <div className="h-3 bg-neutral-100 rounded w-20" />
    </div>
  );
}

export default function CreditsKPIs({ summary, loading }: CreditsKPIsProps) {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <KPICardSkeleton key={i} />)}
      </div>
    );
  }

  const totalClientsApprox = 248; // ideally passed from a global state/context

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      <KPICard
        label="Deuda Total"
        value={`$${summary.totalOutstanding.toLocaleString("es-AR")}`}
        sub={`$${summary.totalPaymentsThisMonth.toLocaleString("es-AR")} cobrado`}
        icon="account_balance_wallet"
        iconBg="bg-amber-400"
      />
      <KPICard
        label="Clientes con Saldo"
        value={String(summary.clientsWithDebt)}
        sub={`de ${totalClientsApprox} totales`}
        icon="group"
        iconBg="bg-blue-500"
      />
      <KPICard
        label="Vencidos +30 Días"
        value={`$${summary.overdueAmount.toLocaleString("es-AR")}`}
        sub={`${summary.overdueCount} ${summary.overdueCount === 1 ? "cliente" : "clientes"}`}
        icon="event_busy"
        iconBg="bg-red-500"
        valueClass="text-red-600"
      />
      <KPICard
        label="Cobrado este Mes"
        value={`$${summary.totalPaymentsThisMonth.toLocaleString("es-AR")}`}
        sub={`${summary.totalCreditsThisMonth > 0 ? `$${summary.totalCreditsThisMonth.toLocaleString("es-AR")} en créditos` : "Sin créditos este mes"}`}
        icon="check_circle"
        iconBg="bg-green-500"
        valueClass="text-green-600"
      />
    </div>
  );
}
