import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { DoctorDataService } from '../../services/doctor-data.service';
import { Patient } from '../../models/patient.interface';
import { Observable } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  imports: [CommonModule, FormsModule],
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
        console.log('Patients loaded with appointments:', this.patientsWithAppointments);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.isLoading = false;
      }
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

  getFilteredPatients(patients: PatientWithAppointments[]): PatientWithAppointments[] {
    if (!this.searchTerm) return patients;
    const term = this.searchTerm.toLowerCase();
    return patients.filter(
      (p) =>
        p.user?.name?.toLowerCase().includes(term) ||
        p.user?.phoneNumber?.toLowerCase().includes(term) ||
        (p.bloodGroup && p.bloodGroup.toLowerCase().includes(term))
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

  downloadHistory(): void {
    if (!this.selectedPatient) return;
    const patient = this.selectedPatient;
    const doc = new jsPDF();
    let yPosition = 20;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Medical History Report', 20, yPosition);
    yPosition += 15;

    // Patient Details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Patient: `, 20, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.text(`${patient.user?.name || 'N/A'}`, 60, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    doc.text(`Date of Birth: `, 20, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.text(`${patient.user?.dob || 'N/A'}`, 60, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    doc.text(`Contact: `, 20, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.text(`${this.formatContact(patient.user?.phoneNumber || '')}`, 60, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    doc.text(`Blood Group: `, 20, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.text(`${patient.bloodGroup || 'Not specified'}`, 60, yPosition);
    yPosition += 12;

    // Appointments Section
    if (patient.appointments && patient.appointments.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Appointments and Medical Details:', 20, yPosition);
      yPosition += 10;

      patient.appointments.forEach((appointment, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`Appointment ${index + 1}:`, 20, yPosition);
        yPosition += 6;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${appointment.appointmentDate}`, 25, yPosition);
        yPosition += 5;
        doc.text(`Time: ${appointment.startTime} - ${appointment.endTime}`, 25, yPosition);
        yPosition += 5;
        doc.text(`Reason: ${appointment.reason}`, 25, yPosition);
        yPosition += 7;

        // Diagnosis
        if (appointment.diagnosis) {
          doc.setFont('helvetica', 'bold');
          doc.text('Diagnosis:', 25, yPosition);
          yPosition += 5;
          doc.setFont('helvetica', 'normal');
          doc.text(`${appointment.diagnosis.diagnosisDetails}`, 30, yPosition);
          yPosition += 7;
        }

        // Vitals
        if (appointment.vitals) {
          doc.setFont('helvetica', 'bold');
          doc.text('Vitals:', 25, yPosition);
          yPosition += 5;
          doc.setFont('helvetica', 'normal');
          doc.text(`Blood Pressure: ${appointment.vitals.bloodPressure}`, 30, yPosition);
          yPosition += 4;
          doc.text(`Heart Rate: ${appointment.vitals.heartRate} bpm`, 30, yPosition);
          yPosition += 4;
          doc.text(`Temperature: ${appointment.vitals.temperature}°F`, 30, yPosition);
          yPosition += 4;
          doc.text(`SpO2: ${appointment.vitals.spO2}%`, 30, yPosition);
          yPosition += 7;
        }

        // Medications
        if (appointment.medications && appointment.medications.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.text('Medications:', 25, yPosition);
          yPosition += 5;
          doc.setFont('helvetica', 'normal');
          appointment.medications.forEach(med => {
            doc.text(`- ${med.drug} ${med.dose} ${med.route} ${med.frequency}`, 30, yPosition);
            yPosition += 4;
          });
          yPosition += 3;
        }
      });
    }

    doc.save(`${patient.user?.name?.replace(/\s+/g, '_') || 'patient'}_medical_history.pdf`);
  }
}
