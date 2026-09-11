import type { AgePillProps, StatusBadgeProps } from './types';

export const getDaysSince = (dateStr?: string): number => {
  if (!dateStr) return 0;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const AgePill = ({ days }: AgePillProps) => {
  const overdue = days >= 30;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${
        overdue ? 'bg-red-100 text-red-600' : 'bg-neutral-100 text-neutral-600'
      }`}
    >
      {days} días
    </span>
  );
};

export const StatusBadge = ({ days, balance }: StatusBadgeProps) => {
  if (balance <= 0)
    return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full uppercase">Saldado</span>;
  if (days >= 30)
    return <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full uppercase">Vencido</span>;
  return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full uppercase">Vigente</span>;
};
