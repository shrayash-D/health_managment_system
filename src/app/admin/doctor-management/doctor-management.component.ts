import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../services/doctor.service';
import { UserService } from '../../services/user.service';
import { Doctor } from '../../models/doctor.interface';
import { User } from '../../models/user.interface';
import { Observable, combineLatest, map } from 'rxjs';

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
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.doctors$ = this.doctorService.getAllDoctors();
  }

  resetPassword(doctorId: number | string, doctorName: string): void {
    const newPassword = prompt(`Enter new password for Dr. ${doctorName}:`);
    if (newPassword && newPassword.trim()) {
      // Find user by doctor ID and reset password
      this.userService
        .getUserByEntityId(Number(doctorId), 'DOCTOR')
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
            alert('No user account found for this doctor.');
          }
        });
    }
  }

  deleteDoctor(id: number | string): void {
    if (confirm('Are you sure you want to delete this doctor?')) {
      this.doctorService.deleteDoctor(id).subscribe(() => {
        this.loadDoctors();
      });
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
        (d.department && d.department.toLowerCase().includes(term)) ||
        email.toLowerCase().includes(term)
      );
    });
  }
}
