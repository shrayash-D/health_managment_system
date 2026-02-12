export interface Patient {
  id: number;
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
