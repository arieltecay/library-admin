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

export interface CreditMovementItem {
  id: string;
  type: "debt" | "payment";
  amount: number;
  balanceAfter: number;
  method?: "cash" | "transfer" | "credit";
  note?: string;
  createdAt: string;
  sale?: {
    id: string;
    number: number;
    items: Array<{
      name: string;
      type: "product" | "service";
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }>;
    total: number;
    createdAt: string;
  } | null;
}

export interface ClientCreditResult {
  client: {
    id: string;
    fullName: string;
    dni?: string;
    balance: number;
  };
  movements: CreditMovementItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
