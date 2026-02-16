import { Injectable } from '@angular/core';
import { Observable, combineLatest, map, forkJoin, of } from 'rxjs';
import { DashboardMetrics } from '../models/dashboard-metrics.interface';
import { HttpClient } from '@angular/common/http';
import {
  ADMIN_API_ENDPOINTS,
  APPOINTMENT_API_ENDPOINTS,
} from '../constants/api/api-endpoints';
import { catchError } from 'rxjs/operators';

// Import models
import { Patient, PatientListApiResponse } from '../models/patient.interface';
import { Doctor } from '../models/doctor.interface';
import {
  Appointment,
  AppointmentApiResponse,
} from '../models/appointment.interface';
import { Invoice, AllInvoicesResponse } from '../models/invoice.interface';

// Interface for pending invoices API response
interface PendingInvoiceResponse {
  totalCount: number;
  invoices: Array<{
    id: string;
    appointmentId: string;
    patientId: string;
    issuedDate: string;
    status: number;
    consultationType: string;
    consulationFee: number;
    labFee: number;
    medicineFee: number;
    total: number;
    outstanding: number | null;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private http: HttpClient) {}

  // ==========================================
  // ADMIN CRUD METHODS - PATIENTS
  // ==========================================

  /**
   * Get all patients (Admin only)
   */
  getAllPatients(): Observable<Patient[]> {
    return this.http
      .get<PatientListApiResponse[]>(ADMIN_API_ENDPOINTS.getAllPatients)
      .pipe(
        map((apiPatients) =>
          apiPatients.map((apiPatient) => ({
            id: parseInt(apiPatient.id) || 0,
            userId: apiPatient.userId, // Keep the original userId for delete operations
            name: apiPatient.user?.name || 'Unknown',
            contactInfo: apiPatient.user?.phoneNumber || 'N/A',
            dob: apiPatient.user?.dob
              ? new Date(apiPatient.user.dob).toISOString().split('T')[0]
              : 'N/A',
            bloodGroup: apiPatient.bloodGroup || 'Unknown',
            allergies: [], // Not provided by API
            primaryPhysician: apiPatient.doctor?.user?.name || 'Not Assigned',
            medicalHistory: apiPatient.address || undefined,
          })),
        ),
      );
  }

  /**
   * Delete patient by user ID
   */
  deletePatient(userId: string): Observable<boolean> {
    return this.http
      .delete<void>(ADMIN_API_ENDPOINTS.deletePatient(userId))
      .pipe(map(() => true));
  }

  // ==========================================
  // ADMIN CRUD METHODS - DOCTORS
  // ==========================================

  /**
   * Get all doctors
   */
  getAllDoctors(): Observable<Doctor[]> {
    return this.http.get<any[]>(ADMIN_API_ENDPOINTS.getAllDoctors).pipe(
      map((response) => {
        // API returns an array directly
        return response.map((apiDoctor: any) => ({
          id: apiDoctor.id,
          userId: apiDoctor.userId,
          specialization: apiDoctor.specialization || 'Not specified',
          yearsOfExperience: apiDoctor.yearsOfExperience || 0,
          memberSince: apiDoctor.memberSince || undefined,
          bio: apiDoctor.bio || '',
          user: {
            id: apiDoctor.user.id,
            name: apiDoctor.user.name,
            email: apiDoctor.user.email,
            phoneNumber: apiDoctor.user.phoneNumber,
          },
        }));
      }),
      catchError((error) => {
        console.error('Error fetching doctors:', error);
        return of([]); // Return empty array on error
      }),
    );
  }

  /**
   * Delete doctor by user ID
   */
  deleteDoctor(userId: string): Observable<any> {
    return this.http.delete(ADMIN_API_ENDPOINTS.deleteDoctor(userId));
  }

  // ==========================================
  // ADMIN CRUD METHODS - APPOINTMENTS
  // ==========================================

  /**
   * Get all appointments
   */
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
              doctorId: apiApt.doctorId, // Keep as string GUID for matching
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

  /**
   * Cancel appointment
   */
  cancelAppointment(appointmentId: string): Observable<boolean> {
    return this.http
      .put<void>(APPOINTMENT_API_ENDPOINTS.cancelAppointment(appointmentId), {})
      .pipe(map(() => true));
  }

