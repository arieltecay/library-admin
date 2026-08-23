import { useEffect, useState } from "react";
import { posService, type Pos, type CreatePosPayload, type UpdatePosPayload } from "../../api/posService";

export default function PosPage() {
  const [posList, setPosList] = useState<Pos[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPos, setEditingPos] = useState<Pos | null>(null);
  const [formData, setFormData] = useState<CreatePosPayload>({ name: "", code: "" });
  const [editFormData, setEditFormData] = useState<UpdatePosPayload>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPos();
  }, []);

  const fetchPos = async () => {
    try {
      setLoading(true);
      const res = await posService.list();
      setPosList(res.items);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar POS");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await posService.create(formData);
      setShowCreateModal(false);
      setFormData({ name: "", code: "" });
      fetchPos();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al crear POS");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPos) return;
    setSubmitting(true);
    setError("");
    try {
      await posService.update(editingPos.id, editFormData);
      setShowEditModal(false);
      setEditingPos(null);
      fetchPos();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al actualizar POS");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de desactivar este POS?")) return;
    try {
      await posService.delete(id);
      fetchPos();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al desactivar POS");
    }
  };

  const openEditModal = (pos: Pos) => {
    setEditingPos(pos);
    setEditFormData({
      name: pos.name,
      active: pos.active,
    });
    setShowEditModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">POS</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <span className="material-icons">add</span>
          Nuevo POS
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg" role="alert">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="pb-3 font-semibold text-neutral-700">Nombre</th>
              <th className="pb-3 font-semibold text-neutral-700">Código</th>
              <th className="pb-3 font-semibold text-neutral-700">Estado</th>
              <th className="pb-3 font-semibold text-neutral-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-neutral-500">
                  Cargando...
                </td>
              </tr>
            ) : posList.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-neutral-500">
                  No hay POS registrados
                </td>
              </tr>
            ) : (
              posList.map((pos) => (
                <tr key={pos.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-3 font-medium text-neutral-900">{pos.name}</td>
                  <td className="py-3 text-neutral-600">{pos.code}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        pos.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {pos.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(pos)}
                        className="px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(pos.id)}
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">Nuevo POS</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-neutral-500 hover:text-neutral-700">
                <span className="material-icons text-2xl">close</span>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
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
                <label className="block text-sm font-medium text-neutral-700 mb-1">Código *</label>
                <input
                  type="text"
                  required
                  maxLength={20}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
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
                  {submitting ? "Creando..." : "Crear POS"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingPos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">Editar POS</h2>
              <button onClick={() => { setShowEditModal(false); setEditingPos(null); }} className="text-neutral-500 hover:text-neutral-700">
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
                  onClick={() => { setShowEditModal(false); setEditingPos(null); }}
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