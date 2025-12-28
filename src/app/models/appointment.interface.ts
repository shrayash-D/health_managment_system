export type AppointmentStatus = 'BOOKED' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: number;
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
