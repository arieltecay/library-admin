import { money } from '../../../../lib/format';
import { formatPercent } from '../../../../lib/profit';
import type { ProfitabilityCardProps } from '../../types';

export function ProfitabilityCard({ revenue, cogs, grossProfit, grossMarginPercent }: ProfitabilityCardProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
      <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">RESUMEN DE RENTABILIDAD</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-neutral-600">Ingresos (Ventas netas)</span><span className="font-medium text-neutral-900">{money(revenue)}</span></div>
        <div className="flex justify-between"><span className="text-neutral-600">Costo de ventas (COGS)</span><span className="font-medium text-neutral-900">{money(cogs)}</span></div>
        <div className="flex justify-between border-t border-neutral-100 pt-2"><span className="text-neutral-600">Ganancia bruta</span><span className="font-bold text-neutral-900">{money(grossProfit)}</span></div>
        <div className="flex justify-between"><span className="text-neutral-600">Margen bruto</span><span className={`font-bold ${grossMarginPercent !== null && grossMarginPercent < 0 ? 'text-danger-600' : 'text-success-600'}`}>{formatPercent(grossMarginPercent)}</span></div>
      </div>
    </div>
  );
}