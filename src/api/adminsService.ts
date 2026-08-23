import apiClient from './client';

// Tipos locales — NO importar desde la API
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

export const adminsService = {
  list: (params?: { search?: string; active?: boolean; page?: number; limit?: number }) =>
    apiClient.get<AdminListResponse>('/admins', { params }).then((res) => res.data),

  create: (data: CreateAdminPayload) =>
    apiClient.post<{ user: Admin }>('/admins', data).then((res) => res.data),

  update: (id: string, data: UpdateAdminPayload) =>
    apiClient.put<{ user: Admin }>(`/admins/${id}`, data).then((res) => res.data),

  delete: (id: string) =>
    apiClient.delete<{ deleted: boolean }>(`/admins/${id}`).then((res) => res.data),
};