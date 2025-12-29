import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Appointment } from '../models/appointment.interface';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private mockAppointments: Appointment[] = [
    {
      id: 1,
      patientId: 1,
      patientName: 'John Doe',
      doctorId: 1,
      doctorName: 'Dr. Sarah Johnson',
      date: '2025-01-20',
      time: '10:30',
      status: 'BOOKED',
      reason: 'General Checkup',
      notes: 'Regular follow-up',
    },
    {
      id: 2,
      patientId: 2,
      patientName: 'Jane Smith',
      doctorId: 2,
      doctorName: 'Dr. Michael Chen',
      date: '2025-01-20',
      time: '14:00',
      status: 'BOOKED',
      reason: 'Consultation',
      notes: '',
    },
    {
      id: 3,
      patientId: 3,
      patientName: 'Robert Williams',
      doctorId: 1,
      doctorName: 'Dr. Sarah Johnson',
      date: '2025-01-19',
      time: '11:00',
      status: 'COMPLETED',
      reason: 'Follow-up',
      notes: 'Patient responded well to treatment',
    },
    {
      id: 4,
      patientId: 4,
      patientName: 'Emily Davis',
      doctorId: 2,
      doctorName: 'Dr. Michael Chen',
      date: '2025-01-18',
      time: '15:30',
      status: 'COMPLETED',
      reason: 'Routine Check',
      notes: '',
    },
    {
      id: 5,
      patientId: 5,
      patientName: 'Michael Brown',
      doctorId: 1,
      doctorName: 'Dr. Sarah Johnson',
      date: '2025-01-17',
      time: '09:00',
      status: 'CANCELLED',
      reason: 'Emergency',
      notes: 'Patient cancelled due to emergency',
    },
  ];

  getAllAppointments(): Observable<Appointment[]> {
    return of([...this.mockAppointments]);
  }

  getAppointmentById(id: number): Observable<Appointment | undefined> {
    const appointment = this.mockAppointments.find((a) => a.id === id);
    return of(appointment);
  }

  getAppointmentsByPatientId(patientId: number): Observable<Appointment[]> {
    const appointments = this.mockAppointments.filter(
      (a) => a.patientId === patientId
    );
    return of(appointments);
  }

  getAppointmentsByDoctorId(doctorId: number): Observable<Appointment[]> {
    const appointments = this.mockAppointments.filter(
      (a) => a.doctorId === doctorId
    );
    return of(appointments);
  }

  createAppointment(appointment: Appointment): Observable<Appointment> {
    const newId = Math.max(...this.mockAppointments.map((a) => a.id), 0) + 1;
    const newAppointment: Appointment = { ...appointment, id: newId };
    this.mockAppointments.push(newAppointment);
    return of(newAppointment);
  }

  updateAppointment(
    id: number,
    appointment: Appointment
  ): Observable<Appointment> {
    const index = this.mockAppointments.findIndex((a) => a.id === id);
    if (index !== -1) {
      this.mockAppointments[index] = { ...appointment, id };
      return of(this.mockAppointments[index]);
    }
    return of(appointment);
  }

  cancelAppointment(id: number): Observable<boolean> {
    const index = this.mockAppointments.findIndex((a) => a.id === id);
    if (index !== -1) {
      this.mockAppointments[index].status = 'CANCELLED';
      return of(true);
    }
    return of(false);
  }

  deleteAppointment(id: number): Observable<boolean> {
    const index = this.mockAppointments.findIndex((a) => a.id === id);
    if (index !== -1) {
      this.mockAppointments.splice(index, 1);
      return of(true);
    }
    return of(false);
  }
}
