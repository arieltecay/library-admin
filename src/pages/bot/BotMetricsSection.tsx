import { useEffect, useState } from "react";
import { getBotMetrics, type BotMetrics } from "../../api/bot";

const RANGES = [
  { label: "7 días", days: 7 },
  { label: "30 días", days: 30 },
  { label: "90 días", days: 90 },
];

function usd(v: number): string {
  if (v === 0) return "$0";
  if (v < 0.01) return `$${v.toFixed(4)}`;
  return `$${v.toFixed(2)}`;
}

function seconds(ms: number): string {
  if (ms === 0) return "—";
  return `${(ms / 1000).toFixed(1)}s`;
}

function KpiCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-1">
      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      {hint && <span className="text-xs font-medium text-neutral-500">{hint}</span>}
    </div>
  );
}

export function BotMetricsSection() {
  const [metrics, setMetrics] = useState<BotMetrics | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getBotMetrics(days)
      .then(data => {
        if (!cancelled) setMetrics(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const avgCostPerRequest = metrics && metrics.requests > 0 ? metrics.costUsd / metrics.requests : 0;

  if (loading && !metrics) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm animate-pulse">
        <div className="h-6 w-48 bg-neutral-200 rounded mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-neutral-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-icons text-blue-600">insights</span>
          <h2 className="text-lg font-semibold text-neutral-900">Métricas del bot</h2>
        </div>
        <p className="text-sm text-neutral-500">Error al cargar las métricas. Intentá de nuevo más tarde.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="material-icons text-blue-600">insights</span>
          <h2 className="text-lg font-semibold text-neutral-900">Métricas del bot</h2>
        </div>
        <div className="flex gap-1 bg-neutral-100 rounded-lg p-1">
          {RANGES.map(r => (
            <button
              key={r.days}
              type="button"
              onClick={() => setDays(r.days)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                days === r.days ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {metrics && metrics.requests === 0 ? (
        <p className="text-sm text-neutral-500">
          Todavía no hay uso registrado del bot en los últimos {days} días.
        </p>
      ) : metrics ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard
              title="Gasto total"
              value={usd(metrics.costUsd)}
              hint={`${usd(avgCostPerRequest)} por mensaje`}
            />
            <KpiCard
              title="Mensajes respondidos"
              value={String(metrics.requests)}
              hint={`${metrics.toolCalls} búsquedas de catálogo`}
            />
            <KpiCard
              title="Respuesta (1er token)"
              value={seconds(metrics.avgTtftMs)}
              hint={`Total ${seconds(metrics.avgLatencyMs)}`}
            />
            <KpiCard
              title="Caché de contexto"
              value={`${metrics.cacheRatioPct}%`}
              hint={`${metrics.cachedTokens.toLocaleString("es-AR")} de ${metrics.promptTokens.toLocaleString("es-AR")} tokens`}
            />
          </div>

          <p className="text-xs text-neutral-400">
            Costo estimado por mensaje: la caché de contexto reutiliza el prompt del sistema en mensajes seguidos, reduciendo el gasto por mensaje.
          </p>
        </>
      ) : null}
    </div>
  );
}
