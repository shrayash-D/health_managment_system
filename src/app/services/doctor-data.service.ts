import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Appointment {
  id: number;
  patientName: string;
  date: string;
  time: string;
  type: 'new' | 'followup';
  status: 'BOOKED' | 'COMPLETED' | 'CANCELLED' | '';
}


export interface Patient {
  id: number;
  name: string;
  dob: string;
  contact: string;
  medicalHistory: string;
  mrn: string;
  sex: 'Male' | 'Female' | 'Other';
  diagnosis: string;
  ongoingTreatment: string;
  lastAppointment: string;
  nextAppointment: string;
  assignedDoctor: string;
  department: string;
  avatar?: string;
}


export interface Consultation {
  id: number;
  patientId: number;
  patientName: string;
  date: string;
  diagnosis: string;
  previousDiagnosis?: string;
  labResults: string[];
  prescriptions?: string[];
  vitals?: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    spO2: string;
  };
  medications?: {
    drug: string;
    dose: string;
    route: string;
    frequency: string;
    activity: string;
  }[];
  labTests?: {
    cbc: string;
    lft: string;
    creatinine: string;
    hba1c: string;
  };
  billing?: {
    consultationType: string;
    consultationFee: string;
    labFee: string;
    medicineFee: string;
    total: string;
  };
}

export interface Invoice {
  id: string;
  patientId: number;
  patientName: string;
  amount: number;
  paymentStatus: 'PAID' | 'PENDING' | 'OVERDUE';

  // NEW fields
  issueDate?: string;
  dueDate?: string;
  paidDate?: string;
  paymentMethod: string;
  transactionId: string;
  consultationType: string;

  consultationFee: number;
  labFee: number;
  medicineFee: number;
  otherCharges: number;
  subtotal: number;
}


@Injectable({
  providedIn: 'root'
})
export class DoctorDataService {
  // 🔹 Doctor profile data
  private doctorSubject = new BehaviorSubject<any>({
    id: 'p123',
    fullName: 'Dr. Sarah Johnson',
    email: 'dr.sarah@example.com',
    phone: '9876543210',
    countryCode: '+91',
    specialization: 'Cardiologist',
    bio: 'Experienced cardiologist with 10+ years in patient care.',
    role: 'Doctor',
    experience: '10+ years',
    photoUrl: localStorage.getItem('doctorPhoto') || null
  });

  doctor$ = this.doctorSubject.asObservable();

  getDoctor() {
    return this.doctorSubject.value;
  }

  updateDoctor(updated: any) {
    const newDoctor = { ...this.doctorSubject.value, ...updated };
    this.doctorSubject.next(newDoctor);
    if (updated.photoUrl) {
      localStorage.setItem('doctorPhoto', updated.photoUrl);
    }
  }

  // 🔹 Appointment management
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([
    { id: 1, patientName: 'John Doe', date: '2023-10-15', time: '10:00-11:00 ', status: 'BOOKED', type: 'new' },
    { id: 2, patientName: 'Jane Smith', date: '2023-10-16', time: '14:00-15:30 ', status: 'COMPLETED', type: 'followup' },
    { id: 3, patientName: 'Bob Johnson', date: '2023-10-17', time: '11:00-13:00 ', status: 'CANCELLED', type: 'new' }
  ]);
// 🔹 Mock available slots (doctor-defined)

  appointments$ = this.appointmentsSubject.asObservable();

  updateAppointment(updated: Appointment) {
    this.appointmentsSubject.next(
      this.appointmentsSubject.value.map(a => a.id === updated.id ? updated : a)
    );
  }

  cancelAppointment(id: number) {
    this.updateAppointment({ ...this.appointmentsSubject.value.find(a => a.id === id)!, status: 'CANCELLED' });
    alert('Appointment cancelled successfully ❌');
  }

  completeAppointment(id: number) {
    this.updateAppointment({ ...this.appointmentsSubject.value.find(a => a.id === id)!, status: 'COMPLETED' });
  }

