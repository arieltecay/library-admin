import { useState, useEffect, useCallback } from "react";
import {
  listUsers,
  getUsersSummary,
  createUser,
  updateUser,
  deleteUser,
  type UserItem,
  type UsersSummary,
  type ListUsersParams,
} from "../../api/usersService";
import UserFormModal from "./components/UserFormModal";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-500", "bg-purple-500", "bg-green-500",
    "bg-amber-500", "bg-rose-500", "bg-indigo-500",
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

function formatLastLogin(date?: string): { relative: string; absolute: string } {
  if (!date) return { relative: "Nunca", absolute: "" };
  const d = new Date(date);
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  let relative = "";
  if (mins < 2) relative = "Hace 2 min";
  else if (mins < 60) relative = `Hace ${mins} min`;
  else if (hours < 24) relative = "Hoy";
  else if (days === 1) relative = "Ayer";
  else if (days < 7) relative = `Hace ${days} días`;
  else relative = `Hace ${Math.floor(days / 7)} semanas`;

  const absolute = d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }) +
    " " + d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

  return { relative, absolute };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: "admin" | "seller" }) {
  return role === "admin" ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide">
      <span className="material-icons text-xs">admin_panel_settings</span> Admin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wide">
      <span className="material-icons text-xs">store</span> Vendedor
    </span>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${active ? "text-green-600" : "text-red-500"}`}>
      <span className={`w-2 h-2 rounded-full ${active ? "bg-green-500" : "bg-red-400"}`} />
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

function KPICard({ label, value, sub, icon, iconBg }: {
  label: string; value: string | number; sub?: string; icon: string; iconBg: string;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm text-neutral-500">{label}</p>
        <p className="text-2xl font-bold text-neutral-900 mt-0.5">{value}</p>
        {sub && <p className={`text-xs mt-1 ${sub.includes("POS") ? "text-amber-600" : sub.includes("total") ? "text-green-600" : "text-neutral-500"}`}>{sub}</p>}
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
        <span className="material-icons text-white text-xl">{icon}</span>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

type TabFilter = "all" | "active" | "inactive";

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [summary, setSummary] = useState<UsersSummary | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [params, setParams] = useState<ListUsersParams>({ sortBy: "name", sortOrder: "asc", limit: 20 });
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchValue, setSearchValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserItem | null>(null);

  const fetchAll = useCallback(async () => {
    setLoadingUsers(true);
    setLoadingSummary(true);
    const queryParams: ListUsersParams = { ...params };
    if (activeTab === "active") queryParams.active = true;
    if (activeTab === "inactive") queryParams.active = false;

    try {
      const [usersRes, summaryRes] = await Promise.all([
        listUsers(queryParams),
        getUsersSummary(),
      ]);
      setUsers(usersRes.items || []);
      setSummary(summaryRes);
    } catch (e) {
      console.error("Error cargando usuarios", e);
    } finally {
      setLoadingUsers(false);
      setLoadingSummary(false);
    }
  }, [params, activeTab]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSave = async (payload: any) => {
    if (editUser) {
      await updateUser(editUser.id, payload);
    } else {
      await createUser(payload);
    }
    fetchAll();
  };

  const handleDelete = async (user: UserItem) => {
    if (!confirm(`¿Suspender a ${user.name}? El usuario no podrá acceder al sistema.`)) return;
    await deleteUser(user.id);
    fetchAll();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds(prev => prev.size === users.length ? new Set() : new Set(users.map(u => u.id)));
  };

  const tabs: { id: TabFilter; label: string }[] = [
    { id: "all", label: "Todos" },
    { id: "active", label: "Activos" },
    { id: "inactive", label: "Inactivos" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Usuarios</h1>
          <p className="text-sm text-neutral-500 mt-1">Administrá los accesos al sistema y roles</p>
        </div>
        <button
          onClick={() => { setEditUser(null); setIsModalOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <span className="material-icons text-base">person_add</span>
          Nuevo usuario
        </button>
      </div>

      {/* KPIs */}
      {loadingSummary ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-neutral-200 rounded-xl p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : summary && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard label="Total usuarios" value={summary.total} sub={`${summary.active} activos`} icon="group" iconBg="bg-blue-500" />
          <KPICard label="Administradores" value={summary.admins} sub="acceso total" icon="admin_panel_settings" iconBg="bg-green-500" />
          <KPICard label="Vendedores" value={summary.sellers} sub="acceso POS" icon="point_of_sale" iconBg="bg-amber-500" />
          <KPICard label="Inactivos" value={summary.inactive} sub="suspendidos" icon="block" iconBg="bg-neutral-400" />
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        {/* Barra de filtros */}
        <div className="px-5 py-4 border-b border-neutral-100 flex flex-wrap items-center gap-3">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons text-neutral-400 text-base">search</span>
            <input
              type="text"
              value={searchValue}
              placeholder="Buscar..."
              className="w-full pl-9 pr-8 py-2 border border-neutral-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              onChange={e => {
                setSearchValue(e.target.value);
                setParams(p => ({ ...p, search: e.target.value || undefined }));
              }}
            />
            {searchValue && (
              <button onClick={() => { setSearchValue(""); setParams(p => ({ ...p, search: undefined })); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                <span className="material-icons text-base">close</span>
              </button>
            )}
          </div>

          {/* Rol filter */}
          <select
            className="px-3 py-2 text-sm border border-neutral-300 rounded-lg outline-none bg-white text-neutral-700"
            onChange={e => setParams(p => ({ ...p, role: (e.target.value as any) || undefined }))}
          >
            <option value="">Todos los roles</option>
            <option value="admin">Admin</option>
            <option value="seller">Vendedor</option>
          </select>

          {/* Tabs Todos / Activos / Inactivos */}
          <div className="flex items-center bg-neutral-100 rounded-lg p-1 gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  activeTab === tab.id ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            className="ml-auto px-3 py-2 text-sm border border-neutral-300 rounded-lg outline-none bg-white text-neutral-700"
            onChange={e => setParams(p => ({ ...p, sortBy: e.target.value }))}
          >
            <option value="name">Ordenar: nombre</option>
            <option value="createdAt">Ordenar: fecha alta</option>
            <option value="lastLoginAt">Ordenar: último acceso</option>
          </select>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-5 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={users.length > 0 && selectedIds.size === users.length}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded accent-blue-600"
                  />
                </th>
                {["Usuario", "Rol", "Estado", "Últ. Acceso", "Ventas", ""].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loadingUsers ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-neutral-100 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center text-neutral-400">No hay usuarios para mostrar</td>
                </tr>
              ) : (
                users.map(user => {
                  const isSelected = selectedIds.has(user.id);
                  const { relative, absolute } = formatLastLogin(user.lastLoginAt);
                  return (
                    <tr
                      key={user.id}
                      className={`transition-colors ${isSelected ? "bg-blue-50" : "hover:bg-neutral-50/60"}`}
                    >
                      {/* Checkbox */}
                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(user.id)}
                          className="w-4 h-4 rounded accent-blue-600"
                        />
                      </td>

                      {/* Usuario */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${getAvatarColor(user.name)}`}>
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-900">{user.name}</p>
                            <p className="text-xs text-neutral-500">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Rol */}
                      <td className="px-5 py-4"><RoleBadge role={user.role} /></td>

                      {/* Estado */}
                      <td className="px-5 py-4"><StatusDot active={user.active} /></td>

                      {/* Último acceso */}
                      <td className="px-5 py-4">
                        <p className="text-neutral-700 font-medium">{relative}</p>
                        {absolute && <p className="text-xs text-neutral-400 mt-0.5">{absolute}</p>}
                      </td>

                      {/* Ventas */}
                      <td className="px-5 py-4">
                        {user.salesCount != null && user.salesCount > 0 ? (
                          <span className="text-neutral-700 font-medium">{user.salesCount} <span className="text-xs text-neutral-400 font-normal">ventas</span></span>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditUser(user); setIsModalOpen(true); }}
                            className="p-1.5 text-neutral-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Editar"
                          >
                            <span className="material-icons text-base">edit</span>
                          </button>
                          {user.active && (
                            <button
                              onClick={() => handleDelete(user)}
                              className="p-1.5 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                              title="Suspender"
                            >
                              <span className="material-icons text-base">block</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer paginación */}
        {!loadingUsers && users.length > 0 && (
          <div className="px-6 py-3 border-t border-neutral-100 flex items-center justify-between">
            <p className="text-xs text-neutral-500">
              Mostrando <span className="font-semibold">1-{users.length}</span> de <span className="font-semibold">{summary?.total ?? users.length}</span> usuarios
            </p>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 text-neutral-400 hover:bg-neutral-50 disabled:opacity-40" disabled>
                <span className="material-icons text-base">chevron_left</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-600 text-white text-sm font-semibold">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 text-neutral-400 hover:bg-neutral-50 disabled:opacity-40" disabled>
                <span className="material-icons text-base">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        editUser={editUser}
        onClose={() => { setIsModalOpen(false); setEditUser(null); }}
        onSave={handleSave}
      />
    </div>
  );
}
