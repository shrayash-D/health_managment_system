import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorDataService, Appointment } from '../../services/doctor-data.service';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css']
})
export class AppointmentComponent implements OnInit {
  appointments: Appointment[] = [];
  appointmentFilterDate = '';
  appointmentFilterStatus = '';
  sidebarCollapsed = false;
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

  onSidebarCollapse(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
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
