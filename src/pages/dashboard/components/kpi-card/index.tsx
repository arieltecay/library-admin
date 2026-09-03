import type { KpiCardProps } from '../../types';

const hintColorMap: Record<string, string> = {
  success: 'text-success-600',
  danger: 'text-danger-600',
  warning: 'text-warning-600',
  neutral: 'text-neutral-500',
};

export function KpiCard({ title, value, hint, hintColor }: KpiCardProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-1">
      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      {hint && <span className={`text-xs font-medium ${hintColorMap[hintColor ?? 'neutral']}`}>{hint}</span>}
    </div>
  );
}