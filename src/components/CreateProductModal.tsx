import { useState, useEffect } from "react";
import api from "../api/client";
import { useToast } from "../hooks/useToast";
import Modal from "./Modal";
import { unitGrossProfit, unitMarginPercent, formatPercent } from "../lib/profit";

type ProductType = "product" | "service";

interface CreateProductForm {
  name: string;
  type: ProductType;
  price: number;
  cost?: number;
  stock: number;
  minStock?: number;
}

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    id: string;
    name: string;
    type: ProductType;
    price: number;
    cost?: number;
    stock: number;
    minStock?: number;
  };
}

const EMPTY_FORM: CreateProductForm = {
  name: "",
  type: "product",
  price: 0,
  cost: undefined,
  stock: 0,
  minStock: undefined,
};

export default function CreateProductModal({ isOpen, onClose, onSuccess, initialData }: CreateProductModalProps) {
  const [form, setForm] = useState<CreateProductForm>(EMPTY_FORM);
  const [typeOptions] = useState<{ label: string; value: ProductType }[]>([
    { label: "Producto", value: "product" },
    { label: "Servicio", value: "service" },
  ]);
  const { success, error: showError } = useToast();
  const [submitting, setSubmitting] = useState(false);

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          name: initialData.name,
          type: initialData.type,
          price: initialData.price,
          cost: initialData.cost,
          stock: initialData.stock,
          minStock: initialData.minStock,
        });
      } else {
        setForm(EMPTY_FORM);
      }
    } else {
      setForm(EMPTY_FORM);
    }
  }, [isOpen, initialData]);

  function handleChange(field: keyof CreateProductForm, value: string | number | undefined) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      if (initialData) {
        // Modo: Actualizar producto existente usando PATCH con id
        await api.patch(`/products/${initialData.id}`, form);
      } else {
        await api.post("/products", form);
      }
      success(`Producto "${form.name}" guardado correctamente`);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al guardar el producto";
      showError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={initialData ? "Editar producto" : "Crear producto"} isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">Nombre <span className="text-danger-500">*</span></label>
          <input
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            maxLength={120}
            placeholder="Ej: Cuaderno espiral A4"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">Tipo <span className="text-danger-500">*</span></label>
          <select
            value={form.type}
            onChange={(e) => handleChange("type", e.target.value as ProductType)}
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none"
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">Precio <span className="text-danger-500">*</span></label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => handleChange("price", Number(e.target.value))}
            min={0}
            step="0.01"
            placeholder="0.00"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">Costo de compra</label>
          <input
            type="number"
            value={form.cost ?? ""}
            onChange={(e) => handleChange("cost", e.target.value === "" ? undefined : Number(e.target.value))}
            min={0}
            step="0.01"
            placeholder="0.00"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none"
          />
        </div>

        {form.cost !== undefined && (
          <div className="mt-2">
            <p className="text-sm text-neutral-600">
              Ganancia estimada: <span className="font-semibold">
                {unitGrossProfit(form.price, form.cost ?? 0).toLocaleString("es-AR")}
              </span>
            </p>
            <p className="text-sm text-neutral-600">
              Margen estimado: <span className="font-semibold">
                {formatPercent(unitMarginPercent(form.price, form.cost ?? 0))}
              </span>
            </p>
            {form.price <= form.cost && (
              <p className="text-amber-600 font-medium">El precio no cubre el costo de compra.</p>
            )}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">Stock <span className="text-danger-500">*</span></label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => handleChange("stock", Number(e.target.value))}
            min={0}
            step={1}
            placeholder="0"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">Stock mínimo</label>
          <input
            type="number"
            value={form.minStock ?? ""}
            onChange={(e) => handleChange("minStock", e.target.value === "" ? undefined : Number(e.target.value))}
            min={0}
            step={1}
            placeholder="0"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none"
          />
        </div>

        <div className="pt-4 border-t border-neutral-200">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full py-3.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 ${
              submitting ? "opacity-80 cursor-not-allowed" : ""
            }`}
          >
            {submitting ? "Guardando..." : initialData ? "Actualizar" : "Crear producto"}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M19 13l3-3m0 0l-3-3m3 3H3" />
            </svg>
          </button>
        </div>
      </div>
    </Modal>
  );
}