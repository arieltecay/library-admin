import { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAdmins } from './hooks/useAdmins';
import { AdminFormModal } from './components/AdminFormModal';
import { ConfirmModal } from './components/ConfirmModal';
import { AdminsTable } from './components/AdminsTable';
import { useToast } from '../../components/Toast/useToast';
import type { Admin } from './types';

export default function AdminsPage() {
  const { isSuperAdmin } = useAuth();
  const { success, error: showError } = useToast();
  const {
    admins,
    total,
    loading,
    error,
    page,
    setPage,
    search,
    setSearch,
    createAdmin,
    updateAdmin,
    toggleActive,
    deleteAdmin,
    togglingId,
  } = useAdmins();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const editingAdminRef = useRef<Admin | null>(null);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    admin: Admin | null;
    action: 'delete' | 'deactivate';
  }>({ isOpen: false, admin: null, action: 'delete' });

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      await toggleActive(id, active);
      success(`Administrador ${active ? 'activado' : 'desactivado'}`);
    } catch (err: any) {
      showError(err?.response?.data?.message ?? 'Error al cambiar estado');
    }
  };

  const handleDeleteClick = (admin: Admin) => {
    setConfirmState({
      isOpen: true,
      admin,
      action: 'delete',
    });
  };

  const handleConfirm = async () => {
    if (!confirmState.admin) return;
    try {
      if (confirmState.action === 'delete') {
        await deleteAdmin(confirmState.admin.id);
        success('Administrador eliminado');
      }
    } catch (err: any) {
      showError(err?.response?.data?.message ?? 'Error al eliminar');
    } finally {
      setConfirmState({ isOpen: false, admin: null, action: 'delete' });
    }
  };

  const handleCancel = () => {
    setConfirmState({ isOpen: false, admin: null, action: 'delete' });
  };

  const handleEditClick = (admin: Admin) => {
    editingAdminRef.current = admin;
    setEditingAdmin(admin);
    setShowEditModal(true);
  };

  const handleUpdate = async (data: any) => {
    const admin = editingAdminRef.current;
    if (!admin) return;
    try {
      await updateAdmin(admin.id, data);
      success('Administrador actualizado');
      setShowEditModal(false);
      editingAdminRef.current = null;
      setEditingAdmin(null);
    } catch (err: any) {
      showError(err?.response?.data?.message ?? 'Error al actualizar');
    }
  };

  if (!isSuperAdmin) return null;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Administradores</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <span className="material-icons">add</span>
          Nuevo Administrador
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
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar administradores"
          className="w-full max-w-md px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <AdminsTable
            admins={admins}
            loading={loading}
            togglingId={togglingId}
            onToggle={handleToggleActive}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />

      {total > 20 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-neutral-600">
            Mostrando {admins.length} de {total} administradores
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page * 20 >= total}
              className="px-3 py-1 border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      <AdminFormModal
        isOpen={showCreateModal}
        admin={null}
        onClose={() => setShowCreateModal(false)}
        onCreate={async (data) => { await createAdmin(data); setShowCreateModal(false); }}
      />

      <AdminFormModal
        isOpen={showEditModal}
        admin={editingAdmin}
        onClose={() => { setShowEditModal(false); setEditingAdmin(null); editingAdminRef.current = null; }}
        onUpdate={handleUpdate}
      />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={confirmState.action === 'delete' ? 'Confirmar eliminación' : 'Confirmar'}
        message={confirmState.admin
          ? `¿Estás seguro de eliminar al administrador "${confirmState.admin.name}"? Esta acción no se puede deshacer.`
          : '¿Estás seguro?'}
        variant="danger"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
      />
    </div>
  );
}