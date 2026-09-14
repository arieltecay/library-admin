import api from "../client";
import type { Product, ProductListResponse, ListProductsParams } from "./types";

export async function listProducts(params: ListProductsParams): Promise<ProductListResponse> {
  const { data } = await api.get("/products", { params });
  return data;
}

export interface ProductCounts {
  productCount: number;
  serviceCount: number;
  lowStockCount: number;
}

/** Cuenta productos activos, servicios y de stock bajo en paralelo (para las tarjetas de resumen). */
export async function getProductCounts(): Promise<ProductCounts> {
  const [productsRes, servicesRes, lowStockRes] = await Promise.all([
    api.get("/products", { params: { active: true, type: "product", limit: 1 } }),
    api.get("/products", { params: { active: true, type: "service", limit: 1 } }),
    api.get("/products", { params: { active: true, lowStock: true, limit: 1 } }),
  ]);
  return {
    productCount: productsRes.data.total,
    serviceCount: servicesRes.data.total,
    lowStockCount: lowStockRes.data.total,
  };
}

export type ProductFormPayload = Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>;

export async function createProduct(payload: ProductFormPayload): Promise<Product> {
  const { data } = await api.post("/products", payload);
  return data;
}

export async function updateProduct(id: string, payload: ProductFormPayload): Promise<Product> {
  const { data } = await api.patch(`/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

export type * from "./types";
