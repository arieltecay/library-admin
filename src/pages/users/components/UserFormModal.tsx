import { useState } from "react";
import Modal from "../../../components/Modal";
import type { CreateUserPayload, UpdateUserPayload, UserItem } from "../../../api/usersService";

interface UserFormModalProps {
  isOpen: boolean;
  editUser?: UserItem | null;
  onClose: () => void;
  onSave: (payload: CreateUserPayload | UpdateUserPayload) => Promise<void>;
}

export default function UserFormModal({ isOpen, editUser, onClose, onSave }: UserFormModalProps) {
  const isEdit = !!editUser;
  const [form, setForm] = useState({
    name: editUser?.name ?? "",
    email: editUser?.email ?? "",
    password: "",
    pin: "",
    role: editUser?.role ?? "seller" as "admin" | "seller",
    active: editUser?.active ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: string, value: string | boolean) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim()) {
      setError("Nombre y email son requeridos.");
      return;
    }
    if (!isEdit && (!form.password || form.password.length < 6)) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (!isEdit && (!form.pin || form.pin.length < 4)) {
      setError("El PIN debe tener al menos 4 dígitos.");
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        const payload: UpdateUserPayload = { name: form.name, email: form.email, role: form.role, active: form.active };
        if (form.password) payload.password = form.password;
        if (form.pin) payload.pin = form.pin;
        await onSave(payload);
      } else {
        await onSave({ name: form.name, email: form.email, password: form.password, pin: form.pin, role: form.role });
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Error al guardar. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Editar usuario" : "Nuevo usuario"}
      size="md"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">
            Cancelar
          </button>
          <button
            type="submit"
            form="user-form"
            disabled={loading}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            {loading && <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
            {isEdit ? "Guardar cambios" : "Crear usuario"}
          </button>
        </div>
      }
    >
      <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Nombre completo</label>
          <input
            type="text"
            value={form.name}
            onChange={e => handleChange("name", e.target.value)}
            placeholder="Ej: Juan Pérez"
            className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Correo electrónico</label>
          <input
            type="email"
            value={form.email}
            onChange={e => handleChange("email", e.target.value)}
            placeholder="usuario@sistema.com"
            className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            required
          />
        </div>

        {/* Rol */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Rol</label>
          <div className="flex gap-3">
            {(["admin", "seller"] as const).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => handleChange("role", r)}
                className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all ${
                  form.role === r
                    ? r === "admin"
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-amber-500 text-white border-amber-500"
                    : "bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50"
                }`}
              >
                <span className="material-icons text-sm mr-1 align-text-bottom">
                  {r === "admin" ? "admin_panel_settings" : "store"}
                </span>
                {r === "admin" ? "Admin" : "Vendedor"}
              </button>
            ))}
          </div>
        </div>

        {/* Contraseña y PIN (lado a lado) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Contraseña {isEdit && <span className="text-neutral-400 font-normal">(opcional)</span>}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => handleChange("password", e.target.value)}
              placeholder={isEdit ? "Sin cambios" : "Mínimo 6 caracteres"}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              required={!isEdit}
              minLength={isEdit ? undefined : 6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              PIN {isEdit && <span className="text-neutral-400 font-normal">(opcional)</span>}
            </label>
            <input
              type="password"
              value={form.pin}
              onChange={e => handleChange("pin", e.target.value.replace(/\D/, ""))}
              placeholder={isEdit ? "Sin cambios" : "4 dígitos"}
              maxLength={6}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              required={!isEdit}
            />
          </div>
        </div>

        {/* Estado (solo en edición) */}
        {isEdit && (
          <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <div>
              <p className="text-sm font-medium text-neutral-700">Estado del usuario</p>
              <p className="text-xs text-neutral-500">Los usuarios inactivos no pueden acceder al sistema</p>
            </div>
            <button
              type="button"
              onClick={() => handleChange("active", !form.active)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.active ? "bg-green-500" : "bg-neutral-300"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.active ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-600 text-sm">{error}</div>
        )}
      </form>
    </Modal>
  );
}
