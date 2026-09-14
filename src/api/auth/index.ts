import api from "../client";
import type { AuthResponse, AuthUser } from "./types";

export async function loginWithEmail(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login-email", { email, password });
  return data;
}

export async function refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
  const { data } = await api.post<{ accessToken: string }>("/auth/refresh", { refreshToken });
  return data;
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>("/auth/me");
  return data;
}

export async function loginWithPin(pin: string, schoolId: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login-pin", { pin, schoolId });
  return data;
}

export type * from "./types";
