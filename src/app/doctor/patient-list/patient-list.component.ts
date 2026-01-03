import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.interface';
import { Observable } from 'rxjs';

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
  showAddModal: boolean = false;

  newPatient: Patient = {
    id: 0,
    name: '',
    contactInfo: '',
    dob: '',
    medicalHistory: '',
    bloodGroup: '',
    allergies: [],
    primaryPhysician: '',
  };

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patients$ = this.patientService.getAllPatients();
  }

  openAddModal(): void {
    this.newPatient = {
      id: 0,
      name: '',
      contactInfo: '',
      dob: '',
      medicalHistory: '',
      bloodGroup: '',
      allergies: [],
      primaryPhysician: '',
    };
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  addPatient(): void {
    if (
      this.newPatient.name &&
      this.newPatient.contactInfo &&
      this.newPatient.dob
    ) {
      this.patientService.addPatient(this.newPatient).subscribe(() => {
        this.loadPatients();
        this.closeAddModal();
      });
    }
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
}
