import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../services/doctor.service';
import { AdminService } from '../../services/admin.service';
import { Doctor } from '../../models/doctor.interface';
import { Observable, take } from 'rxjs';

@Component({
  selector: 'app-doctor-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-management.component.html',
  styleUrl: './doctor-management.component.css',
})
export class DoctorManagementComponent implements OnInit {
  doctors$!: Observable<Doctor[]>;
  searchTerm: string = '';

  constructor(
    private doctorService: DoctorService,
    private adminService: AdminService,
  ) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.doctors$ = this.doctorService.getAllDoctors();
  }

  resetPassword(doctor: Doctor): void {
    const doctorName = doctor.user?.name || doctor.name || 'Doctor';
    const newPassword = prompt(`Enter new password for Dr. ${doctorName}:`);

    if (newPassword && newPassword.trim()) {
      // Use the user ID from the doctor object
      const userId = doctor.user?.id || doctor.userId;

      if (userId) {
        this.adminService.updateUserPassword(userId, newPassword).subscribe({
          next: () => {
            alert('Password updated successfully!');
          },
          error: (error) => {
            console.error('Password update error:', error);
            alert('Failed to update password. Please try again.');
          },
        });
      } else {
        alert('Unable to find user ID for this doctor.');
      }
    }
  }

  deleteDoctor(doctor: Doctor): void {
    const doctorName = doctor.user?.name || doctor.name || 'this doctor';

    if (
      confirm(
        `Are you sure you want to delete ${doctorName}? This action cannot be undone.`,
      )
    ) {
      // Use the user ID from the doctor object
      const userId = doctor.user?.id || doctor.userId;

      if (userId) {
        this.doctorService.deleteDoctor(userId).subscribe({
          next: () => {
            alert('Doctor deleted successfully!');
            this.loadDoctors();
          },
          error: (error) => {
            console.error('Delete error:', error);
            alert('Failed to delete doctor. Please try again.');
          },
        });
      } else {
        alert('Unable to find user ID for this doctor.');
      }
    }
  }

  getFilteredDoctors(doctors: Doctor[]): Doctor[] {
    if (!this.searchTerm) return doctors;
    const term = this.searchTerm.toLowerCase();
    return doctors.filter((d) => {
      const name = d.user?.name || d.name || '';
      const email = d.user?.email || d.email || '';
      return (
        name.toLowerCase().includes(term) ||
        d.specialization.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term)
      );
    });
  }
}
