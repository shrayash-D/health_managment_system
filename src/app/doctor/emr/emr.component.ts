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
  prescriptionImage?: string;
  id: number;
  patientId: number;
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

  constructor(private doctorService: DoctorDataService) {}

  ngOnInit() {
    this.subscriptions.add(
      this.doctorService.consultations$.subscribe(consultations => {
        this.consultations = consultations.map(c => ({
          ...c,
          previousDiagnosis: undefined,
          prescriptionImage: undefined
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

    // Load stored prescription image if available
    const storedImage = localStorage.getItem(`prescription-${consultation.id}`);
    if (storedImage) {
      this.selectedConsultation.prescriptionImage = storedImage;
    }

    this.showEMRModal = true;
  }

  closeEMRModal() {
    this.showEMRModal = false;
    this.selectedConsultation = null;
  }

  downloadEmrPDF() {
    if (!this.selectedConsultation) {
      alert('No consultation selected');
      return;
    }

    const emr = this.selectedConsultation;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Electronic Medical Record', 10, 10);

    doc.setFontSize(12);
    doc.text(`Patient: ${emr.patientName}`, 10, 30);
    doc.text(`Date: ${emr.date}`, 10, 40);
    doc.text(`Diagnosis: ${emr.diagnosis}`, 10, 50);

    if (emr.previousDiagnosis) {
      doc.text(`Previous Diagnosis: ${emr.previousDiagnosis}`, 10, 60);
    }

    // Prescriptions
    if (emr.prescriptions?.length) {
      doc.text('Prescriptions:', 10, 80);
      emr.prescriptions.forEach((p: string, i: number) => {
        doc.text(`- ${p}`, 20, 90 + i * 10);
      });
    }

    // Lab Results
    if (emr.labResults?.length) {
      const startY = 100 + (emr.prescriptions?.length || 0) * 10;
      doc.text('Lab Results:', 10, startY);
      emr.labResults.forEach((r: string, i: number) => {
        doc.text(`- ${r}`, 20, startY + 10 + i * 10);
      });
    }

    // Prescription Image from localStorage
    const storedImage = localStorage.getItem(`prescription-${emr.id}`);
    if (storedImage) {
      doc.addImage(storedImage, 'JPEG', 10, 180, 80, 80); // adjust size/position
    }

    doc.save(`EMR_${emr.patientName}.pdf`);
  }

  startAddDiagnosis() {
    this.addingDiagnosis = true;
  }

  saveDiagnosis() {
    if (this.selectedConsultation && this.newDiagnosis.trim()) {
      this.selectedConsultation.previousDiagnosis =
        this.selectedConsultation.diagnosis;
      this.selectedConsultation.diagnosis = this.newDiagnosis.trim();

      // Update the consultation in the service
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

  // Handle prescription image upload
  onPrescriptionUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        if (this.selectedConsultation) {
          const base64Image = reader.result as string;
          this.selectedConsultation.prescriptionImage = base64Image;

          // Save to localStorage
          localStorage.setItem(`prescription-${this.selectedConsultation.id}`, base64Image);
        }
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  uploadPrescription() {
    const fileInput = document.getElementById(
      'prescriptionInput'
    ) as HTMLInputElement;
    fileInput.click();
  }
}
