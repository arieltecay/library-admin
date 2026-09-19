import { useState, useEffect } from 'react';
import Modal from '../../../../components/Modal';
import { SchoolSwitch } from '../SchoolSwitch';
import type { SchoolFormModalProps } from './types';

export function SchoolFormModal({ isOpen, school, onClose, onCreate, onUpdate }: SchoolFormModalProps) {
  const isEdit = !!school;
  const [form, setForm] = useState({
    name: '',
    code: '',
    slug: '',
    address: '',
    phone: '',
    email: '',
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (school) {
        setForm({
          name: school.name,
          code: school.code,
          slug: school.slug || '',
          address: school.address || '',
          phone: school.phone || '',
          email: school.email || '',
          active: school.active,
        });
      } else {
        setForm({
          name: '',
          code: '',
          slug: '',
          address: '',
          phone: '',
          email: '',
          active: true,
        });
      }
      setError('');
    }
  }, [isOpen, school]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.code.trim()) {
      setError('Nombre y código son requeridos.');
      return;
    }
    if (!form.slug.trim()) {
      setError('El slug es requerido.');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        const payload = {
          name: form.name,
          code: form.code,
          slug: form.slug,
          address: form.address,
          phone: form.phone,
          email: form.email,
          active: form.active,
        };
        await onUpdate?.(payload);
      } else {
        const payload = {
          name: form.name,
          code: form.code,
          slug: form.slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
          address: form.address,
          phone: form.phone,
          email: form.email,
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
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar Escuela' : 'Nueva Escuela'} size="lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-4" id="school-form">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ej: Escuela Primaria N° 1"
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Código *</label>
            <input
              type="text"
              required
              value={form.code}
              onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
              placeholder="Ej: EP1"
              maxLength={20}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Slug POS *</label>
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="Ej: mi-escuela"
              maxLength={150}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
            <p className="text-xs text-neutral-500 mt-1">Solo letras minúsculas, números y guiones. Se usa para la URL de login POS.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Dirección</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Ej: Av. Siempre Viva 123"
              maxLength={200}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Teléfono</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Ej: 11 1234-5678"
              maxLength={30}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="ejemplo@escuela.edu"
              maxLength={150}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />
          </div>
        </div>

        {isEdit && (
          <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <div>
              <p className="text-sm font-medium text-neutral-700">Estado de la escuela</p>
              <p className="text-xs text-neutral-500">Las escuelas inactivas no aparecen en el POS</p>
            </div>
            <SchoolSwitch
              active={form.active}
              onToggle={() => handleChange('active', !form.active)}
              aria-label={`Estado de la escuela: ${form.active ? 'Activa' : 'Inactiva'}`}
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
            form="school-form"
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
              isEdit ? 'Guardar cambios' : 'Crear escuela'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}