  // ==========================================
  // ADMIN CRUD METHODS - INVOICES
  // ==========================================

  /**
   * Get all invoices
   */
  getAllInvoices(): Observable<Invoice[]> {
    return this.http
      .get<AllInvoicesResponse>(ADMIN_API_ENDPOINTS.getAllInvoices)
      .pipe(
        map((response) =>
          response.invoices.map((apiInvoice) => {
            // Map status number to string: 0=UNPAID, 1=PAID
            const statusMap: { [key: number]: 'PAID' | 'UNPAID' } = {
              0: 'UNPAID',
              1: 'PAID',
            };

            return {
              id: parseInt(apiInvoice.id) || 0,
              apiId: apiInvoice.id, // Store the actual GUID for API calls
              invoiceNumber: apiInvoice.id, // Show the actual ID
              patientId: parseInt(apiInvoice.patientId) || 0,
              amount: apiInvoice.total,
              paymentStatus: statusMap[apiInvoice.status] || 'UNPAID',
              date: apiInvoice.issuedDate
                ? new Date(apiInvoice.issuedDate).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
              description: apiInvoice.consultationType || 'Consultation',
              // patientName will be populated by the component
            };
          }),
        ),
      );
  }

  /**
   * Mark invoice as paid
   */
  markInvoiceAsPaid(invoiceId: string): Observable<any> {
    return this.http.put(ADMIN_API_ENDPOINTS.markInvoiceAsPaid(invoiceId), {});
  }

  // ==========================================
  // API METHODS FOR DASHBOARD METRICS
  // ==========================================

  /**
   * Get total number of patients
   */
  getTotalPatients(): Observable<number> {
    return this.http
      .get<{ totalPatients: number }>(ADMIN_API_ENDPOINTS.getTotalPatients)
      .pipe(map((response) => response.totalPatients));
  }

  /**
   * Get total and today's appointments count
   */
  getTotalAppointments(): Observable<{
    totalAppointments: number;
    todaysAppointments: number;
  }> {
    return this.http.get<{
      totalAppointments: number;
      todaysAppointments: number;
    }>(ADMIN_API_ENDPOINTS.getTotalAppointments);
  }

  /**
   * Get pending appointments
   */
  getPendingAppointmentsCount(): Observable<number> {
    return this.http
      .get<any[]>(ADMIN_API_ENDPOINTS.getPendingAppointments)
      .pipe(map((appointments) => appointments.length));
  }

  /**
   * Get total revenue (paid invoices) for all time and today
   */
  getTotalRevenue(): Observable<{
    totalAmount: number;
    todaysAmount: number;
  }> {
    return this.http.get<{
      totalAmount: number;
      todaysAmount: number;
    }>(ADMIN_API_ENDPOINTS.getTotalRevenue);
  }

  /**
   * Get pending payments (unpaid invoices)
   */
  getPendingPayments(): Observable<number> {
    return this.http
      .get<PendingInvoiceResponse>(ADMIN_API_ENDPOINTS.getPendingInvoices)
      .pipe(
        map((response) =>
          response.invoices.reduce((sum, invoice) => sum + invoice.total, 0),
        ),
      );
  }

  /**
   * Get total number of doctors (active doctors)
   */
  getActiveDoctors(): Observable<number> {
    return this.http
      .get<{ totalDoctors: number }>(ADMIN_API_ENDPOINTS.getTotalDoctors)
      .pipe(map((response) => response.totalDoctors));
  }

  /**
   * Get complete dashboard metrics using real API calls
   */
  getDashboardMetrics(): Observable<DashboardMetrics> {
    return forkJoin({
      totalPatients: this.getTotalPatients(),
      appointmentData: this.getTotalAppointments(),
      pendingAppointments: this.getPendingAppointmentsCount(),
      revenueData: this.getTotalRevenue(),
      pendingPayments: this.getPendingPayments(),
      activeDoctors: this.getActiveDoctors(),
    }).pipe(
      map((data) => {
        return {
          totalPatients: data.totalPatients,
          totalAppointments: data.appointmentData.totalAppointments,
          todayAppointments: data.appointmentData.todaysAppointments,
          pendingAppointments: data.pendingAppointments,
          totalRevenue: data.revenueData.totalAmount,
          todayRevenue: data.revenueData.todaysAmount,
          pendingPayments: data.pendingPayments,
          activeDoctors: data.activeDoctors,
        };
      }),
    );
  }

