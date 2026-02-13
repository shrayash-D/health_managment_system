import { Injectable } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';
import {
  DashboardMetrics,
  ActivityItem,
} from '../models/dashboard-metrics.interface';
import { PatientService } from './patient.service';
import { AppointmentService } from './appointment.service';
import { BillingService } from './billing.service';
import { DoctorService } from './doctor.service';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(
    private patientService: PatientService,
    private appointmentService: AppointmentService,
    private billingService: BillingService,
    private doctorService: DoctorService,
  ) {}

  getDashboardMetrics(): Observable<DashboardMetrics> {
    return combineLatest([
      this.patientService.getAllPatients(),
      this.appointmentService.getAllAppointments(),
      this.billingService.getAllInvoices(),
      this.doctorService.getAllDoctors(),
    ]).pipe(
      map(([patients, appointments, invoices, doctors]) => {
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = appointments.filter((a) => a.date === today);
        const pendingAppointments = appointments.filter(
          (a) => a.status === 'BOOKED',
        );
        const pendingInvoices = invoices.filter(
          (i) => i.paymentStatus === 'UNPAID',
        );
        const todayInvoices = invoices.filter((i) => i.date === today);

        const totalRevenue = invoices
          .filter((i) => i.paymentStatus === 'PAID')
          .reduce((sum, inv) => sum + inv.amount, 0);

        const todayRevenue = todayInvoices
          .filter((i) => i.paymentStatus === 'PAID')
          .reduce((sum, inv) => sum + inv.amount, 0);

        const pendingPayments = pendingInvoices.reduce(
          (sum, inv) => sum + inv.amount,
          0,
        );

        const recentActivity: ActivityItem[] = [
          {
            id: 1,
            type: 'PATIENT_REGISTERED',
            description: 'New patient registered: Emily Davis',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            userId: 4,
            userName: 'Emily Davis',
          },
          {
            id: 2,
            type: 'APPOINTMENT_CREATED',
            description:
              'Appointment created for John Doe with Dr. Sarah Johnson',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            userId: 1,
            userName: 'John Doe',
          },
          {
            id: 3,
            type: 'PAYMENT_RECEIVED',
            description: 'Payment received for invoice INV-10018 - ₹2,050',
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            userId: 2,
            userName: 'Jane Smith',
          },
          {
            id: 4,
            type: 'APPOINTMENT_COMPLETED',
            description: 'Appointment completed for Robert Williams',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            userId: 3,
            userName: 'Robert Williams',
          },
          {
            id: 5,
            type: 'INVOICE_GENERATED',
            description: 'Invoice generated for Emily Davis - ₹3,200',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            userId: 4,
            userName: 'Emily Davis',
          },
        ];

        return {
          totalPatients: patients.length,
          totalAppointments: appointments.length,
          todayAppointments: todayAppointments.length,
          pendingAppointments: pendingAppointments.length,
          totalRevenue,
          todayRevenue,
          pendingPayments,
          activeDoctors: doctors.length,
          recentActivity,
        };
      }),
    );
  }

  getRevenueData(): Observable<{ labels: string[]; data: number[] }> {
    return this.billingService.getAllInvoices().pipe(
      map((invoices) => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toISOString().split('T')[0];
        });

        // Dummy revenue data for last 7 days (in rupees)
        const dummyRevenueData = [
          8500, 12000, 9500, 15000, 11000, 18000, 14000,
        ];

        // Combine actual data with dummy data
        const revenueByDay = last7Days.map((day, index) => {
          const actualRevenue = invoices
            .filter((inv) => inv.date === day && inv.paymentStatus === 'PAID')
            .reduce((sum, inv) => sum + inv.amount, 0);

          // Use dummy data if actual revenue is 0, otherwise add to actual
          return actualRevenue > 0
            ? actualRevenue + dummyRevenueData[index]
            : dummyRevenueData[index];
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
    return combineLatest([
      this.doctorService.getAllDoctors(),
      this.appointmentService.getAllAppointments(),
    ]).pipe(
      map(([doctors, appointments]) => {
        const doctorAppointments = doctors.map((doctor) => {
          return appointments.filter((apt) => apt.doctorId == doctor.id).length; // Use == for loose equality
        });

        return {
          labels: doctors.map((d) => {
            const name = d.user?.name || d.name || 'Unknown';
            return name.split(' ').pop() || name;
          }),
          data: doctorAppointments,
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

        // Dummy monthly revenue data (in rupees) - showing growth trend
        const dummyMonthlyData = [85000, 92000, 105000, 118000, 132000, 145000];

        // Combine actual data with dummy data
        const revenueByMonth = last6Months.map((month, index) => {
          const actualRevenue = invoices
            .filter(
              (inv) =>
                inv.date.startsWith(month) && inv.paymentStatus === 'PAID',
            )
            .reduce((sum, inv) => sum + inv.amount, 0);

          // Use dummy data if actual revenue is 0, otherwise add to actual
          return actualRevenue > 0
            ? actualRevenue + dummyMonthlyData[index]
            : dummyMonthlyData[index];
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
}
