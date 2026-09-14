import type { CreatePosPayload, Pos, PosListResponse, UpdatePosPayload } from "./types";
import api from '../client';

export const posService = {
  list: () =>
    api.get<PosListResponse>('/pos').then((res) => res.data),

  create: (data: CreatePosPayload) =>
    api.post<{ pos: Pos }>('/pos', data).then((res) => res.data),

  update: (id: string, data: UpdatePosPayload) =>
    api.put<{ pos: Pos }>(`/pos/${id}`, data).then((res) => res.data),

  delete: (id: string) =>
    api.delete<{ deleted: boolean }>(`/pos/${id}`).then((res) => res.data),
};
export type * from "./types";
