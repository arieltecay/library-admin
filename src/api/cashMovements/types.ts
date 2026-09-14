export type CashMovementType = 'in' | 'out';

export type CashMovementCategory =
  | 'lunch'
  | 'supplies'
  | 'personal_withdrawal'
  | 'change'
  | 'expense'
  | 'other';

export interface CashMovementItem {
  id: string;
  cashShiftId: string;
  shiftNumber: number;
  sellerName: string;
  type: CashMovementType;
  category: CashMovementCategory;
  amount: number;
  description: string;
  createdAt: string;
}

export interface CashMovementListResult {
  items: CashMovementItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CashMovementAggregated {
  cashInTotal: number;
  cashOutTotal: number;
  netMovements: number;
  movementsCount: number;
  byCategory: Record<CashMovementCategory, { in: number; out: number; count: number }>;
}

export interface ListCashMovementsParams {
  page?: number;
  limit?: number;
  sellerId?: string;
  cashShiftId?: string;
  type?: CashMovementType;
  category?: CashMovementCategory;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