  // 🔹 Patient management
  private patientsSubject = new BehaviorSubject<Patient[]>([
    {
      id: 1,
      name: 'Candice Wu',
      dob: '1975-03-15',
      contact: 'candice.wu@example.com',
      medicalHistory: 'Hypertension, Diabetes',
      mrn: 'MRN001',
      sex: 'Female',
      diagnosis: 'Hypertension & Diabetes',
      ongoingTreatment: 'Lisinopril 10mg daily, Metformin 500mg twice daily',
      lastAppointment: '2023-10-10',
      nextAppointment: '2023-11-10',
      assignedDoctor: 'Dr. Shrayash Desai',
      department: 'Cardiology',
      avatar: 'assets/images/OIP.jpg'
    },
    {
      id: 2,
      name: 'Liam Chen',
      dob: '1985-07-22',
      contact: 'liam.chen@example.com',
      medicalHistory: 'Asthma',
      mrn: 'MRN002',
      sex: 'Male',
      diagnosis: 'Asthma',
      ongoingTreatment: 'Albuterol inhaler as needed',
      lastAppointment: '2023-10-12',
      nextAppointment: '2023-11-12',
      assignedDoctor: 'Dr. Shrayash Desai',
      department: 'Pulmonology',
      avatar: 'assets/images/OIP (1).jpg'
    },
    {
      id: 3,
      name: 'Sophia Patel',
      dob: '1990-11-08',
      contact: 'sophia.patel@example.com',
      medicalHistory: 'Migraine',
      mrn: 'MRN003',
      sex: 'Female',
      diagnosis: 'Chronic Migraine',
      ongoingTreatment: 'Sumatriptan 50mg as needed',
      lastAppointment: '2023-10-14',
      nextAppointment: '2023-11-14',
      assignedDoctor: 'Dr. Shrayash Desai',
      department: 'Neurology',
      avatar: 'assets/images/OIP.jpg'
    },
    {
      id: 4,
      name: 'Noah Kim',
      dob: '1995-01-30',
      contact: 'noah.kim@example.com',
      medicalHistory: 'Allergies',
      mrn: 'MRN004',
      sex: 'Male',
      diagnosis: 'Allergic Rhinitis',
      ongoingTreatment: 'Loratadine 10mg daily',
      lastAppointment: '2023-10-16',
      nextAppointment: '2023-11-16',
      assignedDoctor: 'Dr. Shrayash Desai',
      department: 'Allergy & Immunology',
      avatar: 'assets/images/OIP (1).jpg'
    },
    {
      id: 5,
      name: 'Emma Johnson',
      dob: '1978-05-12',
      contact: 'emma.johnson@example.com',
      medicalHistory: 'Arthritis',
      mrn: 'MRN005',
      sex: 'Female',
      diagnosis: 'Rheumatoid Arthritis',
      ongoingTreatment: 'Methotrexate 15mg weekly',
      lastAppointment: '2023-10-18',
      nextAppointment: '2023-11-18',
      assignedDoctor: 'Dr. Shrayash Desai',
      department: 'Rheumatology',
      avatar: 'assets/images/OIP.jpg'
    },
    {
      id: 6,
      name: 'Alex Rodriguez',
      dob: '2000-09-25',
      contact: 'alex.rodriguez@example.com',
      medicalHistory: 'None',
      mrn: 'MRN006',
      sex: 'Male',
      diagnosis: 'Healthy',
      ongoingTreatment: 'None',
      lastAppointment: '2023-10-20',
      nextAppointment: '2024-04-20',
      assignedDoctor: 'Dr. Shrayash Desai',
      department: 'General Medicine',
      avatar: 'assets/images/OIP (1).jpg'
    }
  ]);

  patients$ = this.patientsSubject.asObservable();

  searchPatients(query: string): Patient[] {
    const lowerQuery = query.toLowerCase();
    return this.patientsSubject.value.filter(patient =>
      patient.name.toLowerCase().includes(lowerQuery) ||
      patient.id.toString().includes(lowerQuery)
    );
  }

  getPatientById(id: number): Patient | undefined {
    return this.patientsSubject.value.find(patient => patient.id === id);
  }

  updatePatient(updated: Patient) {
    this.patientsSubject.next(
      this.patientsSubject.value.map(p => p.id === updated.id ? updated : p)
    );
  }

