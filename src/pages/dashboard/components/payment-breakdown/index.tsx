import type { PaymentMethodBreakdownProps } from '../../types';

export function PaymentMethodBreakdown({ cash, transfer, credit }: PaymentMethodBreakdownProps) {
  const total = cash + transfer + credit;
  const pct = (v: number) => (total ? Math.round((v / total) * 100) : 0);

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