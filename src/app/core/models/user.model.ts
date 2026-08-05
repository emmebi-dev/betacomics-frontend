export type Role = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  username: string;
  email: string;
}

export interface ResetPasswordRequest {
  username: string;
  email: string;
  newPassword: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  username: string;
  role: string;
}
