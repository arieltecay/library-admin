export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "admin" | "seller";
  active: boolean;
  lastLoginAt?: string;
  salesCount?: number;
  createdAt: string;
}

export interface UserListResult {
  items: UserItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UsersSummary {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  sellers: number;
}

export interface ListUsersParams {
  search?: string;
  role?: "admin" | "seller";
  active?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  pin: string;
  role: "admin" | "seller";
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  pin?: string;
  role?: "admin" | "seller";
  active?: boolean;
}
