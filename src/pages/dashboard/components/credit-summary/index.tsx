import { money } from '../../../../lib/format';
import type { CreditSummaryProps } from '../../types';

export function CreditSummary({ totalOutstanding, clientsWithDebt }: CreditSummaryProps) {
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