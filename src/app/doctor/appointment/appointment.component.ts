import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DoctorDataService,
  Appointment,
} from '../../services/doctor-data.service';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css'],
})
export class AppointmentComponent implements OnInit {
  appointments: Appointment[] = [];
  appointmentFilterDate = '';
  appointmentFilterStatus = '';
  slotDate = '';
  slotTime = '';
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

  constructor(private doctorService: DoctorDataService) {}

  ngOnInit() {
    this.doctorService.appointments$.subscribe((appointments) => {
      this.appointments = appointments;
    });
    this.doctorService.slots$.subscribe((slots) => {
      this.availableSlots = slots;
    });
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
