import api from "./client";
import type { SaleListResult, SaleRow } from "./types";

export interface ListSalesParams {
  page?: number;
  limit?: number;
  search?: string;
  sellerId?: string;
  paymentMethod?: "cash" | "transfer" | "credit";
  type?: "sale" | "return" | "credit_note";
  voided?: boolean;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SalesSummary {
  salesToday: number;
  salesGrowth: number;
  totalRevenue: number;
  returnsCount: number;
  returnsAmount: number;
  averageTicket: number;
}

export async function listSales(params: ListSalesParams): Promise<SaleListResult> {
  const { data } = await api.get("/sales", { params });
  return data;
}

export async function getSale(id: string): Promise<SaleRow> {
  const { data } = await api.get(`/sales/${id}`);
  return data;
}

export async function voidSale(id: string, reason: string): Promise<SaleRow> {
  const { data } = await api.post(`/sales/${id}/void`, { reason });
  return data;
}

export async function getSalesSummary(): Promise<SalesSummary> {
  const { data } = await api.get("/sales/summary");
  return data;
}

export async function creditNoteSale(id: string, reason?: string): Promise<SaleRow> {
  const { data } = await api.post(`/sales/${id}/credit-note`, { reason });
  return data;
}
