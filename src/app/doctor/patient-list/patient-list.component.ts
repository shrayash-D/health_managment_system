import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { DoctorDataService } from '../../services/doctor-data.service';
import { Patient } from '../../models/patient.interface';
import { Observable } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LoadingComponent } from '../../shared/loading/loading.component';

// Interface for appointment details from API
export interface AppointmentDetail {
  id: string;
  doctorId: string;
  patientId: string;
  slotId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: number;
  reason: string;
  patientName: string;
  vitals?: {
    id: string;
    appointmentId: string;
    patientId: string;
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    spO2: number;
  };
  medications?: Array<{
    id: string;
    appointmentId: string;
    patientId: string;
    drug: string;
    dose: string;
    route: string;
    frequency: string;
    activity: number;
  }>;
  invoice?: any;
  diagnosis?: {
    id: string;
    appointmentId: string;
    patientId: string;
    diagnosisDetails: string;
  };
}

// Extended Patient interface with appointments
export interface PatientWithAppointments {
  id: string;
  userId: string;
  doctorId: string;
  bloodGroup: string;
  address: string | null;
  profileImage: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    dob: string;
  };
  doctor?: any | null;
  appointments?: AppointmentDetail[];
}

@Component({
  selector: 'app-patient-management',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.css'],
})
export class PatientListComponent implements OnInit {
  patientsWithAppointments: PatientWithAppointments[] = [];
  searchTerm: string = '';
  showHistoryModal: boolean = false;
  selectedPatient: PatientWithAppointments | null = null;
  isLoading: boolean = true;

