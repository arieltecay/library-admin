import api from "./client";

export interface CreditsSummary {
  totalOutstanding: number;
  clientsWithDebt: number;
  totalCreditsThisMonth: number;
  totalPaymentsThisMonth: number;
  overdueCount: number;
  overdueAmount: number;
}

export interface DebtorItem {
  client: {
    id: string;
    fullName: string;
    dni: string;
    balance: number;
  };
  balance: number;
  lastPaymentAt?: string;
  lastCreditAt?: string;
}

export interface CreditsListResult {
  items: DebtorItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: {
    totalOutstanding: number;
    overdueCount: number;
    overdueAmount: number;
  };
}

export interface RecentMovement {
  id: string;
  client: { id: string; fullName: string; balance: number };
  type: "debt" | "payment";
  amount: number;
  balanceAfter: number;
  method?: "cash" | "transfer";
  note?: string;
  createdAt: string;
}

export interface SettleDebtPayload {
  amount: number;
  method: "cash" | "transfer";
  note?: string;
}

export interface SettleDebtResponse {
  creditMovement: {
    id: string;
    client: string;
    amount: number;
    balanceAfter: number;
    method: "cash" | "transfer";
    note?: string;
    createdAt: string;
  };
  client: {
    id: string;
    fullName: string;
    balance: number;
  };
  sale?: { id: string };
}

export interface SettleDebtApiResponse {
  message: string;
  data: SettleDebtResponse;
}

export async function getCreditsSummary(): Promise<CreditsSummary> {
  const { data } = await api.get("/credits/summary");
  return data;
}

export async function listCredits(params?: {
  search?: string;
  overdue?: boolean;
  page?: number;
  limit?: number;
}): Promise<CreditsListResult> {
  const { data } = await api.get("/credits", { params });
  return data;
}

export async function getRecentHistory(limit = 5): Promise<RecentMovement[]> {
  const { data } = await api.get("/credits/history", { params: { limit } });
  return data;
}

export async function settleDebt(
  clientId: string,
  payload: SettleDebtPayload
): Promise<SettleDebtResponse> {
  const { data } = await api.post<SettleDebtApiResponse>(`/credits/client/${clientId}/settle`, payload);
  return data.data;
}
