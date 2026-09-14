export interface Product {
  id: string;
  name: string;
  description?: string;
  type: "product" | "service";
  price: number;
  cost?: number;
  stock: number;
  minStock?: number;
  unit?: "unit" | "sheet" | "binding";
  code?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
  type?: "product" | "service";
  lowStock?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
