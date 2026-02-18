import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PatientDashboardService } from '../../services/patient-dashboard.services';
import {
  Appointment,
  BillingSummary,
  Invoice,
  LabResult,
  Medication,
  Vital,
} from '../../models/patient-dashboard.models';
import { RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { PatientDashboardApiResponse } from '../../models/patient-dashboard.interface';
import { PaymentModalComponent } from '../payment-modal/payment-modal.component';

@Component({
  selector: 'app-patient-dashboard',
  imports: [CommonModule, RouterLink, PaymentModalComponent],
  standalone: true,
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.css',
})
export class PatientDashboardComponent implements OnInit {
  // Observables for template
  vitals$!: Observable<Vital[]>;
  appointments$!: Observable<Appointment[]>;
  medication$!: Observable<Medication[]>;
  labResults$!: Observable<LabResult[]>;
  billings$!: Observable<BillingSummary[]>;
  invoice$!: Observable<Invoice[]>;

  // Patient data
  patientData?: PatientDashboardApiResponse;
  profileImageUrl: string | null = null;
  patientId?: string;
  loading = false;
  error = '';

  // Patient header info
  patientName = '';
  patientIdFormatted = '';
  patientAge = 0;
  bloodGroup = '';

  // Payment modal
  showPaymentModal = false;
  selectedInvoice: Invoice | null = null;

  constructor(
    private patientDashboardService: PatientDashboardService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadPatientDashboard();
  }

  /**
   * Load all patient dashboard data
   */
  loadPatientDashboard(): void {
    // Get userId from localStorage (same as userprofile component)
    const currentUserStr = localStorage.getItem('currentUser');
    const userId = currentUserStr ? JSON.parse(currentUserStr).id : null;

    if (!userId) {
      this.error = 'User ID not found. Please log in again.';
      console.error('No user ID found in localStorage');
      return;
    }

    this.loading = true;
    this.error = '';

    // First get patient data by userId
    this.patientDashboardService.getPatientByUserId(userId).subscribe({
      next: (patientData) => {
        this.patientId = patientData.id;
        // Now fetch full dashboard data using patient ID
        this.fetchDashboardData(this.patientId);
      },
      error: (err) => {
        console.error('Error loading patient data:', err);
        this.error = 'Failed to load patient data. Please try again.';
        this.loading = false;
      },
    });
  }

  /**
   * Fetch dashboard data using patient ID
   */
  private fetchDashboardData(patientId: string): void {
    this.patientDashboardService.getPatientDashboardData(patientId).subscribe({
      next: (data) => {
        this.patientData = data;
        this.populateDashboard(data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading patient dashboard:', err);
        this.error = 'Failed to load dashboard data. Please try again.';
        this.loading = false;
      },
    });
  }

  /**
   * Populate dashboard with API data
   */
  private populateDashboard(data: PatientDashboardApiResponse): void {
    // Header info
    this.patientName = data.user.name;
    this.patientIdFormatted = `P${data.id.substring(0, 6).toUpperCase()}`;
    this.patientAge = this.calculateAge(data.user.dob);
    this.bloodGroup = data.bloodGroup || 'N/A';
    this.profileImageUrl =
      data.profileImage || 'assets/images/default-avatar.png';

    // Transform data using service
    this.vitals$ = of(this.patientDashboardService.transformVitals(data));
    this.appointments$ = of(
      this.patientDashboardService.transformAppointments(data),
    );
    this.medication$ = of(
      this.patientDashboardService.transformMedications(data),
    );
    this.labResults$ = of(
      this.patientDashboardService.transformLabResults(data),
    );
    this.billings$ = of(
      this.patientDashboardService.transformBillingSummary(data),
    );
    this.invoice$ = of(this.patientDashboardService.transformInvoices(data));
  }

  /**
   * Calculate age from date of birth
   */
  private calculateAge(dob: string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Refresh dashboard data
   */
  refreshDashboard(): void {
    this.loadPatientDashboard();
  }

  /**
   * Open payment modal
   */
  openPaymentModal(invoice: Invoice): void {
    this.selectedInvoice = invoice;
    this.showPaymentModal = true;
  }

  /**
   * Close payment modal
   */
  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.selectedInvoice = null;
  }

  /**
   * Process payment
   */
  processPayment(invoiceId: string): void {
    this.patientDashboardService.markInvoiceAsPaid(invoiceId).subscribe({
      next: () => {
        console.log('Payment successful');
        this.closePaymentModal();

        // Show success message
        this.showSuccessMessage();

        // Refresh dashboard to update invoice status
        setTimeout(() => {
          this.refreshDashboard();
        }, 1000);
      },
      error: (err) => {
        console.error('Payment failed:', err);
        this.showErrorMessage('Payment failed. Please try again.');
      },
    });
  }

  /**
   * Show success message
   */
  private showSuccessMessage(): void {
    // Simple success indication - you can replace with a proper toast notification
    const successDiv = document.createElement('div');
    successDiv.className = 'payment-success-toast';
    successDiv.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>Payment successful!</span>
    `;
    document.body.appendChild(successDiv);

    setTimeout(() => {
      successDiv.classList.add('show');
    }, 100);

    setTimeout(() => {
      successDiv.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(successDiv);
      }, 300);
    }, 3000);
  }

  /**
   * Show error message
   */
  private showErrorMessage(message: string): void {
    alert(message);
  }
}
