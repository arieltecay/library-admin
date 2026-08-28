import api from "./client";

export interface DashboardOverview {
  range: { from: string; to: string; days: number };
  sales: { count: number; total: number; cash: number; transfer: number; credit: number; avgTicket: number; productsSold: number };
  returns: { count: number; amount: number };
  profitability: { revenue: number; cogs: number; grossProfit: number; grossMarginPercent: number | null };
  series: { labels: string[]; total: number[] };
  topProducts: { productId: string; name: string; quantity: number; revenue: number }[];
  lowStock: { id: string; name: string; stock: number; minStock?: number }[];
  credit: { totalOutstanding: number; clientsWithDebt: number };
}

export interface GetOverviewParams { from?: string; to?: string }

export async function getOverview(params: GetOverviewParams = {}): Promise<DashboardOverview> {
  const { data } = await api.get("/dashboard/overview", { params });
  return data;
}