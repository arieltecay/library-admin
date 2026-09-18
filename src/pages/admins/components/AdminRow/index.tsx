import type { AdminRowProps } from './types';
import { AdminSwitch } from '../AdminSwitch';

export function AdminRow({ admin, onToggle, onEdit, onDelete, togglingId }: AdminRowProps) {

  return (
    <tr key={admin.id} className="border-b border-neutral-100 hover:bg-neutral-50">
      <td className="py-3 font-medium text-neutral-900">{admin.name}</td>
      <td className="py-3 text-neutral-600">{admin.email}</td>
      <td className="py-3 text-neutral-600">
        {admin.school ? `${admin.school.name} (${admin.school.code})` : '—'}
      </td>
      <td className="py-3 text-center">
        <AdminSwitch
          active={admin.active}
          onToggle={() => onToggle(admin.id, !admin.active)}
          disabled={!!togglingId}
          aria-label={`${admin.active ? 'Desactivar' : 'Activar'} a ${admin.name}`}
        />
      </td>
      <td className="py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(admin)}
            className="px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(admin)}
            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  );
}