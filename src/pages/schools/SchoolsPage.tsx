import { useState, useRef } from 'react';
import { useToast } from '../../components/Toast/useToast';
import { useSchools } from './hooks/useSchools';
import { SchoolFormModal } from './components/SchoolFormModal';
import { ConfirmModal } from './components/ConfirmModal';
import { SchoolsTable } from './components/SchoolsTable';
import type { School } from './types';

export default function SchoolsPage() {
  const { success, error: showError } = useToast();
  const {
    schools,
    total,
    loading,
    error,
    page,
    setPage,
    search,
    setSearch,
    limit,
    createSchool,
    updateSchool,
    toggleActive,
    deleteSchool,
    togglingId,
  } = useSchools();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const editingSchoolRef = useRef<School | null>(null);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    school: School | null;
    action: 'delete';
  }>({ isOpen: false, school: null, action: 'delete' });

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      await toggleActive(id, active);
      success(`Escuela ${active ? 'activada' : 'desactivada'}`);
    } catch (err: any) {
      showError(err?.response?.data?.message ?? 'Error al cambiar estado');
    }
  };

  const handleDeleteClick = (school: School) => {
    setConfirmState({
      isOpen: true,
      school,
      action: 'delete',
    });
  };

  const handleConfirm = async () => {
    if (!confirmState.school) return;
    try {
      if (confirmState.action === 'delete') {
        await deleteSchool(confirmState.school.id);
        success('Escuela eliminada');
      }
    } catch (err: any) {
      showError(err?.response?.data?.message ?? 'Error al eliminar');
    } finally {
      setConfirmState({ isOpen: false, school: null, action: 'delete' });
    }
  };

  const handleCancel = () => {
    setConfirmState({ isOpen: false, school: null, action: 'delete' });
  };

  const handleEditClick = (school: School) => {
    editingSchoolRef.current = school;
    setEditingSchool(school);
    setShowEditModal(true);
  };

  const handleCreate = async (data: any) => {
    try {
      await createSchool(data);
      success('Escuela creada');
      setShowCreateModal(false);
    } catch (err: any) {
      showError(err?.response?.data?.message ?? 'Error al crear');
    }
  };

  const handleUpdate = async (data: any) => {
    const school = editingSchoolRef.current;
    if (!school) return;
    try {
      await updateSchool(school.id, data);
      success('Escuela actualizada');
      setShowEditModal(false);
      editingSchoolRef.current = null;
      setEditingSchool(null);
    } catch (err: any) {
      showError(err?.response?.data?.message ?? 'Error al actualizar');
    }
  };

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Escuelas</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <span className="material-icons">add</span>
          Nueva Escuela
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg" role="alert">
          {error}
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar escuela... (/)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar escuelas"
          className="w-full max-w-md px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <SchoolsTable
        schools={schools}
        loading={loading}
        togglingId={togglingId}
        onToggle={handleToggleActive}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {total > limit && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-neutral-600">
            Mostrando {from}-{to} de {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-sm font-medium text-neutral-700">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1 border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      <SchoolFormModal
        isOpen={showCreateModal}
        school={null}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
      />

      <SchoolFormModal
        isOpen={showEditModal}
        school={editingSchool}
        onClose={() => { setShowEditModal(false); setEditingSchool(null); editingSchoolRef.current = null; }}
        onUpdate={handleUpdate}
      />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title="Confirmar eliminación"
        message={confirmState.school
          ? `¿Estás seguro de eliminar la escuela "${confirmState.school.name}"? Esta acción no se puede deshacer.`
          : '¿Estás seguro?'}
        variant="danger"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
      />
    </div>
  );
}