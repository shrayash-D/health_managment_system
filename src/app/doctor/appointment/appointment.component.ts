import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorDataService, Appointment,} from '../../services/doctor-data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export enum AppointmentStatus {
  BOOKED = 'BOOKED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.css',
})
export class AppointmentComponent implements OnInit, OnDestroy {
  appointments: Appointment[] = [];
  appointmentFilterDate = '';
  appointmentFilterStatus = '';
  slotDate = '';
  slotStartTime = '';
  slotEndTime = '';
  availableSlots: { date: string; times: string[] }[] = [];

  newAppointment: Appointment = {
    id: 0,
    patientName: '',
    date: '',
    time: '',
    status: '',
    type: 'new',
  };

  private destroy$ = new Subject<void>();

  constructor(private doctorService: DoctorDataService) {}

  ngOnInit() {
    this.doctorService.appointments$
      .pipe(takeUntil(this.destroy$))
      .subscribe((appointments) => {
        this.appointments = appointments;
      });

    this.doctorService.slots$
      .pipe(takeUntil(this.destroy$))
      .subscribe((slots) => {
        this.availableSlots = slots;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addSlot() {
    if (this.slotDate && this.slotStartTime && this.slotEndTime) {
      const timeRange = `${this.slotStartTime}-${this.slotEndTime}`;
      this.doctorService.addSlot(this.slotDate, timeRange);
      this.slotDate = '';
      this.slotStartTime = '';
      this.slotEndTime = '';
    }
  }

  removeSlot(date: string, time: string) {
    this.doctorService.removeSlot(date, time);
  }

  get filteredAppointments() {
    return this.appointments.filter((appointment) => {
      const dateMatch =
        !this.appointmentFilterDate ||
        appointment.date === this.appointmentFilterDate;
      const statusMatch =
        !this.appointmentFilterStatus ||
        appointment.status === this.appointmentFilterStatus;
      return dateMatch && statusMatch;
    });
  }

  completeAppointment(id: number) {
    this.doctorService.completeAppointment(id);
  }

  cancelAppointment(id: number) {
    this.doctorService.cancelAppointment(id);
  }

  scheduleAppointment() {
    if (
      this.newAppointment.patientName &&
      this.newAppointment.date &&
      this.newAppointment.time &&
      this.newAppointment.status
    ) {
      this.doctorService.addAppointment(this.newAppointment);
      this.newAppointment = {
        id: 0,
        patientName: '',
        date: '',
        time: '',
        status: '',
        type: 'new',
      };
    }
  }
}
