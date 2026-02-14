import { Injectable } from '@angular/core';
import { Observable, combineLatest, map, forkJoin } from 'rxjs';
import { DashboardMetrics } from '../models/dashboard-metrics.interface';
import { PatientService } from './patient.service';
import { AppointmentService } from './appointment.service';
import { BillingService } from './billing.service';
import { DoctorService } from './doctor.service';
import { HttpClient } from '@angular/common/http';
import { ADMIN_API_ENDPOINTS } from '../constants/api/api-endpoints';

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
  constructor(
    private patientService: PatientService,
    private appointmentService: AppointmentService,
    private billingService: BillingService,
    private doctorService: DoctorService,
    private http: HttpClient,
  ) {}

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
    return this.billingService.getAllInvoices().pipe(
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
    return this.appointmentService.getAllAppointments().pipe(
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
    return this.billingService.getAllInvoices().pipe(
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
    return this.billingService.getAllInvoices().pipe(
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

  /**
   * Mark an invoice as paid
   * @param invoiceId The invoice ID (GUID)
   */
  markInvoiceAsPaid(invoiceId: string): Observable<any> {
    return this.http.put(ADMIN_API_ENDPOINTS.markInvoiceAsPaid(invoiceId), {});
  }
}
