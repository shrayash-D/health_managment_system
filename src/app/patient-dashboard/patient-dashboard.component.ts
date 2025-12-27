import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PatientDashboardService } from '../services/patient-dashboard.services';
import { Appointment, BillingSummary, Invoice, LabResult, Medication, Vital } from '../models/patient-dashboard.models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-patient-dashboard',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.css',
})
export class PatientDashboardComponent {
  vitals$: Observable<Vital[]>;
  appointments$: Observable<Appointment[]>;
  medication$: Observable<Medication[]>;
  labResults$: Observable<LabResult[]>;
  billings$: Observable<BillingSummary[]>;
  invoice$: Observable<Invoice[]>;

  constructor(private patientDetail: PatientDashboardService) {
    this.vitals$ = patientDetail.getVitals();
    this.appointments$ = patientDetail.getAppointments();
    this.medication$ = patientDetail.getMedications();
    this.labResults$ = patientDetail.getLabs();
    this.billings$ = patientDetail.getBillingSummary();
    this.invoice$ = patientDetail.getInvoices();
  }
}
