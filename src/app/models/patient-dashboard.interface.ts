export interface PatientDashboardApiResponse {
  id: string;
  userId: string;
  doctorId: string;
  bloodGroup: string;
  address: string | null;
  profileImage: string;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    dob: string;
  };
  doctor: {
    id: string;
    userId: string;
    specialization: string;
    yearsOfExperience: number;
    memberSince: string | null;
    bio: string;
    user: {
      id: string;
      name: string;
      email: string;
      phoneNumber: string;
      dob: string;
    };
  };
  appointments: AppointmentDetail[];
}

export interface AppointmentDetail {
  id: string;
  doctorId: string;
  patientId: string;
  slotId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: number;
  reason: string;
  patientName: string;
  vitals: VitalsDetail | null;
  medications: MedicationDetail[];
  invoice: InvoiceDetail | null;
  diagnosis: DiagnosisDetail | null;
}

export interface VitalsDetail {
  id: string;
  appointmentId: string;
  patientId: string;
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  spO2: number;
}

export interface MedicationDetail {
  id: string;
  appointmentId: string;
  patientId: string;
  drug: string;
  dose: string;
  route: string;
  frequency: string;
  activity: number;
}

export interface InvoiceDetail {
  id: string;
  appointmentId: string;
  patientId: string;
  issuedDate: string;
  status: number;
  consultationType: string;
  consulationFee: number;
  labFee: number;
  medicineFee: number;
  total: number;
  outstanding: number | null;
}

export interface DiagnosisDetail {
  id: string;
  appointmentId: string;
  patientId: string;
  diagnosisDetails: string;
}

// Enums for status mapping
export enum AppointmentStatus {
  Scheduled = 0,
  Completed = 1,
  Cancelled = 2,
  Rescheduled = 3,
}

export enum PaymentStatus {
  Unpaid = 0,
  Paid = 1,
  Overdue = 2,
  Pending = 3,
}

export enum MedicationActivity {
  Active = 0,
  Completed = 1,
  OnHold = 2,
  Pending = 3,
}
