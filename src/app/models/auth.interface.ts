export interface AuthUser {
  id?: string; // Changed to string to match Guid from backend
  password?: string; // Should not be exposed in frontend normally
  role: string;
  email: string;
  name?: string;
  token?: string; // JWT token from backend
  refreshToken?: string; // Refresh token from backend
  expiresAt?: Date; // Token expiry time
}

export interface LoginRequest {
  email: string;
  password: string;
  role: string;
}

export interface LoginResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  role: string;
  phoneNumber: string;
  dob?: string; // Optional ISO date string
}

export interface SignupResponse {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
}
