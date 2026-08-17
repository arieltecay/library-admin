import { useEffect, useState } from "react";
import api from "../../api/client";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import { useToast } from "../../hooks/useToast";
import type { School, SchoolListResponse } from "../../api/types";

type SortOption = "name-asc" | "name-desc" | "code-asc" | "code-desc" | "created-asc" | "created-desc";

const SORT_MAP: Record<SortOption, { sortBy: string; sortOrder: "asc" | "desc" }> = {
  "name-asc": { sortBy: "name", sortOrder: "asc" },
  "name-desc": { sortBy: "name", sortOrder: "desc" },
  "code-asc": { sortBy: "code", sortOrder: "asc" },
  "code-desc": { sortBy: "code", sortOrder: "desc" },
  "created-asc": { sortBy: "createdAt", sortOrder: "asc" },
  "created-desc": { sortBy: "createdAt", sortOrder: "desc" },
};

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sort] = useState<SortOption>("name-asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<School | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<School | null>(null);
  const { success, error: showError } = useToast();

  useEffect(() => {
    const params: Record<string, unknown> = {
      page,
      limit,
      ...SORT_MAP[sort],
    };
    if (search.trim()) params.search = search.trim();

    let cancelled = false;
    const timer = setTimeout(() => {
      setLoading(true);
      api
        .get("/schools", { params })
        .then((r: { data: SchoolListResponse }) => {
          if (!cancelled) {
            setSchools(r.data.items);
            setTotal(r.data.total);
            setTotalPages(r.data.totalPages);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err.response?.data?.message || "Error cargando escuelas");
            setLoading(false);
          }
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [page, limit, search, sort]);

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  async function handleDelete(school: School) {
    try {
      await api.delete(`/schools/${school.id}`);
      setSchools((prev) => prev.filter((s) => s.id !== school.id));
      setTotal((prev) => prev - 1);
      success(`Escuela "${school.name}" eliminada`);
    } catch (err: any) {
      showError(err.response?.data?.message || "Error al eliminar la escuela");
    } finally {
      setDeleteTarget(null);
    }
  }

  function handleSchoolSubmit(data: { name: string; code: string; address?: string; phone?: string; email?: string }) {
    if (editTarget) {
      api
        .patch(`/schools/${editTarget.id}`, data)
        .then(() => {
          success(`Escuela "${data.name}" actualizada`);
          setPage(1);
          setEditTarget(null);
        })
        .catch((err: any) => showError(err.response?.data?.message || "Error al actualizar"));
    } else {
      api
        .post("/schools", data)
        .then(() => {
          success(`Escuela "${data.name}" creada`);
          setPage(1);
          setCreateModalOpen(false);
        })
        .catch((err: any) => showError(err.response?.data?.message || "Error al crear"));
    }
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Escuelas"
        subtitle={`Gestión de escuelas - ${total} registradas`}
        searchPlaceholder="Buscar escuela... (/)"
        searchValue={search}
        onSearchChange={setSearch}
        primaryAction={{ label: "Nueva escuela", icon: "add", onClick: () => setCreateModalOpen(true) }}
      />

      {error && <p className="text-sm text-danger-600">{error}</p>}

      <CreateSchoolModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleSchoolSubmit}
      />

      <EditSchoolModal
        school={editTarget}
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={handleSchoolSubmit}
      />

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 text-xs font-semibold text-neutral-400 uppercase">
              <th className="px-3 py-2 text-left">Escuela</th>
              <th className="px-3 py-2 text-left">Código</th>
              <th className="px-3 py-2 text-left">Dirección</th>
              <th className="px-3 py-2 text-center">Estado</th>
              <th className="px-3 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {schools.map((s) => (
              <tr key={s.id} className="hover:bg-neutral-50">
                <td className="px-3 py-3">
                  <div className="font-medium text-neutral-900">{s.name}</div>
                </td>
                <td className="px-3 py-3">
                  <span className="font-mono text-xs text-neutral-500">{s.code}</span>
                </td>
                <td className="px-3 py-3 text-neutral-500 text-sm">{s.address || "—"}</td>
                <td className="px-3 py-3 text-center">
                  <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${
                    s.active ? "bg-success-100 text-success-700" : "bg-neutral-100 text-neutral-500"
                  }`}>
                    {s.active ? "ACTIVA" : "INACTIVA"}
                  </span>
                </td>
                <td className="px-3 py-3 text-center">
                  <button
                    onClick={() => setEditTarget(s)}
                    className="text-neutral-400 hover:text-primary-600 p-1 rounded-lg hover:bg-primary-50"
                    aria-label={`Editar ${s.name}`}
                    title="Editar"
                  >
                    <span className="material-icons text-sm">edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(s)}
                    className="ml-1 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 p-1 rounded-lg"
                    aria-label={`Eliminar ${s.name}`}
                    title="Eliminar"
                  >
                    <span className="material-icons text-sm">delete</span>
                  </button>
                </td>
              </tr>
            ))}
            {schools.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-neutral-400 text-sm">
                  No se encontraron escuelas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-neutral-600">
        <div className="flex items-center gap-2">
          <span>Mostrando {from}-{to} de {total}</span>
          <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="border border-neutral-300 rounded px-1.5 py-0.5 text-sm">
            {[10, 20, 50].map((n) => <option key={n} value={n}>{n} por página</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1 || loading}
            className="px-2.5 py-1 rounded border border-neutral-300 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-icons text-sm">chevron_left</span>
          </button>
          {Array.from({ length: totalPages }).map((_, i) => {
            const n = i + 1;
            if (totalPages > 7 && n < page - 2) return n === 1 ? <PageBtn key={n} n={n} current={page} onClick={() => setPage(n)} /> : null;
            if (totalPages > 7 && n > page + 2) return n === totalPages ? <PageBtn key={n} n={n} current={page} onClick={() => setPage(n)} /> : null;
            if (totalPages > 7 && n === page - 2) return <span key="start-ellipsis" className="px-1">…</span>;
            if (totalPages > 7 && n === page + 2 && n !== totalPages) return <span key="end-ellipsis" className="px-1">…</span>;
            return <PageBtn key={n} n={n} current={page} onClick={() => setPage(n)} />;
          })}
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || loading}
            className="px-2.5 py-1 rounded border border-neutral-300 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-icons text-sm">chevron_right</span>
          </button>
        </div>
      </div>

      {deleteTarget && (
        <Modal title="Confirmar eliminación" onClose={() => setDeleteTarget(null)}>
          <div className="space-y-4">
            <p className="text-sm text-neutral-600">
              ¿Estás seguro de eliminar la escuela <span className="font-semibold">"{deleteTarget.name}"</span>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50">
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="flex-1 py-2.5 rounded-lg bg-danger-600 text-white font-medium hover:bg-danger-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function PageBtn({ n, current, onClick }: { n: number; current: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${
        n === current ? "bg-primary-600 text-white border-primary-600" : "border-neutral-300 text-neutral-600 hover:bg-neutral-100"
      }`}
    >
      {n}
    </button>
  );
}

function CreateSchoolModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: (data: any) => void }) {
  const [form, setForm] = useState({ name: "", code: "", address: "", phone: "", email: "" });
  const { success, error: showError } = useToast();
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field: string, value: string) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await api.post("/schools", form);
      success(`Escuela "${form.name}" creada correctamente`);
      onSuccess(form);
      onClose();
    } catch (err: any) {
      showError(err.response?.data?.message || "Error al crear la escuela");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Crear escuela" isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">Nombre <span className="text-danger-500">*</span></label>
          <input
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            maxLength={100}
            placeholder="Ej: Escuela Primaria N° 1"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">Código <span className="text-danger-500">*</span></label>
          <input
            value={form.code}
            onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
            maxLength={20}
            placeholder="Ej: EP1"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">Dirección</label>
          <input
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
            maxLength={200}
            placeholder="Ej: Av. Siempre Viva 123"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-1">Teléfono</label>
            <input
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              maxLength={30}
              placeholder="Ej: 11 1234-5678"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-1">Email</label>
            <input
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              maxLength={150}
              placeholder="ejemplo@escuela.edu"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-200">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full py-3.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 ${
              submitting ? "opacity-80 cursor-not-allowed" : ""
            }`}
          >
            {submitting ? "Guardando..." : "Crear escuela"}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M19 13l3-3m0 0l-3-3m3 3H3" />
            </svg>
          </button>
        </div>
      </div>
    </Modal>
  );
}

function EditSchoolModal({ school, isOpen, onClose, onSuccess }: { school: School | null; isOpen: boolean; onClose: () => void; onSuccess: (data: any) => void }) {
  const [form, setForm] = useState({ name: "", code: "", address: "", phone: "", email: "" });
  const { success, error: showError } = useToast();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (school) {
      setForm({
        name: school.name,
        code: school.code,
        address: school.address || "",
        phone: school.phone || "",
        email: school.email || "",
      });
    }
  }, [school]);

  function handleChange(field: string, value: string) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit() {
    if (!school) return;
    setSubmitting(true);
    try {
      await api.patch(`/schools/${school.id}`, form);
      success(`Escuela "${form.name}" actualizada correctamente`);
      onSuccess(form);
      onClose();
    } catch (err: any) {
      showError(err.response?.data?.message || "Error al actualizar la escuela");
    } finally {
      setSubmitting(false);
    }
  }

  if (!school) return null;

  return (
    <Modal title="Editar escuela" isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">Nombre <span className="text-danger-500">*</span></label>
          <input
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            maxLength={100}
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">Código <span className="text-danger-500">*</span></label>
          <input
            value={form.code}
            onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
            maxLength={20}
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">Dirección</label>
          <input
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
            maxLength={200}
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-1">Teléfono</label>
            <input
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              maxLength={30}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-1">Email</label>
            <input
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              maxLength={150}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-200">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full py-3.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 ${
              submitting ? "opacity-80 cursor-not-allowed" : ""
            }`}
          >
            {submitting ? "Guardando..." : "Actualizar escuela"}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M19 13l3-3m0 0l-3-3m3 3H3" />
            </svg>
          </button>
        </div>
      </div>
    </Modal>
  );
}