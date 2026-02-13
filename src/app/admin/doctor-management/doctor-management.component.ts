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
  showEditModal: boolean = false;
  showAccountModal: boolean = false;
  selectedDoctor: Doctor | null = null;
  selectedDoctorUser: User | null = null;

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

  openEditModal(doctor: Doctor): void {
    this.selectedDoctor = { ...doctor };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedDoctor = null;
  }

  openAccountModal(doctor: Doctor): void {
    this.selectedDoctor = doctor;
    // Try to find existing user account
    this.userService
      .getUserByEntityId(doctor.id, 'DOCTOR')
      .subscribe((user) => {
        if (user) {
          this.selectedDoctorUser = { ...user };
        } else {
          this.selectedDoctorUser = {
            id: 0,
            username: '',
            password: '',
            role: 'DOCTOR',
            email: doctor.user?.email || doctor.email || '',
            name: doctor.user?.name || doctor.name || '',
          };
        }
        this.showAccountModal = true;
      });
  }

  closeAccountModal(): void {
    this.showAccountModal = false;
    this.selectedDoctor = null;
    this.selectedDoctorUser = null;
  }

  updateDoctor(): void {
    if (this.selectedDoctor) {
      this.doctorService
        .updateDoctor(this.selectedDoctor.id, this.selectedDoctor)
        .subscribe(() => {
          this.loadDoctors();
          this.closeEditModal();
        });
    }
  }

  saveAccount(): void {
    if (this.selectedDoctor && this.selectedDoctorUser) {
      if (this.selectedDoctorUser.id === 0) {
        // Create new account
        this.selectedDoctorUser.name =
          this.selectedDoctor.user?.name || this.selectedDoctor.name || '';
        this.selectedDoctorUser.email =
          this.selectedDoctor.user?.email || this.selectedDoctor.email || '';
        this.userService.createUser(this.selectedDoctorUser).subscribe(() => {
          this.closeAccountModal();
        });
      } else {
        // Update existing account
        this.userService
          .updateUser(this.selectedDoctorUser.id, this.selectedDoctorUser)
          .subscribe(() => {
            this.closeAccountModal();
          });
      }
    }
  }

  resetPassword(): void {
    if (this.selectedDoctorUser && this.selectedDoctorUser.id) {
      const newPassword = prompt('Enter new password:');
      if (newPassword) {
        this.userService
          .resetPassword(this.selectedDoctorUser.id, newPassword)
          .subscribe(() => {
            alert('Password reset successfully');
          });
      }
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
