// export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export interface User {
  id?: number;
  password?: string; // Should not be exposed in frontend normally
  role: string;
  email: string;
  name?: string;
}