  constructor(
    private patientService: PatientService,
    private doctorDataService: DoctorDataService,
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;
    this.doctorDataService.getPatientsByDoctor().subscribe({
      next: (response: any) => {
        this.patientsWithAppointments = response.patients || [];
        console.log(
          'Patients loaded with appointments:',
          this.patientsWithAppointments,
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.isLoading = false;
      },
    });
  }

  openHistoryModal(patient: PatientWithAppointments): void {
    this.selectedPatient = patient;
    this.showHistoryModal = true;
  }

  closeHistoryModal(): void {
    this.showHistoryModal = false;
    this.selectedPatient = null;
  }

  getFilteredPatients(
    patients: PatientWithAppointments[],
  ): PatientWithAppointments[] {
    if (!this.searchTerm) return patients;
    const term = this.searchTerm.toLowerCase();
    return patients.filter(
      (p) =>
        p.user?.name?.toLowerCase().includes(term) ||
        p.user?.phoneNumber?.toLowerCase().includes(term) ||
        (p.bloodGroup && p.bloodGroup.toLowerCase().includes(term)),
    );
  }

  formatContact(contact: string): string {
    if (!contact) return '';
    // Remove all non-digit characters
    const digits = contact.replace(/\D/g, '');
    // If it starts with 91, format as +91 XXXXX XXXXX
    if (digits.startsWith('91') && digits.length === 12) {
      return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
    }
    // If it's 10 digits, assume Indian mobile, add +91
    if (digits.length === 10) {
      return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    // Otherwise, return as is
    return contact;
  }

  /**
   * Format date to "Mon DD YYYY" format (e.g., "Jan 2 2026")
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const monthShort = date.toLocaleString('en-US', { month: 'short' });
      const day = date.getDate();
      const year = date.getFullYear();
      return `${monthShort} ${day} ${year}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString;
    }
  }

  /**
   * Format appointment status
   * 0 = Scheduled, 1 = Completed, 2 = Cancelled
   */
  getAppointmentStatus(status: number): string {
    switch (status) {
      case 0:
        return 'Scheduled';
      case 1:
        return 'Completed';
      case 2:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get status badge class for appointment
   */
  getStatusClass(status: number): string {
    switch (status) {
      case 0:
        return 'status-scheduled';
      case 1:
        return 'status-completed';
      case 2:
        return 'status-cancelled';
      default:
        return 'status-unknown';
    }
  }

  /**
   * Get appointment status counts for a patient
   * Returns { scheduled: number, completed: number, cancelled: number }
   */
  getAppointmentCounts(appointments: AppointmentDetail[] | undefined) {
    const counts = {
      scheduled: 0,
      completed: 0,
      cancelled: 0,
    };

    if (!appointments || appointments.length === 0) {
      return counts;
    }

    appointments.forEach((apt) => {
      if (apt.status === 0) {
        counts.scheduled++;
      } else if (apt.status === 1) {
        counts.completed++;
      } else if (apt.status === 2) {
        counts.cancelled++;
      }
    });

    return counts;
  }

  downloadHistory(): void {
    if (!this.selectedPatient) return;
    const patient = this.selectedPatient;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Helper functions
    const drawSectionHeader = (title: string, y: number) => {
      doc.setFillColor(240, 248, 255);
      doc.rect(20, y - 5, pageWidth - 40, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(8, 71, 113);
      doc.text(title, 25, y);
      doc.setTextColor(0, 0, 0);
      return y + 10;
    };

    const drawField = (
      label: string,
      value: string,
      x: number,
      y: number,
      maxWidth?: number,
    ) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(label + ':', x, y);
      doc.setFont('helvetica', 'normal');
      const labelWidth = doc.getTextWidth(label + ': ') + 2; // Add 2pt spacing

      if (maxWidth) {
        const lines = doc.splitTextToSize(value, maxWidth);
        doc.text(lines, x + labelWidth, y);
        return lines.length * 5;
      } else {
        doc.text(value, x + labelWidth, y);
        return 0;
      }
    };

    const addPageFooter = (pageNum: number, totalPages: number) => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text(
        'Confidential Medical Record - For Authorized Use Only',
        pageWidth / 2,
        pageHeight - 20,
        { align: 'center' },
      );
      doc.text(
        `Generated on: ${new Date().toLocaleString('en-US')}`,
        pageWidth / 2,
        pageHeight - 15,
        { align: 'center' },
      );
      doc.text(
        `Page ${pageNum} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' },
      );
    };

    // Document Title
    doc.setTextColor(8, 71, 113);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Patient Medical History', pageWidth / 2, yPosition, {
      align: 'center',
    });

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, yPosition + 4, pageWidth - 20, yPosition + 4);

    yPosition = 32;
    doc.setTextColor(0, 0, 0);

    // Patient Demographics
    yPosition = drawSectionHeader('Patient Demographics', yPosition);

    const patientName = patient.user?.name || 'N/A';

    drawField('Patient Name', patientName, 25, yPosition);
    yPosition += 7;

    drawField('Date of Birth', patient.user?.dob || 'N/A', 25, yPosition);
    yPosition += 7;

    drawField(
      'Blood Group',
      patient.bloodGroup || 'Not specified',
      25,
      yPosition,
    );
    yPosition += 7;

    drawField(
      'Contact Number',
      this.formatContact(patient.user?.phoneNumber || ''),
      25,
      yPosition,
    );
    yPosition += 12;

    // Appointments and Medical Records
    if (patient.appointments && patient.appointments.length > 0) {
      yPosition = drawSectionHeader('Medical Consultation Records', yPosition);

      patient.appointments.forEach((appointment, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 70) {
          addPageFooter(1, 1);
          doc.addPage();
          yPosition = 20;
        }

        // Appointment header
        doc.setFillColor(250, 250, 250);
        doc.rect(20, yPosition - 2, pageWidth - 40, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(8, 71, 113);
        doc.text(`Appointment ${index + 1}`, 25, yPosition + 3);
        doc.setTextColor(0, 0, 0);
        yPosition += 12;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        drawField(
          'Date',
          new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          25,
          yPosition,
        );
        yPosition += 7;

        drawField(
          'Time',
          `${appointment.startTime} - ${appointment.endTime}`,
          25,
          yPosition,
        );
        yPosition += 7;

        const reasonExtra = drawField(
          'Reason for Visit',
          appointment.reason,
          25,
          yPosition,
          pageWidth - 55,
        );
        yPosition += 7 + reasonExtra;

        // Diagnosis
        if (appointment.diagnosis) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text('Diagnosis:', 25, yPosition);
          yPosition += 6;
          doc.setFont('helvetica', 'normal');
          const diagnosisLines = doc.splitTextToSize(
            appointment.diagnosis.diagnosisDetails,
            pageWidth - 55,
          );
          doc.text(diagnosisLines, 30, yPosition);
          yPosition += diagnosisLines.length * 5 + 6;
        }

        // Vitals
        if (appointment.vitals) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text('Vital Signs:', 25, yPosition);
          yPosition += 5;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);

          // Blood Pressure
          doc.setFont('helvetica', 'bold');
          doc.text('BP:', 30, yPosition);
          doc.setFont('helvetica', 'normal');
          doc.text(`${appointment.vitals.bloodPressure} mmHg`, 40, yPosition);

          // Heart Rate
          doc.setFont('helvetica', 'bold');
          doc.text('HR:', 95, yPosition);
          doc.setFont('helvetica', 'normal');
          doc.text(`${appointment.vitals.heartRate} bpm`, 105, yPosition);
          yPosition += 4;

          // Temperature
          doc.setFont('helvetica', 'bold');
          doc.text('Temp:', 30, yPosition);
          doc.setFont('helvetica', 'normal');
          doc.text(`${appointment.vitals.temperature}°F`, 45, yPosition);

          // SpO2
          doc.setFont('helvetica', 'bold');
          doc.text('SpO2:', 95, yPosition);
          doc.setFont('helvetica', 'normal');
          doc.text(`${appointment.vitals.spO2}%`, 110, yPosition);
          yPosition += 6;
          doc.setFontSize(10);
        }

        // Medications
        if (appointment.medications && appointment.medications.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text('Medications Prescribed:', 25, yPosition);
          yPosition += 6;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          appointment.medications.forEach((med, index) => {
            doc.setFont('helvetica', 'bold');
            doc.text(`${index + 1}. ${med.drug}`, 30, yPosition);
            yPosition += 4.5;
            doc.setFont('helvetica', 'normal');
            doc.text(
              `   Dosage: ${med.dose}  |  Route: ${med.route}  |  Frequency: ${med.frequency}`,
              30,
              yPosition,
            );
            yPosition += 5.5;
          });
          yPosition += 3;
          doc.setFontSize(10);
        }

        // Separator line
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        doc.line(25, yPosition + 3, pageWidth - 25, yPosition + 3);
        yPosition += 10;
      });
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.text('No appointment records found for this patient.', 25, yPosition);
    }

    // Add footer to last page
    addPageFooter(1, 1);

    const fileName = `${patientName.replace(/\s+/g, '_')}_Medical_History_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }
}
