export interface Patient {
  id: string; // e.g., "P123"
  name: string; // e.g., "Anita Deshmukh"
  age: number; // e.g., 33
  bloodGroup: string; // e.g., "O+"
  allergies?: string[]; // e.g., ["Penicillin"]
  primaryPhysician?: string; // e.g., "Dr. Jon Miller"
}

export interface VitalTrendPoint {
  timestamp: string; // ISO string
  heartRate?: number;
  bpS?: number;
  bpD?: number;
  spo2?: number;
  tempC?: number;
}

export interface Vital {
  id: string;
  label: string;
  value: string | number;
  unit: string;
}

export type AppointmentStatus =
  | 'Scheduled'
  | 'Completed'
  | 'Cancelled'
  | 'Rescheduled';

export interface Appointment {
  id: string;
  date: Date; // used in template: | date pipe
  reason: string; // e.g., "General Checkup"
  status: AppointmentStatus;
}


export type MedicationStatus = 'Active' | 'On Hold' | 'Completed' | 'Pending';

export interface Medication {
  id: string;
  drug: string;
  dose: string;
  route: string;      // e.g., 'PO', 'IV'
  frequency: string;  // e.g., 'BID', 'PRN'
  status: MedicationStatus;
}


export type LabStatus = 'Completed' | 'Abnormal' | 'Critical' | 'Pending';

export interface LabResult {
  id: string;
  title: string; // e.g., "CBC"
  note: string; // e.g., "Normal" / "Elevated ALT"
  status: LabStatus;
}


export interface Invoice {
  id: string;       // internal id
  number: string;   // e.g., '#INV‑10021'
  amount: number;   // numeric amount
  status: InvoiceStatus;
}

export interface BillingSummary {
  label : string;
  value : number | string;
}


export type InvoiceStatus = 'Paid' | 'Unpaid' | 'Overdue';

export interface Invoice {
  id: string; // e.g., "#INV-10021"
  amount: number; // ₹
  status: InvoiceStatus;
}

export interface PatientDashboardData {
  patient: Patient;
  vital: Vital;
  appointments: Appointment[];
  medications: Medication[];
  labs: LabResult[];
  billingSummary: BillingSummary;
  invoices: Invoice[];
}
