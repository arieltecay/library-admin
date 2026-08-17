import React, { useState, useMemo } from 'react';

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  pageSize?: number;
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  pageSize = 10,
  emptyMessage = "No hay resultados",
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const safeData = data || [];
  const totalPages = Math.ceil(safeData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return safeData.slice(start, start + pageSize);
  }, [safeData, currentPage, pageSize]);

  return (
    <div className="w-full flex flex-col bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-neutral-600">
          <thead className="text-xs uppercase text-neutral-500 bg-neutral-50 border-b border-neutral-200">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-6 py-4 font-semibold tracking-wider ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-neutral-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr key={keyExtractor(item)} className="hover:bg-neutral-50/50 transition-colors">
                  {columns.map((col, idx) => (
                    <td key={idx} className={`px-6 py-4 align-middle ${col.className || ''}`}>
                      {col.cell ? col.cell(item) : col.accessorKey ? (item[col.accessorKey] as React.ReactNode) : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 bg-neutral-50/50">
          <span className="text-sm text-neutral-500">
            Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, safeData.length)} de {safeData.length}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-white border border-neutral-300 rounded-md disabled:opacity-50 hover:bg-neutral-50 transition-colors"
            >
              Anterior
            </button>
            <span className="text-sm font-medium text-neutral-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-white border border-neutral-300 rounded-md disabled:opacity-50 hover:bg-neutral-50 transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
