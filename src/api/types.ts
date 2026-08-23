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

export interface Client {
  id: string;
  fullName: string;
  phone?: string;
  dni: string;
  isDefault: boolean;
  balance: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientListResponse {
  items: Client[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "seller";
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserListResponse {
  items: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TodayKPIs {
  totalSales: number;
  totalAmount: number;
  cashAmount: number;
  transferAmount: number;
  creditAmount: number;
  returnsCount: number;
  returnsAmount: number;
  avgTicket: number;
  productsSold: number;
  yesterdayAmount: number;
  yesterdayReturns: number;
  yesterdayCount: number;
}

export interface SalesChartData {
  labels: string[];
  datasets: { cash: number[]; transfer: number[]; credit: number[]; total: number[] };
}

export interface TopProduct {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface CashShiftSummary {
  id: string;
  seller: string;
  openedAt: string;
  closedAt?: string;
  openingAmount: number;
  expectedAmount: number;
  closingAmount?: number;
  difference?: number;
  status: "open" | "closed";
}

export type PaymentMethod = "cash" | "transfer" | "credit";

export interface SaleItemInfo {
  product: string;
  name: string;
  type: "product" | "service";
  quantity: number;
  unitPrice: number;
  unitCost?: number;
  subtotal: number;
}

export interface PopulatedClientInfo {
  id: string;
  fullName: string;
  balance: number;
  dni?: string;
}

export interface PopulatedUserInfo {
  id: string;
  name: string;
  role: string;
}

export type SaleRow = {
  id: string;
  number: number;
  type: "sale" | "return";
  voided: boolean;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  total: number;
  amountReceived: number;
  change: number;
  client?: PopulatedClientInfo | null;
  seller: PopulatedUserInfo;
  items: SaleItemInfo[];
  createdAt: string;
  voidReason?: string;
};

export interface SaleListResult {
  items: SaleRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface School {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolListResponse {
  items: School[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
