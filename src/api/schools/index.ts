import api from "../client";
import type { School, SchoolListResponse, CreateSchoolPayload, UpdateSchoolPayload } from "./types";

export interface ListSchoolsParams {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function listSchools(params?: ListSchoolsParams): Promise<SchoolListResponse> {
  const { data } = await api.get("/schools", { params });
  return data;
}

export async function getSchool(id: string): Promise<School> {
  const { data } = await api.get(`/schools/${id}`);
  return data;
}

export async function createSchool(payload: CreateSchoolPayload): Promise<School> {
  const { data } = await api.post("/schools", payload);
  return data;
}

export async function updateSchool(id: string, payload: UpdateSchoolPayload): Promise<School> {
  const { data } = await api.patch(`/schools/${id}`, payload);
  return data;
}

export async function deleteSchool(id: string): Promise<void> {
  await api.delete(`/schools/${id}`);
}

export type * from "./types";
