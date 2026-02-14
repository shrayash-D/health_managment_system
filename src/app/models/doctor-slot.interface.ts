export interface DoctorSlot {
  slotId: string; // Changed from id to slotId to match backend AvailableSlotDto
  date: string; // ISO date string
  startTime: string; // TimeSpan from backend
  endTime: string; // TimeSpan from backend
  timeDisplay: string; // Formatted time display from backend
}

export interface DoctorSlotsResponse {
  doctorId: string;
  doctorName: string;
  totalAvailableSlots: number;
  slots: DoctorSlot[];
}

export interface BookAppointmentRequest {
  doctorId: string;
  patientId: string;
  slotId: string;
  reason: string;
}

export interface BookAppointmentResponse {
  message: string;
  appointment: {
    id: string;
    doctorId: string;
    patientId: string;
    slotId: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    status: number;
    reason: string;
  };
}
