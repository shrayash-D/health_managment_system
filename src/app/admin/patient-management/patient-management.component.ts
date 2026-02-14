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
  templateUrl: './patient-management.component.html',
  styleUrl: './patient-management.component.css',
})
export class PatientManagementComponent implements OnInit {
  patients$!: Observable<Patient[]>;
  searchTerm: string = '';

  constructor(
    private patientService: PatientService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patients$ = this.patientService.getAllPatients();
  }

  resetPassword(patientId: number, patientName: string): void {
    const newPassword = prompt(`Enter new password for ${patientName}:`);
    if (newPassword && newPassword.trim()) {
      // Find user by patient ID and reset password
      this.userService
        .getUserByEntityId(patientId, 'PATIENT')
        .subscribe((user) => {
          if (user && user.id) {
            this.userService.resetPassword(user.id, newPassword).subscribe(
              () => {
                alert('Password reset successfully');
              },
              (error) => {
                alert('Failed to reset password. Please try again.');
                console.error('Password reset error:', error);
              },
            );
          } else {
            alert('No user account found for this patient.');
          }
        });
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
