import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import {
  Appointment,
  AppointmentStatus,
} from '../../models/appointment.interface';
import { Doctor } from '../../models/doctor.interface';
import { Patient } from '../../models/patient.interface';
import { Observable, combineLatest, map } from 'rxjs';
import { LoadingComponent } from '../shared/loading/loading.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-appointment-management',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './appointment-management.component.html',
  styleUrl: './appointment-management.component.css',
})
export class AppointmentManagementComponent implements OnInit {
  appointments$!: Observable<Appointment[]>;
  doctors$!: Observable<Doctor[]>;
  patients$!: Observable<Patient[]>;

  searchTerm: string = '';
  statusFilter: AppointmentStatus | 'ALL' = 'ALL';
  isLoading: boolean = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.appointments$ = combineLatest([
      this.adminService.getAllAppointments(),
      this.adminService.getAllPatients(),
      this.adminService.getAllDoctors(),
    ]).pipe(
      map(([appointments, patients, doctors]) => {
        return appointments.map((apt) => ({
          ...apt,
          patientName:
            patients.find((p) => p.id === apt.patientId)?.name ||
            apt.patientName,
          doctorName:
            doctors.find((d) => d.id == apt.doctorId)?.user?.name ||
            doctors.find((d) => d.id == apt.doctorId)?.name ||
            apt.doctorName,
        }));
      }),
      finalize(() => (this.isLoading = false)),
    );
    this.doctors$ = this.adminService.getAllDoctors();
    this.patients$ = this.adminService.getAllPatients();
  }

  cancelAppointment(appointment: Appointment): void {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      const appointmentId = appointment.appointmentId;
      if (appointmentId) {
        this.adminService.cancelAppointment(appointmentId).subscribe({
          next: () => {
            alert('Appointment cancelled successfully');
            this.loadData();
          },
          error: (error) => {
            alert('Failed to cancel appointment. Please try again.');
            console.error('Cancel appointment error:', error);
          },
        });
      } else {
        alert('Unable to cancel appointment: Appointment ID not found');
      }
    }
  }

  getFilteredAppointments(appointments: Appointment[]): Appointment[] {
    let filtered = appointments;

    if (this.statusFilter !== 'ALL') {
      filtered = filtered.filter((a) => a.status === this.statusFilter);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.patientName?.toLowerCase().includes(term) ||
          a.doctorName?.toLowerCase().includes(term) ||
          a.reason?.toLowerCase().includes(term),
      );
    }

    return filtered;
  }

  getStatusBadgeClass(status: AppointmentStatus): string {
    const classes: { [key: string]: string } = {
      BOOKED: 'badge badge-info',
      COMPLETED: 'badge badge-success',
      CANCELLED: 'badge badge-danger',
    };
    return classes[status] || 'badge';
  }
}
