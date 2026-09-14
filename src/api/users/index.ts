import api from "../client";
import type { CreateUserPayload, ListUsersParams, UpdateUserPayload, UserItem, UserListResult, UsersSummary } from "./types";

export async function listUsers(params?: ListUsersParams): Promise<UserListResult> {
  const { data } = await api.get("/users", { params });
  return data;
}

export async function getUsersSummary(): Promise<UsersSummary> {
  const { data } = await api.get("/users/summary");
  return data;
}

export async function createUser(payload: CreateUserPayload): Promise<{ user: UserItem }> {
  const { data } = await api.post("/users", payload);
  return data;
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<{ user: UserItem }> {
  const { data } = await api.put(`/users/${id}`, payload);
  return data;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}

export type * from "./types";
