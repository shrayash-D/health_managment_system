import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Appointment } from '../models/appointment.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Doctor } from '../models/doctor.interface';
import {
  DoctorSlotsResponse,
  BookAppointmentRequest,
  BookAppointmentResponse,
} from '../models/doctor-slot.interface';
import {
  ADMIN_API_ENDPOINTS,
  DOCTOR_SLOT_API_ENDPOINTS,
  APPOINTMENT_API_ENDPOINTS,
} from '../constants/api/api-endpoints';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    const user = this.authService.currentUserValue;

    console.log('=== Auth Debug Info ===');
    console.log('Token exists:', !!token);
    console.log('User exists:', !!user);
    console.log('User role:', user?.role);
    console.log(
      'Token preview:',
      token ? token.substring(0, 30) + '...' : 'No token',
    );
    console.log('=====================');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  // New API methods for booking appointments
  getDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(ADMIN_API_ENDPOINTS.getDoctors, {
      headers: this.getAuthHeaders(),
    });
  }

  getDoctorSlots(doctorId: string): Observable<DoctorSlotsResponse> {
    return this.http.get<DoctorSlotsResponse>(
      DOCTOR_SLOT_API_ENDPOINTS.getAvailableSlots(doctorId),
      {
        headers: this.getAuthHeaders(),
      },
    );
  }

  bookAppointment(
    request: BookAppointmentRequest,
  ): Observable<BookAppointmentResponse> {
    return this.http.post<BookAppointmentResponse>(
      APPOINTMENT_API_ENDPOINTS.bookAppointment,
      request,
      { headers: this.getAuthHeaders() },
    );
  }

  // Existing mock data methods below
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
      (a) => a.patientId === patientId,
    );
    return of(appointments);
  }

  getAppointmentsByDoctorId(doctorId: number): Observable<Appointment[]> {
    const appointments = this.mockAppointments.filter(
      (a) => a.doctorId === doctorId,
    );
    return of(appointments);
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
