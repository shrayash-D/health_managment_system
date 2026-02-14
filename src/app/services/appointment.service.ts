import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  Appointment,
  AppointmentApiResponse,
} from '../models/appointment.interface';
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
    return this.http.get<Doctor[]>(ADMIN_API_ENDPOINTS.getAllDoctors, {
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

  // ==========================================
  // ADMIN API METHODS
  // ==========================================

  getAllAppointments(): Observable<Appointment[]> {
    return this.http
      .get<AppointmentApiResponse[]>(ADMIN_API_ENDPOINTS.getAllAppointments)
      .pipe(
        map((apiAppointments) =>
          apiAppointments.map((apiApt) => {
            // Map status number to string
            const statusMap: {
              [key: number]: 'BOOKED' | 'COMPLETED' | 'CANCELLED';
            } = {
              0: 'BOOKED',
              1: 'COMPLETED',
              2: 'CANCELLED',
            };

            // Format time from TimeSpan (HH:MM:SS) to HH:MM
            const formatTime = (timeSpan: string): string => {
              if (!timeSpan) return 'N/A';
              const parts = timeSpan.split(':');
              return `${parts[0]}:${parts[1]}`;
            };

            return {
              id: parseInt(apiApt.id) || 0,
              appointmentId: apiApt.id, // Keep the original GUID for cancel operations
              patientId: parseInt(apiApt.patientId) || 0,
              doctorId: parseInt(apiApt.doctorId) || 0,
              date: apiApt.appointmentDate
                ? new Date(apiApt.appointmentDate).toISOString().split('T')[0]
                : 'N/A',
              time: formatTime(apiApt.startTime),
              status: statusMap[apiApt.status] || 'BOOKED',
              reason: apiApt.reason || 'No reason provided',
              notes: '',
              // patientName and doctorName will be populated by the component
            };
          }),
        ),
      );
  }

  cancelAppointment(appointmentId: string): Observable<boolean> {
    // The API expects appointmentId (GUID string)
    return this.http
      .put<void>(APPOINTMENT_API_ENDPOINTS.cancelAppointment(appointmentId), {})
      .pipe(map(() => true));
  }
}
