import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorDataService, Patient } from '../../services/doctor-data.service';
import { ProfileSidebarComponent } from '../profile-sidebar/profile-sidebar.component';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfileSidebarComponent],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.css'
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];
  searchQuery = '';
  sidebarCollapsed = false;
  showEditModal = false;
  selectedPatient: Patient | null = null;

  constructor(private doctorDataService: DoctorDataService) {}

  ngOnInit() {
    this.doctorDataService.patients$.subscribe(patients => {
      this.patients = patients;
    });
  }

  get filteredPatients() {
    if (!this.searchQuery.trim()) {
      return this.patients;
    }
    return this.doctorDataService.searchPatients(this.searchQuery);
  }

  calculateAge(dob: string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  onSidebarCollapse(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
  }
}
