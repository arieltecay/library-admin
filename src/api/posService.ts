import apiClient from './client';

export interface Pos {
  id: string;
  name: string;
  code: string;
  school: string;
  active: boolean;
  createdAt: string;
}

export interface PosListResponse {
  items: Pos[];
  total: number;
}

export interface CreatePosPayload {
  name: string;
  code: string;
}

export interface UpdatePosPayload {
  name?: string;
  active?: boolean;
}

export const posService = {
  list: () =>
    apiClient.get<PosListResponse>('/pos').then((res) => res.data),

  create: (data: CreatePosPayload) =>
    apiClient.post<{ pos: Pos }>('/pos', data).then((res) => res.data),

  update: (id: string, data: UpdatePosPayload) =>
    apiClient.put<{ pos: Pos }>(`/pos/${id}`, data).then((res) => res.data),

  delete: (id: string) =>
    apiClient.delete<{ deleted: boolean }>(`/pos/${id}`).then((res) => res.data),
};