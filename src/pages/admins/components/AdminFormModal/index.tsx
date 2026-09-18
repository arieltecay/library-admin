import { useState, useEffect } from 'react';
import Modal from '../../../../components/Modal';
import { AdminSwitch } from '../AdminSwitch';
import type { AdminFormModalProps } from './types';

export function AdminFormModal({ isOpen, admin, onClose, onCreate, onUpdate }: AdminFormModalProps) {
  const isEdit = !!admin;
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    pin: '',
    schoolName: '',
    schoolCode: '',
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (admin) {
        setForm({
          name: admin.name,
          email: admin.email,
          password: '',
          pin: '',
          schoolName: admin.school?.name ?? '',
          schoolCode: admin.school?.code ?? '',
          active: admin.active,
        });
      } else {
        setForm({
          name: '',
          email: '',
          password: '',
          pin: '',
          schoolName: '',
          schoolCode: '',
          active: true,
        });
      }
      setError('');
    }
  }, [isOpen, admin]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim()) {
      setError('Nombre y email son requeridos.');
      return;
    }
    if (!isEdit && (!form.password || form.password.length < 8)) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!isEdit && (!form.pin || form.pin.length < 4)) {
      setError('El PIN debe tener 4 dígitos.');
      return;
    }
    if (!form.schoolName.trim() || !form.schoolCode.trim()) {
      setError('Nombre y código del negocio son requeridos.');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        const payload = {
          name: form.name,
          email: form.email,
          active: form.active,
          ...(form.password && { password: form.password }),
          ...(form.pin && { pin: form.pin }),
        };
        await onUpdate?.(payload);
      } else {
        const payload = {
          name: form.name,
          email: form.email,
          password: form.password,
          pin: form.pin,
          schoolName: form.schoolName,
          schoolCode: form.schoolCode.toUpperCase(),
        };
        await onCreate?.(payload);
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Error al guardar. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar Administrador' : 'Nuevo Administrador'} size="lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-4" id="admin-form">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="usuario@sistema.com"
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Contraseña {isEdit && <span className="text-neutral-400 font-normal">(opcional)</span>} *
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder={isEdit ? 'Sin cambios' : 'Mínimo 8 caracteres'}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              required={!isEdit}
              minLength={isEdit ? undefined : 8}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              PIN (4 dígitos) {isEdit && <span className="text-neutral-400 font-normal">(opcional)</span>} *
            </label>
            <input
              type="password"
              value={form.pin}
              onChange={(e) => handleChange('pin', e.target.value.replace(/\D/, ''))}
              placeholder={isEdit ? 'Sin cambios' : '4 dígitos'}
              maxLength={4}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              required={!isEdit}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre del Negocio *</label>
            <input
              type="text"
              required
              value={form.schoolName}
              onChange={(e) => handleChange('schoolName', e.target.value)}
              placeholder="Ej: Escuela Primaria N° 1"
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Código del Negocio *</label>
            <input
              type="text"
              required
              maxLength={20}
              value={form.schoolCode}
              onChange={(e) => handleChange('schoolCode', e.target.value.toUpperCase())}
              placeholder="Ej: EP1"
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
        </div>

        {isEdit && (
          <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <div>
              <p className="text-sm font-medium text-neutral-700">Estado del administrador</p>
              <p className="text-xs text-neutral-500">Los administradores inactivos no pueden acceder al sistema</p>
            </div>
            <AdminSwitch
              active={form.active}
              onToggle={() => handleChange('active', !form.active)}
              aria-label={`Estado del administrador: ${form.active ? 'Activo' : 'Inactivo'}`}
            />
          </div>
        )}

        {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-600 text-sm">{error}</div>}

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="admin-form"
            disabled={loading}
            className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Guardando...
              </>
            ) : (
              isEdit ? 'Guardar cambios' : 'Crear administrador'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}