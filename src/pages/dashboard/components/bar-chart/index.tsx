import { money } from '../../../../lib/format';
import type { BarChartProps } from '../../types';

export function BarChart({ labels, values, maxValue, title, className }: BarChartProps) {
  return (
    <div className={`bg-white border border-neutral-200 rounded-xl p-5 space-y-3 ${className ?? ''}`}>
      <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{title}</h3>
      <div className="flex items-end gap-2 h-40">
        {labels.map((label, i) => {
          const val = values[i] ?? 0;
          const heightPct = maxValue > 0 ? (val / maxValue) * 100 : 0;
          return (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-neutral-500">{money(val)}</span>
              <div
                className={`w-full rounded-t transition-all bg-primary-600 hover:bg-primary-700 ${val === 0 ? 'bg-neutral-200' : ''}`}
                style={{ height: `${heightPct}%` }}
              />
              <span className="text-[10px] text-neutral-400">{label.split('-').slice(1).join('-')}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}