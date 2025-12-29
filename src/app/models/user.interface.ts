export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export interface User {
  id: number;
  username: string;
  password?: string; // Should not be exposed in frontend normally
  role: UserRole;
  email?: string;
  name?: string;
}
