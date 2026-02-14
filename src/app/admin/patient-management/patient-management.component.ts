import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { AdminService } from '../../services/admin.service';
import { Patient } from '../../models/patient.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-patient-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-management.component.html',
  styleUrl: './patient-management.component.css',
})
export class PatientManagementComponent implements OnInit {
  patients$!: Observable<Patient[]>;
  searchTerm: string = '';

  constructor(
    private patientService: PatientService,
    private adminService: AdminService,
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patients$ = this.patientService.getAllPatients();
  }

  resetPassword(patient: Patient): void {
    const newPassword = prompt(`Enter new password for ${patient.name}:`);
    if (newPassword && newPassword.trim()) {
      const userId = patient.userId;
      if (userId) {
        this.adminService.updateUserPassword(userId, newPassword).subscribe({
          next: () => {
            alert('Password reset successfully');
          },
          error: (error) => {
            alert('Failed to reset password. Please try again.');
            console.error('Password reset error:', error);
          },
        });
      } else {
        alert('Unable to reset password: User ID not found');
      }
    }
  }

  deletePatient(patient: Patient): void {
    if (confirm('Are you sure you want to delete this patient?')) {
      const userId = patient.userId;
      if (userId) {
        this.patientService.deletePatient(userId).subscribe({
          next: () => {
            alert('Patient deleted successfully');
            this.loadPatients();
          },
          error: (error) => {
            alert('Failed to delete patient. Please try again.');
            console.error('Delete patient error:', error);
          },
        });
      } else {
        alert('Unable to delete patient: User ID not found');
      }
    }
  }

  getFilteredPatients(patients: Patient[]): Patient[] {
    if (!this.searchTerm) return patients;
    const term = this.searchTerm.toLowerCase();
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.contactInfo.toLowerCase().includes(term) ||
        (p.bloodGroup && p.bloodGroup.toLowerCase().includes(term)),
    );
  }
}
