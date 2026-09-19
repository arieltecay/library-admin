import type { SchoolsTableProps } from './types';
import { SchoolRow } from '../SchoolRow';

export function SchoolsTable({ schools, loading, togglingId, onToggle, onEdit, onDelete, emptyMessage = 'No hay escuelas registradas' }: SchoolsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-neutral-50 text-xs font-semibold text-neutral-400 uppercase">
            <th className="px-3 py-2 text-left">Escuela</th>
            <th className="px-3 py-2 text-left">Código</th>
            <th className="px-3 py-2 text-left">Slug POS</th>
            <th className="px-3 py-2 text-left">URL Login POS</th>
            <th className="px-3 py-2 text-left">Dirección</th>
            <th className="px-3 py-2 text-center">Estado</th>
            <th className="px-3 py-2 text-center">Acciones</th>
          </tr>
        </thead>
        {loading ? (
          <tbody>
            <tr>
              <td colSpan={7} className="py-8 text-center text-neutral-500">
                Cargando...
              </td>
            </tr>
          </tbody>
        ) : schools.length === 0 ? (
          <tbody>
            <tr>
              <td colSpan={7} className="py-8 text-center text-neutral-500">
                {emptyMessage}
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody className="divide-y divide-neutral-100">
            {schools.map((school) => (
              <SchoolRow
                key={school.id}
                school={school}
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