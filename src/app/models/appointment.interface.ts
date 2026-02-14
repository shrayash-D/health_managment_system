export type AppointmentStatus = 'BOOKED' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: number;
  appointmentId?: string; // Keep the original GUID for API operations
  patientId: number;
  patientName?: string;
  doctorId: number;
  doctorName?: string;
  date: string; // ISO date string
  time: string;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
}

// Admin API Response for Appointment List
export interface AppointmentApiResponse {
  id: string;
  doctorId: string;
  patientId: string;
  slotId: string;
  appointmentDate: string;
  startTime: string; // TimeSpan from backend (format: "HH:MM:SS")
  endTime: string; // TimeSpan from backend
  status: number; // 0=BOOKED, 1=COMPLETED, 2=CANCELLED
  reason: string;
  vitals?: any;
  medications?: any[];
  invoice?: any;
  diagnosis?: any;
}
