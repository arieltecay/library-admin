export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  active: boolean;
  school?: { id: string; name: string; code: string };
  createdAt: string;
}

export interface AdminListResponse {
  items: Admin[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateAdminPayload {
  name: string;
  email: string;
  password: string;
  pin: string;
  schoolName: string;
  schoolCode: string;
}

export interface UpdateAdminPayload {
  name?: string;
  email?: string;
  password?: string;
  pin?: string;
  active?: boolean;
}
