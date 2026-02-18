import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import {
  PatientDashboardApiResponse,
  AppointmentStatus,
  PaymentStatus,
  MedicationActivity,
} from '../models/patient-dashboard.interface';
import {
  Vital,
  Appointment,
  Medication,
  LabResult,
  BillingSummary,
  Invoice,
} from '../models/patient-dashboard.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PatientDashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get patient data by user ID
   */
  getPatientByUserId(userId: string): Observable<PatientDashboardApiResponse> {
    return this.http.get<PatientDashboardApiResponse>(
      `${this.apiUrl}/Patient/${userId}?isUserId=true`,
    );
  }

  /**
   * Get patient data by patient ID
   */
  getPatientDashboardData(
    patientId: string,
  ): Observable<PatientDashboardApiResponse> {
    return this.http.get<PatientDashboardApiResponse>(
      `${this.apiUrl}/Patient/${patientId}?isUserId=false`,
    );
  }

  /**
   * Transform API vitals data to dashboard format
   */
  transformVitals(apiResponse: PatientDashboardApiResponse): Vital[] {
    const latestAppointment = apiResponse.appointments?.[0];
    const vitals = latestAppointment?.vitals;

    if (!vitals) {
      return [];
    }

    return [
      { id: 'bp', label: 'BP', value: vitals.bloodPressure, unit: 'mmHg' },
      {
        id: 'hr',
        label: 'HR',
        value: vitals.heartRate.toString(),
        unit: 'bpm',
      },
      {
        id: 'temp',
        label: 'Temp',
        value: vitals.temperature.toString(),
        unit: '°F',
      },
      { id: 'spo2', label: 'SpO2', value: vitals.spO2.toString(), unit: '%' },
    ];
  }

  /**
   * Transform API appointments data
   */
  transformAppointments(
    apiResponse: PatientDashboardApiResponse,
  ): Appointment[] {
    return apiResponse.appointments.map((appt) => ({
      id: appt.id,
      date: new Date(appt.appointmentDate),
      reason: appt.reason || 'General Consultation',
      status: this.getAppointmentStatusText(appt.status) as any,
    }));
  }

  /**
   * Transform API medications data
   */
  transformMedications(apiResponse: PatientDashboardApiResponse): Medication[] {
    const medications: Medication[] = [];

    apiResponse.appointments.forEach((appt) => {
      appt.medications?.forEach((med) => {
        medications.push({
          id: med.id,
          drug: med.drug,
          dose: med.dose,
          route: med.route,
          frequency: med.frequency,
          status: this.getMedicationStatusText(med.activity) as any,
          appointmentDate: new Date(appt.appointmentDate),
          appointmentReason: appt.reason || 'General Consultation',
        });
      });
    });

    return medications;
  }

  /**
   * Transform API lab results (diagnosis)
   */
  transformLabResults(apiResponse: PatientDashboardApiResponse): LabResult[] {
    return apiResponse.appointments
      .filter((appt) => appt.diagnosis)
      .map((appt) => ({
        id: appt.diagnosis!.id,
        title: `Diagnosis - ${new Date(appt.appointmentDate).toLocaleDateString()}`,
        note: appt.diagnosis?.diagnosisDetails || 'No details available',
        status: (appt.status === AppointmentStatus.Completed
          ? 'Completed'
          : 'Pending') as any,
      }));
  }

  /**
   * Calculate billing summary
   */
  transformBillingSummary(
    apiResponse: PatientDashboardApiResponse,
  ): BillingSummary[] {
    const invoices = apiResponse.appointments
      .filter((appt) => appt.invoice)
      .map((appt) => appt.invoice!);

    const totalBilled = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaid = invoices
      .filter((inv) => inv.status === PaymentStatus.Paid)
      .reduce((sum, inv) => sum + inv.total, 0);
    const totalOutstanding = invoices
      .filter(
        (inv) =>
          inv.status === PaymentStatus.Unpaid ||
          inv.status === PaymentStatus.Overdue,
      )
      .reduce((sum, inv) => sum + (inv.outstanding || inv.total), 0);

    return [
      { label: 'Total Billed', value: totalBilled },
      { label: 'Paid', value: totalPaid },
      { label: 'Outstanding', value: totalOutstanding },
    ];
  }

  /**
   * Transform invoices
   */
  transformInvoices(apiResponse: PatientDashboardApiResponse): Invoice[] {
    return apiResponse.appointments
      .filter((appt) => appt.invoice)
      .map((appt, index) => ({
        id: appt.invoice!.id,
        number: `INV-${String(index + 1).padStart(4, '0')}`,
        amount: appt.invoice!.total,
        status: this.getPaymentStatusText(appt.invoice!.status) as any,
      }));
  }

  /**
   * Helper: Get appointment status text
   */
  private getAppointmentStatusText(status: number): string {
    switch (status) {
      case AppointmentStatus.Scheduled:
        return 'Scheduled';
      case AppointmentStatus.Completed:
        return 'Completed';
      case AppointmentStatus.Cancelled:
        return 'Cancelled';
      case AppointmentStatus.Rescheduled:
        return 'Rescheduled';
      default:
        return 'Unknown';
    }
  }

  /**
   * Helper: Get medication status text
   */
  private getMedicationStatusText(activity: number): string {
    switch (activity) {
      case MedicationActivity.Active:
        return 'Active';
      case MedicationActivity.Completed:
        return 'Completed';
      case MedicationActivity.OnHold:
        return 'On Hold';
      case MedicationActivity.Pending:
        return 'Pending';
      default:
        return 'Unknown';
    }
  }

  /**
   * Helper: Get payment status text
   */
  private getPaymentStatusText(status: number): string {
    switch (status) {
      case PaymentStatus.Unpaid:
        return 'Unpaid';
      case PaymentStatus.Paid:
        return 'Paid';
      case PaymentStatus.Overdue:
        return 'Overdue';
      case PaymentStatus.Pending:
        return 'Pending';
      default:
        return 'Unknown';
    }
  }

  // Keep old methods for backward compatibility (will be removed once component is updated)
  getVitals(): Observable<Vital[]> {
    return of([]);
  }

  getAppointments(): Observable<Appointment[]> {
    return of([]);
  }

  getMedications(): Observable<Medication[]> {
    return of([]);
  }

  getLabs(): Observable<LabResult[]> {
    return of([]);
  }

  getBillingSummary(): Observable<BillingSummary[]> {
    return of([]);
  }

  getInvoices(): Observable<Invoice[]> {
    return of([]);
  }

  /**
   * Mark invoice as paid
   */
  markInvoiceAsPaid(invoiceId: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/Admin/invoices/mark-paid/${invoiceId}`,
      {},
    );
  }
}
