import type { CashMovementCategory } from "../cashMovements/types";

export interface CashShiftItem {
  id: string;
  shiftNumber: number;
  sellerName: string;
  status: "open" | "closed";
  openedAt: string;
  closedAt?: string;
  openingAmount: number;
  expectedAmount?: number;
  closingAmount?: number;
  difference?: number;
  note?: string;
}

export interface CashShiftDetail {
  shift: {
    id: string;
    shiftNumber: number;
    sellerName: string;
    status: "open" | "closed";
    openedAt: string;
    closedAt?: string;
    openingAmount: number;
    closingAmount?: number;
    expectedAmount?: number;
    difference?: number;
    note?: string;
  };
  sales: {
    cashTotal: number;
    transferTotal: number;
    creditTotal: number;
    salesCount: number;
    returnsTotal: number;
    returnsCashTotal: number;
    returnsTransferTotal: number;
    returnsCreditTotal: number;
  };
  movements: {
    items: Array<{
      id: string;
      type: "in" | "out";
      category: CashMovementCategory;
      amount: number;
      description: string;
      createdAt: string;
    }>;
    aggregated: {
      cashInTotal: number;
      cashOutTotal: number;
      netMovements: number;
      movementsCount: number;
      byCategory: Record<CashMovementCategory, { in: number; out: number; count: number }>;
    };
  };
  aggregated?: {
    expectedCash?: number;
    [key: string]: unknown;
  };
}

export interface CashShiftListResult {
  items: CashShiftItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DailySummary {
  date: string;
  totalOpening: number;
  inheritedOpening: number;
  cashSales: number;
  transferSales: number;
  returns: number;
  creditPayments: number;
  cashInTotal: number;
  cashOutTotal: number;
  netMovements: number;
  totalExpected: number;
  finalCount: number;
  salesInOpenShifts: number;
  difference: number;
  shiftsWithDifference: number;
  totalShifts: number;
  pendingShifts: Array<{ sellerName: string; id: string }>;
}

export interface ListCashShiftsParams {
  page?: number;
  limit?: number;
  sellerId?: string;
  status?: "open" | "closed";
  hasDifference?: boolean;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CloseCashShiftPayload {
  closingAmount: number;
  note?: string;
}
