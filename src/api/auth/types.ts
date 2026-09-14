export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "superadmin" | "admin" | "seller";
  active: boolean;
  schoolId?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}
