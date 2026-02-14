export interface Patient {
  id: number;
  userId?: string; // Keep the original userId for API operations
  name: string;
  contactInfo: string;
  dob: string; // Date of Birth
  medicalHistory?: string;
  bloodGroup?: string;
  allergies?: string[];
  primaryPhysician?: string;
}

// API Response interface
export interface PatientApiResponse {
  id: string;
  userId: string;
  doctorId: string | null;
  bloodGroup: string;
  address: string;
  profileImage: string;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    dob: string;
  };
  doctor: any;
  appointments: Array<{
    id: string;
    doctorId: string;
    patientId: string;
    slotId: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    status: number;
    reason: string;
  }>;
  vitals: any[];
  medications: any[];
  invoices: any[];
  diagnoses: any[];
}

// Admin API Response for Patient List
export interface PatientListApiResponse {
  id: string;
  userId: string;
  doctorId: string | null;
  bloodGroup: string;
  address: string;
  profileImage: string;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    dob: string;
  };
  doctor?: {
    id: string;
    userId: string;
    specialization: string;
    yearsOfExperience: number;
    memberSince?: number;
    bio: string;
    user: {
      id: string;
      name: string;
      email: string;
      phoneNumber: string;
      dob: string;
    };
  } | null;
  appointments?: Array<{
    id: string;
    doctorId: string;
    patientId: string;
    slotId: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    status: number;
    reason: string;
  }>;
}