  // 🔹 Consultation management
  private consultationsSubject = new BehaviorSubject<Consultation[]>([
    { id: 1, patientId: 1, patientName: 'Candice Wu', date: '2023-10-10', diagnosis: 'Hypertension', labResults: ['Blood Pressure: 140/90'], prescriptions: [] },
    { id: 2, patientId: 2, patientName: 'Liam Chen', date: '2023-10-12', diagnosis: 'Asthma exacerbation', labResults: ['Peak flow: 300 L/min'], prescriptions: [] },
    { id: 3, patientId: 3, patientName: 'Sophia Patel', date: '2023-10-14', diagnosis: 'Migraine', labResults: ['MRI: Normal'], prescriptions: [] },
    { id: 4, patientId: 4, patientName: 'Noah Kim', date: '2023-10-16', diagnosis: 'Allergic rhinitis', labResults: ['Allergy test: Positive for pollen'], prescriptions: [] }
  ]);

  consultations$ = this.consultationsSubject.asObservable();

  getConsultations(): Consultation[] {
    return this.consultationsSubject.value;
  }

  addConsultation(consultation: Consultation) {
    this.consultationsSubject.next([...this.consultationsSubject.value, consultation]);
  }

  updateConsultation(updated: Consultation) {
    this.consultationsSubject.next(
      this.consultationsSubject.value.map(c => c.id === updated.id ? updated : c)
    );
  }

  // 🔹 Billing management
  private invoicesSubject = new BehaviorSubject<Invoice[]>([
  {
    id: 'INV001',
    patientId: 1,
    patientName: 'Candice Wu',
    amount: 150.00,
    paymentStatus: 'PAID',
    paidDate: '2023-10-01',
    paymentMethod: 'Credit Card',
    transactionId: 'TXN12345',
    consultationType: 'Cardiology Consultation',
    consultationFee: 100,
    labFee: 30,
    medicineFee: 20,
    otherCharges: 0,
    subtotal: 150
  },
  {
    id: 'INV002',
    patientId: 2,
    patientName: 'Liam Chen',
    amount: 200.00,
    paymentStatus: 'PENDING',
    issueDate: '2023-10-05',
    dueDate: '2023-10-15',
    paymentMethod: 'Cash',
    transactionId: 'TXN67890',
    consultationType: 'Asthma Follow-up',
    consultationFee: 120,
    labFee: 50,
    medicineFee: 20,
    otherCharges: 10,
    subtotal: 200
  },
  {
    id: 'INV003',
    patientId: 3,
    patientName: 'Sophia Patel',
    amount: 120.00,
    paymentStatus: 'OVERDUE',
    issueDate: '2023-09-20',
    dueDate: '2023-09-30',
    paymentMethod: 'UPI',
    transactionId: 'TXN54321',
    consultationType: 'Neurology Consultation',
    consultationFee: 80,
    labFee: 20,
    medicineFee: 10,
    otherCharges: 10,
    subtotal: 120
  }
]);


  invoices$ = this.invoicesSubject.asObservable();

  getInvoices(): Invoice[] {
    return this.invoicesSubject.value;
  }
  getInvoiceById(id: string|number): Invoice | undefined {
    return this.invoicesSubject.value.find((inv: Invoice) => inv.id === id);
  }

  addInvoice(invoice: Invoice) {
    this.invoicesSubject.next([...this.invoicesSubject.value, invoice]);
  }

  updateInvoice(updated: Invoice) {
    this.invoicesSubject.next(
      this.invoicesSubject.value.map(inv => inv.id === updated.id ? updated : inv)
    );
  }

// 🔹 Doctor available slots management
private slotsSubject = new BehaviorSubject<{ date: string; times: string[] }[]>([
  { date: '2025-01-05', times: ['10:00-12:00', '14:00-15:00'] },
  { date: '2025-01-06', times: ['09:00-11:00', '16:00-17:00'] },
]);

slots$ = this.slotsSubject.asObservable();

getSlots() {
  return this.slotsSubject.value;
}

addSlot(date: string, time: string) {
  const slots = [...this.slotsSubject.value];
  const slotIndex = slots.findIndex(s => s.date === date);
  if (slotIndex > -1) {
    slots[slotIndex].times.push(time);
  } else {
    slots.push({ date, times: [time] });
  }
  this.slotsSubject.next(slots);
}

removeSlot(date: string, time: string) {
  const slots = this.slotsSubject.value.map(s =>
    s.date === date ? { ...s, times: s.times.filter(t => t !== time) } : s
  ).filter(s => s.times.length > 0);
  this.slotsSubject.next(slots);
}




}
