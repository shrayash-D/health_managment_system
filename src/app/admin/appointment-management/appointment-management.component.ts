import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { DoctorService } from '../../services/doctor.service';
import { PatientService } from '../../services/patient.service';
import {
  Appointment,
  AppointmentStatus,
} from '../../models/appointment.interface';
import { Doctor } from '../../models/doctor.interface';
import { Patient } from '../../models/patient.interface';
import { Observable, combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-appointment-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment-management.component.html',
  styleUrl: './appointment-management.component.css',
})
export class AppointmentManagementComponent implements OnInit {
  appointments$!: Observable<Appointment[]>;
  doctors$!: Observable<Doctor[]>;
  patients$!: Observable<Patient[]>;

  searchTerm: string = '';
  statusFilter: AppointmentStatus | 'ALL' = 'ALL';

  constructor(
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private patientService: PatientService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.appointments$ = combineLatest([
      this.appointmentService.getAllAppointments(),
      this.patientService.getAllPatients(),
      this.doctorService.getAllDoctors(),
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
    );
    this.doctors$ = this.doctorService.getAllDoctors();
    this.patients$ = this.patientService.getAllPatients();
  }

  cancelAppointment(id: number): void {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.appointmentService.cancelAppointment(id).subscribe(() => {
        this.loadData();
      });
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
