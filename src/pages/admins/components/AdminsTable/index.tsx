import type { AdminsTableProps } from './types';
import { AdminRow } from '../AdminRow';

export function AdminsTable({ admins, loading, togglingId, onToggle, onEdit, onDelete, emptyMessage = 'No hay administradores registrados' }: AdminsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-neutral-200">
            <th className="pb-3 font-semibold text-neutral-700">Nombre</th>
            <th className="pb-3 font-semibold text-neutral-700">Email</th>
            <th className="pb-3 font-semibold text-neutral-700">Negocio</th>
            <th className="pb-3 font-semibold text-neutral-700 text-center">Estado</th>
            <th className="pb-3 font-semibold text-neutral-700">Acciones</th>
          </tr>
        </thead>
        {loading ? (
          <tbody>
            <tr>
              <td colSpan={5} className="py-8 text-center text-neutral-500">
                Cargando...
              </td>
            </tr>
          </tbody>
        ) : admins.length === 0 ? (
          <tbody>
            <tr>
              <td colSpan={5} className="py-8 text-center text-neutral-500">
                {emptyMessage}
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {admins.map((admin) => (
              <AdminRow
                key={admin.id}
                admin={admin}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
                togglingId={togglingId}
              />
            ))}
          </tbody>
        )}
      </table>
    </div>
  );
}