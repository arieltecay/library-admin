import type { Admin, AdminListResponse, CreateAdminPayload, UpdateAdminPayload } from "./types";
import api from '../client';

// Tipos locales — NO importar desde la API

export const adminsService = {
  list: (params?: { search?: string; active?: boolean; page?: number; limit?: number }) =>
    api.get<AdminListResponse>('/admins', { params }).then((res) => res.data),

  create: (data: CreateAdminPayload) =>
    api.post<{ user: Admin }>('/admins', data).then((res) => res.data),

  update: (id: string, data: UpdateAdminPayload) =>
    api.put<{ user: Admin }>(`/admins/${id}`, data).then((res) => res.data),

  delete: (id: string) =>
    api.delete<{ deleted: boolean }>(`/admins/${id}`).then((res) => res.data),
};
export type * from "./types";
