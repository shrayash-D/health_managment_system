import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PatientDashboardService } from '../services/patient-dashboard.services';
import {
  Appointment,
  BillingSummary,
  Invoice,
  LabResult,
  Medication,
  Vital,
} from '../models/patient-dashboard.models';
import { RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-patient-dashboard',
  imports: [CommonModule, RouterLink],
  standalone: true,
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.css',
})
export class PatientDashboardComponent implements OnInit {
  vitals$: Observable<Vital[]>;
  appointments$: Observable<Appointment[]>;
  medication$: Observable<Medication[]>;
  labResults$: Observable<LabResult[]>;
  billings$: Observable<BillingSummary[]>;
  invoice$: Observable<Invoice[]>;
  medicalHistory$!: Observable<any[]>;

  patientId?: number;

  constructor(
    private patientDetail: PatientDashboardService,
    private auth: AuthService
  ) {
    this.vitals$ = patientDetail.getVitals();
    this.appointments$ = patientDetail.getAppointments();
    this.medication$ = patientDetail.getMedications();
    this.labResults$ = patientDetail.getLabs();
    this.billings$ = patientDetail.getBillingSummary();
    this.invoice$ = patientDetail.getInvoices();
    
  }

  ngOnInit(): void {
    const u = this.auth.currentUserValue as any;
    if (u && typeof u.id === 'number') this.patientId = u.id;
    // load medical history from localStorage for display
    const key = `medicalHistory:${this.patientId ?? 'anon'}`;
    try {
      const raw = localStorage.getItem(key);
      const arr = raw ? (JSON.parse(raw) as any[]) : [];
      this.medicalHistory$ = of(arr);
    } catch (e) {
      this.medicalHistory$ = of([]);
    }
  }
}
