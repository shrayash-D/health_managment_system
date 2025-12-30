import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { UserService } from '../../services/user.service';
import { Patient } from '../../models/patient.interface';
import { User } from '../../models/user.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-patient-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.css',
})
export class PatientListComponent implements OnInit {
  patients$!: Observable<Patient[]>;
  searchTerm: string = '';
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  showAccountModal: boolean = false;
  selectedPatient: Patient | null = null;
  selectedPatientUser: User | null = null;

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

  newUser: User = {
    id: 0,
    username: '',
    password: '',
    role: 'PATIENT',
    email: '',
    name: '',
  };

  constructor(
    private patientService: PatientService,
    private userService: UserService
  ) {}

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
    this.newUser = {
      id: 0,
      username: '',
      password: '',
      role: 'PATIENT',
      email: '',
      name: '',
    };
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  openEditModal(patient: Patient): void {
    this.selectedPatient = { ...patient };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedPatient = null;
  }

  openAccountModal(patient: Patient): void {
    this.selectedPatient = patient;
    // Try to find existing user account
    this.userService
      .getUserByEntityId(patient.id, 'PATIENT')
      .subscribe((user) => {
        if (user) {
          this.selectedPatientUser = { ...user };
        } else {
          this.selectedPatientUser = {
            id: 0,
            username: '',
            password: '',
            role: 'PATIENT',
            email: '',
            name: patient.name,
          };
        }
        this.showAccountModal = true;
      });
  }

  closeAccountModal(): void {
    this.showAccountModal = false;
    this.selectedPatient = null;
    this.selectedPatientUser = null;
  }

  addPatient(): void {
    if (
      this.newPatient.name &&
      this.newPatient.contactInfo &&
      this.newPatient.dob
    ) {
      this.patientService.addPatient(this.newPatient).subscribe((patient) => {
        // Create user account if username provided
        if (this.newUser.username) {
          this.newUser.name = patient.name;
          this.userService.createUser(this.newUser).subscribe();
        }
        this.loadPatients();
        this.closeAddModal();
      });
    }
  }

  saveAccount(): void {
    if (this.selectedPatient && this.selectedPatientUser) {
      if (this.selectedPatientUser.id === 0) {
        // Create new account
        this.selectedPatientUser.name = this.selectedPatient.name;
        this.userService.createUser(this.selectedPatientUser).subscribe(() => {
          this.closeAccountModal();
        });
      } else {
        // Update existing account
        this.userService
          .updateUser(this.selectedPatientUser.id, this.selectedPatientUser)
          .subscribe(() => {
            this.closeAccountModal();
          });
      }
    }
  }

  resetPassword(): void {
    if (this.selectedPatientUser && this.selectedPatientUser.id) {
      const newPassword = prompt('Enter new password:');
      if (newPassword) {
        this.userService
          .resetPassword(this.selectedPatientUser.id, newPassword)
          .subscribe(() => {
            alert('Password reset successfully');
          });
      }
    }
  }

  updatePatient(): void {
    if (this.selectedPatient) {
      this.patientService
        .updatePatient(this.selectedPatient.id, this.selectedPatient)
        .subscribe(() => {
          this.loadPatients();
          this.closeEditModal();
        });
    }
  }

  deletePatient(id: number): void {
    if (confirm('Are you sure you want to delete this patient?')) {
      this.patientService.deletePatient(id).subscribe(() => {
        this.loadPatients();
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
