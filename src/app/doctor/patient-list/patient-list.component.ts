import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.interface';
import { Observable } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-patient-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.css'],
})
export class PatientListComponent implements OnInit {
  patients$!: Observable<Patient[]>;
  searchTerm: string = '';
  showHistoryModal: boolean = false;
  selectedPatient: Patient | null = null;

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patients$ = this.patientService.getAllPatients();
  }

  openHistoryModal(patient: Patient): void {
    this.selectedPatient = patient;
    this.showHistoryModal = true;
  }

  closeHistoryModal(): void {
    this.showHistoryModal = false;
    this.selectedPatient = null;
  }

  getFilteredPatients(patients: Patient[]): Patient[] {
    if (!this.searchTerm) return patients;
    const term = this.searchTerm.toLowerCase();
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.contactInfo.toLowerCase().includes(term) ||
        (p.bloodGroup && p.bloodGroup.toLowerCase().includes(term))
    );
  }

  downloadHistory(): void {
    if (!this.selectedPatient) return;
    const patient = this.selectedPatient;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Medical History Report', 20, 20);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    doc.text(`Patient: `, 20, 40);
    doc.setFont('helvetica', 'bold');
    doc.text(`${patient.name}`, 60, 40);

    doc.setFont('helvetica', 'normal');
    doc.text(`Date of Birth: `, 20, 50);
    doc.setFont('helvetica', 'bold');
    doc.text(`${patient.dob}`, 60, 50);

    doc.setFont('helvetica', 'normal');
    doc.text(`Contact: `, 20, 60);
    doc.setFont('helvetica', 'bold');
    doc.text(`${patient.contactInfo}`, 60, 60);

    doc.setFont('helvetica', 'normal');
    doc.text(`Blood Group: `, 20, 70);
    doc.setFont('helvetica', 'bold');
    doc.text(`${patient.bloodGroup || 'Not specified'}`, 60, 70);

    doc.setFont('helvetica', 'normal');
    doc.text(`Medical History:`, 20, 85);
    doc.setFont('helvetica', 'bold');
    const medicalHistory = patient.medicalHistory || 'No medical history available';
    const lines = doc.splitTextToSize(medicalHistory, 120);
    doc.text(lines, 30, 95);

    const yStart = 95 + lines.length * 5 + 10;
    doc.setFont('helvetica', 'normal');
    doc.text(`Allergies:`, 20, yStart);
    doc.setFont('helvetica', 'bold');
    const allergies = patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(', ') : 'No known allergies';
    const allergyLines = doc.splitTextToSize(allergies, 120);
    doc.text(allergyLines, 30, yStart + 10);

    const yStart2 = yStart + 10 + allergyLines.length * 5 + 10;
    doc.setFont('helvetica', 'normal');
    doc.text(`Primary Physician: `, 20, yStart2);
    doc.setFont('helvetica', 'bold');
    doc.text(`${patient.primaryPhysician || 'Not assigned'}`, 70, yStart2);

    doc.save(`${patient.name.replace(/\s+/g, '_')}_medical_history.pdf`);
  }
}
