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
  type: "sale" | "return" | "credit_note";
  source?: "pos" | "bot";
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
  originalSale?: { id: string; number: number } | null;
};

export interface SaleListResult {
  items: SaleRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
