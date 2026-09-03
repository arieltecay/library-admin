import { money } from '../../../../lib/format';
import type { TopProductsTableProps } from '../../types';

export function TopProductsTable({ products, className }: TopProductsTableProps) {
  return (
    <div className={`bg-white border border-neutral-200 rounded-xl p-5 ${className ?? ''}`}>
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