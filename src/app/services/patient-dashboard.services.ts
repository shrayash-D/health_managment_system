import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  Appointment,
  BillingSummary,
  Invoice,
  LabResult,
  Medication,
  Vital,
} from '../models/patient-dashboard.models';

@Injectable({ providedIn: 'root' })
export class PatientDashboardService {
  getVitals(): Observable<Vital[]> {
    // Dummy data (you can randomize later)
    return of([
      { id: 'bp', label: 'Blood Pressure', value: '118/76', unit: 'mmHg' },
      { id: 'hr', label: 'Heart Rate', value: 78, unit: 'bpm' },
      { id: 'temp', label: 'Temperature', value: 36.8, unit: '°C' },
      { id: 'spo2', label: 'SpO₂', value: 98, unit: '%' },
    ]);
  }

  getAppointments(): Observable<Appointment[]> {
    return of([
      {
        id: 'a1',
        date: new Date('2025-12-16T10:30:00'), // Dec 16, 2025 • 10:30 AM
        reason: 'General Checkup',
        status: 'Scheduled',
      },
      {
        id: 'a2',
        date: new Date('2025-12-10T15:00:00'), // Dec 10, 2025 • 03:00 PM
        reason: 'Follow‑up',
        status: 'Completed',
      },
    ]);
  }

  getMedications(): Observable<Medication[]> {
    return of([
      {
        id: 'm1',
        drug: 'Amoxicillin',
        dose: '500 mg',
        route: 'PO',
        frequency: 'BID',
        status: 'Active',
      },
      {
        id: 'm2',
        drug: 'Paracetamol',
        dose: '650 mg',
        route: 'PO',
        frequency: 'PRN',
        status: 'Active',
      },
      // Add a few more to validate badge mapping:
      {
        id: 'm3',
        drug: 'Ibuprofen',
        dose: '400 mg',
        route: 'PO',
        frequency: 'TID',
        status: 'On Hold',
      },
      {
        id: 'm4',
        drug: 'Azithromycin',
        dose: '250 mg',
        route: 'PO',
        frequency: 'OD',
        status: 'Completed',
      },
      {
        id: 'm5',
        drug: 'Vitamin D3',
        dose: '1000 IU',
        route: 'PO',
        frequency: 'OD',
        status: 'Pending',
      },
    ]);
  }

  getLabs(): Observable<LabResult[]> {
    return of([
      { id: 'l1', title: 'CBC', note: 'Normal', status: 'Completed' },
      { id: 'l2', title: 'LFT', note: 'Elevated ALT', status: 'Abnormal' },
      {
        id: 'l3',
        title: 'Creatinine',
        note: 'Review urgently',
        status: 'Critical',
      },
      // Optional extra for testing:
      { id: 'l4', title: 'HbA1c', note: 'In progress', status: 'Pending' },
    ]);
  }

  getBillingSummary(): Observable<BillingSummary[]> {
    return of([
      { label: 'Outstanding', value: 2450 },
      { label: 'Paid', value: 8300 },
      { label: 'Insurance', value: 'MediCare Pvt.' },
    ]);
  }

  getInvoices(): Observable<Invoice[]> {
    return of([
      { id: 'inv1', number: '#INV‑10021', amount: 1200, status: 'Unpaid' },
      { id: 'inv2', number: '#INV‑10018', amount: 2050, status: 'Paid' },
      { id: 'inv3', number: '#INV‑10025', amount: 900, status: 'Overdue' },
    ] );
  }
}
