// doctor-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DoctorDataService, Appointment, Patient, Consultation, Invoice } from '../../services/doctor-data.service';
import { DoctorTaskListComponent } from "./doctor-task-list/doctor-task-list.component";

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DoctorTaskListComponent],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css']
})
export class DoctorDashboardComponent implements OnInit {
  doctor: any;
  showTasks = false;
  appointments: Appointment[] = [];
  appointmentFilterDate = '';
  appointmentFilterStatus = '';
  patientSearchQuery = '';
  searchResults: Patient[] = [];
  selectedPatient: Patient | null = null;
  showPatientProfile = false;
  consultations: Consultation[] = [];
  invoices: Invoice[] = [];
  selectedConsultation: Consultation | null = null;
  showEMRModal = false;

  doctors = [ { id: 'shrayash', fullName: 'Dr. Shrayash Desai', photoUrl: 'assets/images/shrayash.jpg', role: 'Cardiologist', specialization: 'Cardiology', experience: '12 years', memberSince: '2018' },  ];

  constructor(private doctorService: DoctorDataService) {}

  ngOnInit(): void {
    this.doctorService.doctor$.subscribe(data => {
      this.doctor = data; // 🔑 updates automatically when profile changes
    });
    this.doctorService.appointments$.subscribe(data => {
      this.appointments = data;
    });
    this.consultations = this.doctorService.getConsultations();
    this.invoices = this.doctorService.getInvoices();
  }

  get filteredAppointments() {
    return this.appointments.filter(appointment => {
      const dateMatch = !this.appointmentFilterDate || appointment.date === this.appointmentFilterDate;
      const statusMatch = !this.appointmentFilterStatus || appointment.status === this.appointmentFilterStatus;
      return dateMatch && statusMatch;
    });
  }

  completeAppointment(id: number) {
    this.doctorService.completeAppointment(id);
  }

  cancelAppointment(id: number) {
    this.doctorService.cancelAppointment(id);
  }

  searchPatients() {
    if (this.patientSearchQuery.trim()) {
      this.searchResults = this.doctorService.searchPatients(this.patientSearchQuery);
    } else {
      this.searchResults = [];
    }
  }

  viewPatientProfile(patient: Patient) {
    this.selectedPatient = { ...patient };
    this.showPatientProfile = true;
  }

  closePatientProfile() {
    this.showPatientProfile = false;
    this.selectedPatient = null;
  }

  updatePatientProfile() {
    if (this.selectedPatient) {
      this.doctorService.updatePatient(this.selectedPatient);
      this.closePatientProfile();
    }
  }

  viewEMR(consultation: Consultation) {
    this.selectedConsultation = consultation;
    this.showEMRModal = true;
  }

  closeEMRModal() {
    this.showEMRModal = false;
    this.selectedConsultation = null;
  }

  addDiagnosis() {
    // Placeholder for adding diagnosis functionality
    alert('Add Diagnosis functionality would be implemented here');
  }

  uploadPrescription() {
    // Placeholder for uploading prescription functionality
    alert('Upload Prescription functionality would be implemented here');
  }

  viewInvoice(invoice: Invoice) {
    // Placeholder for viewing invoice functionality
    alert(`Viewing invoice ${invoice.id} for ${invoice.patientName}`);
  }
}