  // ==========================================
  // CHART DATA METHODS
  // ==========================================

  getRevenueData(): Observable<{ labels: string[]; data: number[] }> {
    return this.getAllInvoices().pipe(
      map((invoices) => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toISOString().split('T')[0];
        });

        const revenueByDay = last7Days.map((day) => {
          const actualRevenue = invoices
            .filter((inv) => inv.date === day && inv.paymentStatus === 'PAID')
            .reduce((sum, inv) => sum + inv.amount, 0);

          return actualRevenue;
        });

        return {
          labels: last7Days.map((day) => {
            const date = new Date(day);
            return date.toLocaleDateString('en-US', { weekday: 'short' });
          }),
          data: revenueByDay,
        };
      }),
    );
  }

  getAppointmentStatusData(): Observable<{ labels: string[]; data: number[] }> {
    return this.getAllAppointments().pipe(
      map((appointments) => {
        const booked = appointments.filter((a) => a.status === 'BOOKED').length;
        const completed = appointments.filter(
          (a) => a.status === 'COMPLETED',
        ).length;
        const cancelled = appointments.filter(
          (a) => a.status === 'CANCELLED',
        ).length;

        return {
          labels: ['Booked', 'Completed', 'Cancelled'],
          data: [booked, completed, cancelled],
        };
      }),
    );
  }

  getPaymentStatusData(): Observable<{ labels: string[]; data: number[] }> {
    return this.getAllInvoices().pipe(
      map((invoices) => {
        const paid = invoices.filter((i) => i.paymentStatus === 'PAID').length;
        const unpaid = invoices.filter(
          (i) => i.paymentStatus === 'UNPAID',
        ).length;

        return {
          labels: ['Paid', 'Unpaid'],
          data: [paid, unpaid],
        };
      }),
    );
  }

  getDoctorWorkloadData(): Observable<{ labels: string[]; data: number[] }> {
    return this.http
      .get<{
        doctors: Array<{
          doctorId: string;
          doctorName: string;
          totalAppointments: number;
          completedAppointments: number;
          pendingAppointments: number;
          cancelledAppointments: number;
          averageAppointmentsPerDay: number;
          lastAppointmentDate: string | null;
        }>;
        totalCount: number;
      }>(ADMIN_API_ENDPOINTS.getDoctorWorkload)
      .pipe(
        map((response) => {
          return {
            labels: response.doctors.map((d) => {
              // Extract last name from full name
              const nameParts = d.doctorName.split(' ');
              return nameParts[nameParts.length - 1];
            }),
            data: response.doctors.map((d) => d.totalAppointments),
          };
        }),
      );
  }

  getMonthlyRevenueData(): Observable<{ labels: string[]; data: number[] }> {
    return this.getAllInvoices().pipe(
      map((invoices) => {
        const last6Months = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (5 - i));
          return date.toISOString().slice(0, 7); // YYYY-MM format
        });

        const revenueByMonth = last6Months.map((month) => {
          const actualRevenue = invoices
            .filter(
              (inv) =>
                inv.date.startsWith(month) && inv.paymentStatus === 'PAID',
            )
            .reduce((sum, inv) => sum + inv.amount, 0);

          return actualRevenue;
        });

        return {
          labels: last6Months.map((month) => {
            const date = new Date(month + '-01');
            return date.toLocaleDateString('en-US', { month: 'short' });
          }),
          data: revenueByMonth,
        };
      }),
    );
  }

  // ==========================================
  // USER MANAGEMENT METHODS
  // ==========================================

  /**
   * Update user password by admin
   * @param userId The user ID (GUID)
   * @param newPassword The new password
   */
  updateUserPassword(userId: string, newPassword: string): Observable<any> {
    return this.http.put(ADMIN_API_ENDPOINTS.updateUserPassword(userId), {
      newPassword: newPassword,
    });
  }
}
