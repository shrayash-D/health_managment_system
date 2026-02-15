export interface AppointmentHistoryResponse {
  id: string;
  doctorId: string;
  patientId: string;
  slotId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatusEnum;
  reason: string;
  patientName: string;
  vitals: VitalsHistory | null;
  medications: MedicationHistory[];
  invoice: InvoiceHistory | null;
  diagnosis: DiagnosisHistory | null;
}

export interface VitalsHistory {
  id: string;
  appointmentId: string;
  patientId: string;
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  spO2: number;
}

export interface MedicationHistory {
  id: string;
  appointmentId: string;
  patientId: string;
  drug: string;
  dose: string;
  route: string;
  frequency: string;
  activity: number;
}

export interface InvoiceHistory {
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

export interface DiagnosisHistory {
  id: string;
  appointmentId: string;
  patientId: string;
  diagnosisDetails: string;
}

export enum AppointmentStatusEnum {
  Pending = 0,
  Completed = 1,
  Cancelled = 2,
}

export enum InvoiceStatusEnum {
  Unpaid = 0,
  Paid = 1,
  Overdue = 2,
}

export enum MedicationActivityEnum {
  Active = 0,
  Completed = 1,
  OnHold = 2,
}
