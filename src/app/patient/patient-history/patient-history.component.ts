import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { PatientService } from '../../services/patient.service';
import {
  AppointmentHistoryResponse,
  AppointmentStatusEnum,
  InvoiceStatusEnum,
  MedicationActivityEnum,
} from '../../models/appointment-history.interface';

@Component({
  selector: 'app-patient-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-history.component.html',
  styleUrls: ['./patient-history.component.css'],
})
export class PatientHistoryComponent implements OnInit {
  appointments: AppointmentHistoryResponse[] = [];
  filteredAppointments: AppointmentHistoryResponse[] = [];
  loading = false;
  error = '';
  selectedFilter: 'all' | 'completed' | 'pending' | 'cancelled' = 'completed';
  expandedAppointmentId: string | null = null;

  // Enums for template
  AppointmentStatus = AppointmentStatusEnum;
  InvoiceStatus = InvoiceStatusEnum;
  MedicationActivity = MedicationActivityEnum;

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.loadAppointmentHistory();
  }

  /**
   * Load appointment history from API
   */
  loadAppointmentHistory(): void {
    const currentUserStr = localStorage.getItem('currentUser');
    const userId = currentUserStr ? JSON.parse(currentUserStr).id : null;

    if (!userId) {
      this.error = 'User ID not found. Please log in again.';
      console.error('No user ID found in localStorage');
      return;
    }

    this.loading = true;
    this.error = '';

    this.patientService.getPatientAppointments(userId).subscribe({
      next: (data) => {
        this.appointments = data;
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading appointment history:', err);
        this.error = 'Failed to load appointment history. Please try again.';
        this.loading = false;
      },
    });
  }

  /**
   * Apply filter to appointments
   */
  applyFilter(): void {
    if (this.selectedFilter === 'all') {
      this.filteredAppointments = this.appointments;
    } else if (this.selectedFilter === 'completed') {
      this.filteredAppointments = this.appointments.filter(
        (a) => a.status === AppointmentStatusEnum.Completed,
      );
    } else if (this.selectedFilter === 'pending') {
      this.filteredAppointments = this.appointments.filter(
        (a) => a.status === AppointmentStatusEnum.Pending,
      );
    } else if (this.selectedFilter === 'cancelled') {
      this.filteredAppointments = this.appointments.filter(
        (a) => a.status === AppointmentStatusEnum.Cancelled,
      );
    }
  }

  /**
   * Change filter
   */
  setFilter(filter: 'all' | 'completed' | 'pending' | 'cancelled'): void {
    this.selectedFilter = filter;
    this.applyFilter();
  }

  /**
   * Toggle appointment details
   */
  toggleAppointment(appointmentId: string): void {
    this.expandedAppointmentId =
      this.expandedAppointmentId === appointmentId ? null : appointmentId;
  }

  /**
   * Get status text
   */
  getStatusText(status: AppointmentStatusEnum): string {
    switch (status) {
      case AppointmentStatusEnum.Pending:
        return 'Pending';
      case AppointmentStatusEnum.Completed:
        return 'Completed';
      case AppointmentStatusEnum.Cancelled:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get status badge class
   */
  getStatusClass(status: AppointmentStatusEnum): string {
    switch (status) {
      case AppointmentStatusEnum.Pending:
        return 'badge-pending';
      case AppointmentStatusEnum.Completed:
        return 'badge-completed';
      case AppointmentStatusEnum.Cancelled:
        return 'badge-cancelled';
      default:
        return 'badge-default';
    }
  }

  /**
   * Get invoice status text
   */
  getInvoiceStatusText(status: number): string {
    switch (status) {
      case InvoiceStatusEnum.Unpaid:
        return 'Unpaid';
      case InvoiceStatusEnum.Paid:
        return 'Paid';
      case InvoiceStatusEnum.Overdue:
        return 'Overdue';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get medication activity text
   */
  getMedicationActivityText(activity: number): string {
    switch (activity) {
      case MedicationActivityEnum.Active:
        return 'Active';
      case MedicationActivityEnum.Completed:
        return 'Completed';
      case MedicationActivityEnum.OnHold:
        return 'On Hold';
      default:
        return 'Unknown';
    }
  }

  /**
   * Refresh data
   */
  refresh(): void {
    this.loadAppointmentHistory();
  }

  /**
   * Get count of completed appointments
   */
  getCompletedCount(): number {
    return this.appointments.filter(
      (a) => a.status === AppointmentStatusEnum.Completed,
    ).length;
  }

  /**
   * Get count of pending appointments
   */
  getPendingCount(): number {
    return this.appointments.filter(
      (a) => a.status === AppointmentStatusEnum.Pending,
    ).length;
  }

  /**
   * Get count of cancelled appointments
   */
  getCancelledCount(): number {
    return this.appointments.filter(
      (a) => a.status === AppointmentStatusEnum.Cancelled,
    ).length;
  }
}
