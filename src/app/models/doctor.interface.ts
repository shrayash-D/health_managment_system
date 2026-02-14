export interface Doctor {
  id: string | number; // Support both GUID (backend) and number (mock data)
  userId?: string;
  specialization: string;
  yearsOfExperience?: number;
  memberSince?: number;
  bio?: string;
  // New backend structure (nested user object)
  user?: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
  };
  // Old structure (direct properties for backward compatibility)
  name?: string;
  email?: string;
  department?: string;
  contactInfo?: string;
  availability?: DoctorAvailability[];
}

export interface DoctorAvailability {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}
