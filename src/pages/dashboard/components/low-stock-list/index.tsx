import type { LowStockListProps } from '../../types';

export function LowStockList({ items }: LowStockListProps) {
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