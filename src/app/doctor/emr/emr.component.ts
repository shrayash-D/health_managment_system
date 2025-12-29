import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileSidebarComponent } from '../profile-sidebar/profile-sidebar.component';
import { DoctorDataService, Consultation, Patient } from '../../services/doctor-data.service';
import { Subscription } from 'rxjs';

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
  imports: [CommonModule, FormsModule, ProfileSidebarComponent],
})
export class EmrComponent implements OnInit, OnDestroy {
  consultations: EMRConsultation[] = [];
  patients: Patient[] = [];
  private subscriptions: Subscription = new Subscription();

  selectedConsultation: EMRConsultation | null = null;
  showEMRModal = false;
  sidebarCollapsed = false;

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
    this.showEMRModal = true;
  }

  closeEMRModal() {
    this.showEMRModal = false;
    this.selectedConsultation = null;
  }

  onSidebarCollapse(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
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
          this.selectedConsultation.prescriptionImage = reader.result as string;
          // Note: In a real app, you'd upload this to a server and store the URL
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
