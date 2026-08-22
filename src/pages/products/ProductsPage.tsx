import { useEffect, useState, useCallback } from "react";
import api from "../../api/client";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import CreateProductModal from "../../components/CreateProductModal";
import { money } from "../../lib/format";
import { unitMarginPercent, formatPercent } from "../../lib/profit";
import type { Product, ProductListResponse } from "../../api/types";

type TypeFilter = "all" | "product" | "service";
type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "stock-asc" | "stock-desc";

const SORT_MAP: Record<SortOption, { sortBy: string; sortOrder: "asc" | "desc" }> = {
  "name-asc": { sortBy: "name", sortOrder: "asc" },
  "name-desc": { sortBy: "name", sortOrder: "desc" },
  "price-asc": { sortBy: "price", sortOrder: "asc" },
  "price-desc": { sortBy: "price", sortOrder: "desc" },
  "stock-asc": { sortBy: "stock", sortOrder: "asc" },
  "stock-desc": { sortBy: "stock", sortOrder: "desc" },
};

const SORT_LABELS: Record<SortOption, string> = {
  "name-asc": "Nombre A-Z",
  "name-desc": "Nombre Z-A",
  "price-asc": "Precio (menor)",
  "price-desc": "Precio (mayor)",
  "stock-asc": "Stock (menor)",
  "stock-desc": "Stock (mayor)",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [productCount, setProductCount] = useState(0);
  const [serviceCount, setServiceCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>("name-asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch summary counts - reusable function
  const fetchSummaryCounts = useCallback(async () => {
    try {
      const [productsRes, servicesRes, lowStockRes] = await Promise.all([
        api.get("/products", { params: { active: true, type: "product", limit: 1 } }),
        api.get("/products", { params: { active: true, type: "service", limit: 1 } }),
        api.get("/products", { params: { active: true, lowStock: true, limit: 1 } }),
      ]);
      setProductCount(productsRes.data.total);
      setServiceCount(servicesRes.data.total);
      setLowStockCount(lowStockRes.data.total);
    } catch {
      setProductCount(0);
      setServiceCount(0);
      setLowStockCount(0);
    }
  }, []);

  // Fetch summary counts on mount and when refreshTrigger changes
  useEffect(() => {
    fetchSummaryCounts();
  }, [fetchSummaryCounts, refreshTrigger]);

  // Fetch products list
  useEffect(() => {
    const params: Record<string, unknown> = {
      active: true,
      page,
      limit,
      ...SORT_MAP[sort],
    };
    if (search.trim()) params.search = search.trim();
    if (typeFilter !== "all") params.type = typeFilter;
    if (lowStockOnly) params.lowStock = true;

    let cancelled = false;
    const timer = setTimeout(() => {
      setLoading(true);
      api
        .get("/products", { params })
        .then((r: { data: ProductListResponse }) => {
          if (!cancelled) {
            setProducts(r.data.items);
            setTotal(r.data.total);
            setTotalPages(r.data.totalPages);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err.response?.data?.message || "Error cargando productos");
            setLoading(false);
          }
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [page, limit, search, typeFilter, lowStockOnly, sort]);

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === products.length) setSelected(new Set());
    else setSelected(new Set(products.map((p) => p.id)));
  }

  async function handleDelete(product: Product) {
    try {
      await api.delete(`/products/${product.id}`);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      setTotal((prev) => prev - 1);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
      setRefreshTrigger((t) => t + 1); // Refresh summary counts
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al eliminar el producto");
    } finally {
      setDeleteTarget(null);
    }
  }

  function stockLabel(p: Product) {
    if (p.type === "service") return { text: "∞ Ilimitado", cls: "text-success-600" };
    if (p.stock === 0) return { text: "Sin stock", cls: "text-danger-600" };
    if (p.stock <= (p.minStock ?? 10)) return { text: `${p.stock} en stock`, cls: "text-warning-600" };
    return { text: `${p.stock} en stock`, cls: "text-neutral-600" };
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Productos"
        subtitle={`Gestión de productos y servicios - ${productCount + serviceCount} activos`}
        searchPlaceholder="Buscar... (/)"
        searchValue={search}
        onSearchChange={setSearch}
        primaryAction={{ label: "Nuevo producto", icon: "add", onClick: () => setCreateModalOpen(true) }}
      />

      {error && <p className="text-sm text-danger-600">{error}</p>}

      <CreateProductModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setPage(1);
          setRefreshTrigger((t) => t + 1); // Refresh summary counts
          setCreateModalOpen(false);
        }}
      />

      <Modal
        title="Editar producto"
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        size="md"
      >
        {editTarget && (
          <CreateProductModal
            isOpen={true}
            onClose={() => setEditTarget(null)}
            onSuccess={() => {
              setPage(1);
              setRefreshTrigger((t) => t + 1); // Refresh summary counts
              setEditTarget(null);
            }}
            initialData={editTarget}
          />
        )}
      </Modal>

      <div className="grid grid-cols-3 gap-4">
        <SummaryCard icon="inventory_2" iconColor="bg-primary-100 text-primary-700" title="PRODUCTOS" value={productCount} />
        <SummaryCard icon="block" iconColor="bg-danger-100 text-danger-700" title="SERVICIOS" value={serviceCount} />
        <SummaryCard icon="warning" iconColor="bg-danger-100 text-danger-700" title="STOCK BAJO" value={lowStockCount} />
      </div>

      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
          {(["all", "product", "service"] as TypeFilter[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                typeFilter === t ? "bg-white shadow border border-neutral-200 text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {t === "all" ? "Todos" : t === "product" ? "Productos" : "Servicios"}
            </button>
          ))}
        </div>

        <select
          value={lowStockOnly ? "true" : "false"}
          onChange={(e) => { setLowStockOnly(e.target.value === "true"); setPage(1); }}
          className="px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-sm text-neutral-700 focus:border-primary-500 focus:outline-none"
        >
          <option value="false">Estado de Stock</option>
          <option value="true">Solo stock bajo</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-sm text-neutral-700 focus:border-primary-500 focus:outline-none"
        >
          {Object.entries(SORT_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>

        <button
          onClick={() => { setSearch(""); setLowStockOnly(false); setTypeFilter("all"); setSort("name-asc"); setPage(1); }}
          className="ml-auto text-xs text-neutral-500 hover:text-neutral-700"
        >
          Limpiar filtros
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 text-xs font-semibold text-neutral-400 uppercase">
              <th className="px-3 py-2 text-left w-8">
                <input type="checkbox" checked={products.length > 0 && selected.size === products.length} onChange={toggleAll} />
              </th>
              <th className="px-3 py-2 text-left">Producto</th>
              <th className="px-3 py-2 text-left">Tipo</th>
              <th className="px-3 py-2 text-right">Precio</th>
              <th className="px-3 py-2 text-right">Costo</th>
              <th className="px-3 py-2 text-right">Margen</th>
              <th className="px-3 py-2 text-right">Stock</th>
              <th className="px-3 py-2 center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {products.map((p) => {
              const s = stockLabel(p);
              return (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="px-3 py-3">
                    <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} />
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-medium text-neutral-900">{p.name}</div>
                    {p.code && <span className="text-xs text-neutral-400">({p.code})</span>}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${
                      p.type === "service" ? "bg-danger-100 text-danger-700" : "bg-primary-100 text-primary-700"
                    }`}>
                      {p.type === "service" ? "SERVICIO" : "PRODUCTO"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">{money(p.price)}</td>
                  <td className="px-3 py-3 text-right">{p.cost ? money(p.cost) : "—"}</td>
                  <td className="px-3 py-3 text-right">
                    {p.cost !== undefined && p.cost > 0 ? (
                      <span className="text-sm text-neutral-600">
                        {formatPercent(unitMarginPercent(p.price, p.cost))}
                      </span>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right font-medium">{s.text}</td>
                  <td className="px-3 py-3 text-center">
                    <button
                      onClick={() => setEditTarget(p)}
                      className="ml-1 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 p-1 rounded-lg"
                      aria-label={`Editar ${p.name}`}
                    >
                      <span className="material-icons text-sm">edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="ml-1 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 p-1 rounded-lg"
                      aria-label={`Eliminar ${p.name}`}
                    >
                      <span className="material-icons text-sm">delete</span>
                    </button>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && !loading && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-neutral-400 text-sm">
                  No se encontraron productos
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
            {[8, 16, 32].map((n) => <option key={n} value={n}>{n} por página</option>)}
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
              ¿Estás seguro de eliminar el producto <span className="font-semibold">"{deleteTarget.name}"</span>?
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

function SummaryCard({ icon, iconColor, title, value }: {
  icon: string; iconColor: string; title: string; value: number;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center gap-4">
      <span className={`material-icons text-2xl ${iconColor} rounded-lg p-1.5`}>{icon}</span>
      <div>
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-neutral-900">{value}</p>
      </div>
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