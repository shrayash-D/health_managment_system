import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorDataService, Consultation, Patient } from '../../services/doctor-data.service';
import { Subscription } from 'rxjs';
import jsPDF from 'jspdf';

interface EMRConsultation {
  patientName: string;
  date: string;
  diagnosis: string;
  previousDiagnosis?: string;
  prescriptions: string[];
  labResults: string[];
  id: number;
  patientId: number;
}

interface NewPrescription {
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

@Component({
  selector: 'app-emr',
  standalone: true,
  templateUrl: './emr.component.html',
  styleUrls: ['./emr.component.css'],
  imports: [CommonModule, FormsModule],
})
export class EmrComponent implements OnInit, OnDestroy {
  consultations: EMRConsultation[] = [];
  patients: Patient[] = [];
  private subscriptions: Subscription = new Subscription();

  selectedConsultation: EMRConsultation | null = null;
  showEMRModal = false;

  addingDiagnosis = false;
  newDiagnosis = '';

  generatingPrescription = false;
  newPrescription: NewPrescription = this.getEmptyPrescription();

  constructor(private doctorService: DoctorDataService) {}

  ngOnInit() {
    this.subscriptions.add(
      this.doctorService.consultations$.subscribe(consultations => {
        this.consultations = consultations.map(c => ({
          ...c,
          previousDiagnosis: undefined
        }));
      })
    );

    this.subscriptions.add(
      this.doctorService.patients$.subscribe(patients => {
        this.patients = patients;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  viewEMR(consultation: EMRConsultation) {
    this.selectedConsultation = { ...consultation };
    this.showEMRModal = true;
  }

  closeEMRModal() {
    this.showEMRModal = false;
    this.selectedConsultation = null;
    this.addingDiagnosis = false;
    this.generatingPrescription = false;
    this.newDiagnosis = '';
    this.newPrescription = this.getEmptyPrescription();
  }

  /* -----------------------------
     Diagnosis Management
  ----------------------------- */
  startAddDiagnosis() {
    this.addingDiagnosis = true;
  }

  saveDiagnosis() {
    if (this.selectedConsultation && this.newDiagnosis.trim()) {
      this.selectedConsultation.previousDiagnosis =
        this.selectedConsultation.diagnosis;
      this.selectedConsultation.diagnosis = this.newDiagnosis.trim();

      const updatedConsultation: Consultation = {
        id: this.selectedConsultation.id,
        patientId: this.selectedConsultation.patientId,
        patientName: this.selectedConsultation.patientName,
        date: this.selectedConsultation.date,
        diagnosis: this.selectedConsultation.diagnosis,
        prescriptions: this.selectedConsultation.prescriptions,
        labResults: this.selectedConsultation.labResults
      };

      this.doctorService.updateConsultation(updatedConsultation);

      this.addingDiagnosis = false;
      this.newDiagnosis = '';
    }
  }

  cancelDiagnosis() {
    this.addingDiagnosis = false;
    this.newDiagnosis = '';
  }

  /* -----------------------------
     Prescription Management
  ----------------------------- */
  startGeneratePrescription() {
    this.generatingPrescription = true;
    this.newPrescription = this.getEmptyPrescription();
  }

  savePrescription() {
    if (this.selectedConsultation) {
      const prescriptionText = `${this.newPrescription.medicine} - ${this.newPrescription.dosage}, ${this.newPrescription.frequency}, for ${this.newPrescription.duration}${this.newPrescription.notes ? ' (' + this.newPrescription.notes + ')' : ''}`;

      this.selectedConsultation.prescriptions.push(prescriptionText);

      const updatedConsultation: Consultation = {
        id: this.selectedConsultation.id,
        patientId: this.selectedConsultation.patientId,
        patientName: this.selectedConsultation.patientName,
        date: this.selectedConsultation.date,
        diagnosis: this.selectedConsultation.diagnosis,
        prescriptions: this.selectedConsultation.prescriptions,
        labResults: this.selectedConsultation.labResults
      };

      this.doctorService.updateConsultation(updatedConsultation);

      this.generatingPrescription = false;
      this.newPrescription = this.getEmptyPrescription();
    }
  }

  cancelPrescription() {
    this.generatingPrescription = false;
    this.newPrescription = this.getEmptyPrescription();
  }

  private getEmptyPrescription(): NewPrescription {
    return {
      medicine: '',
      dosage: '',
      frequency: '',
      duration: '',
      notes: ''
    };
  }


downloadEMRReport(): void {
  if (!this.selectedConsultation) return;

  const consultation = this.selectedConsultation;
  const doc = new jsPDF();

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Electronic Medical Record Report', 20, 20);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');

  // Patient Info
  doc.text(`Patient: `, 20, 40);
  doc.setFont('helvetica', 'bold');
  doc.text(`${consultation.patientName}`, 60, 40);

  doc.setFont('helvetica', 'normal');
  doc.text(`Date: `, 20, 50);
  doc.setFont('helvetica', 'bold');
  doc.text(`${consultation.date}`, 60, 50);

  // Diagnosis
  doc.setFont('helvetica', 'normal');
  doc.text(`Diagnosis: `, 20, 60);
  doc.setFont('helvetica', 'bold');
  doc.text(`${consultation.diagnosis}`, 60, 60);

  if (consultation.previousDiagnosis) {
    doc.setFont('helvetica', 'normal');
    doc.text(`Previous Diagnosis: `, 20, 70);
    doc.setFont('helvetica', 'bold');
    doc.text(`${consultation.previousDiagnosis}`, 80, 70);
  }

  // Prescriptions
  doc.setFont('helvetica', 'normal');
  doc.text(`Prescriptions:`, 20, 85);
  doc.setFont('helvetica', 'bold');
  if (consultation.prescriptions.length > 0) {
    consultation.prescriptions.forEach((p, i) => {
      doc.text(`- ${p}`, 30, 95 + i * 10);
    });
  } else {
    doc.text('None', 30, 95);
  }

  // Lab Results
  const yStart = 95 + (consultation.prescriptions.length > 0 ? consultation.prescriptions.length * 10 : 10) + 10;
  doc.setFont('helvetica', 'normal');
  doc.text(`Lab Results:`, 20, yStart);
  doc.setFont('helvetica', 'bold');
  if (consultation.labResults.length > 0) {
    consultation.labResults.forEach((r, i) => {
      doc.text(`- ${r}`, 30, yStart + 10 + i * 10);
    });
  } else {
    doc.text('None', 30, yStart + 10);
  }

  // Save PDF
  doc.save(`${consultation.patientName}_EMR_Report.pdf`);
}

}
