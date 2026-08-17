import api from "./client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "seller";
  active: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

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
