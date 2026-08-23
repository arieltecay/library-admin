import { useEffect, useState } from "react";
import { adminsService, type Admin, type CreateAdminPayload, type UpdateAdminPayload } from "../../api/adminsService";
import { useAuth } from "../../hooks/useAuth";

export default function AdminsPage() {
  const { isSuperAdmin } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState<CreateAdminPayload>({
    name: "",
    email: "",
    password: "",
    pin: "",
    schoolName: "",
    schoolCode: "",
  });
  const [editFormData, setEditFormData] = useState<UpdateAdminPayload>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdmins();
    }
  }, [isSuperAdmin, page, search]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await adminsService.list({ search, page, limit: 20 });
      setAdmins(res.items);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar administradores");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await adminsService.create(formData);
      setShowCreateModal(false);
      setFormData({ name: "", email: "", password: "", pin: "", schoolName: "", schoolCode: "" });
      fetchAdmins();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al crear administrador");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setSubmitting(true);
    setError("");
    try {
      await adminsService.update(editingAdmin.id, editFormData);
      setShowEditModal(false);
      setEditingAdmin(null);
      fetchAdmins();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al actualizar administrador");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de desactivar este administrador?")) return;
    try {
      await adminsService.delete(id);
      fetchAdmins();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al desactivar administrador");
    }
  };

  const openEditModal = (admin: Admin) => {
    setEditingAdmin(admin);
    setEditFormData({
      name: admin.name,
      email: admin.email,
      active: admin.active,
    });
    setShowEditModal(true);
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
          className="w-full max-w-md px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="pb-3 font-semibold text-neutral-700">Nombre</th>
              <th className="pb-3 font-semibold text-neutral-700">Email</th>
              <th className="pb-3 font-semibold text-neutral-700">Negocio</th>
              <th className="pb-3 font-semibold text-neutral-700">Estado</th>
              <th className="pb-3 font-semibold text-neutral-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-neutral-500">
                  Cargando...
                </td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-neutral-500">
                  No hay administradores registrados
                </td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-3 font-medium text-neutral-900">{admin.name}</td>
                  <td className="py-3 text-neutral-600">{admin.email}</td>
                  <td className="py-3 text-neutral-600">
                    {admin.school ? `${admin.school.name} (${admin.school.code})` : "—"}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        admin.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {admin.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(admin)}
                        className="px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(admin.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Desactivar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > 20 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-neutral-600">
            Mostrando {admins.length} de {total} administradores
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 20 >= total}
              className="px-3 py-1 border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">Nuevo Administrador</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-neutral-500 hover:text-neutral-700">
                <span className="material-icons text-2xl">close</span>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Contraseña *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">PIN (4 dígitos) *</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    pattern="[0-9]*"
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre del Negocio *</label>
                  <input
                    type="text"
                    required
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Código del Negocio *</label>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    value={formData.schoolCode}
                    onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {submitting ? "Creando..." : "Crear Administrador"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">Editar Administrador</h2>
              <button onClick={() => { setShowEditModal(false); setEditingAdmin(null); }} className="text-neutral-500 hover:text-neutral-700">
                <span className="material-icons text-2xl">close</span>
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={editFormData.name || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editFormData.email || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Nueva Contraseña (opcional)</label>
                <input
                  type="password"
                  minLength={8}
                  value={editFormData.password || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Nuevo PIN (opcional)</label>
                <input
                  type="text"
                  maxLength={4}
                  pattern="[0-9]*"
                  value={editFormData.pin || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, pin: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={editFormData.active ?? true}
                  onChange={(e) => setEditFormData({ ...editFormData, active: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="active" className="text-sm text-neutral-700">Activo</label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingAdmin(null); }}
                  className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {submitting ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}