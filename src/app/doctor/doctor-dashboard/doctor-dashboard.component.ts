import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Appointment } from'../../services/doctor-data.service';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { ProfileSidebarComponent } from "../profile-sidebar/profile-sidebar.component";

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css'],
  imports: [CommonModule, NgChartsModule, ProfileSidebarComponent]
})
export class DoctorDashboardComponent implements OnInit {
  sidebarCollapsed = false;

  appointments: Appointment[] = [];
  invoices: any[] = [];

  pieChartData: ChartData<'pie'> = {
    labels: ['New Patients', 'Old Patients'],
    datasets: [
      {
        data: [120, 80],
        backgroundColor: ['#007bff', '#28a745']
      }
    ]
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  todayAppointments = [
    { name: 'M.J. Mical', diagnosis: 'Health Checkup', status: 'On Going' },
    { name: 'Sanath Deo', diagnosis: 'Health Checkup', status: '12:30 PM' },
    { name: 'Loeara Phanj', diagnosis: 'Report', status: '01:00 PM' },
    { name: 'Komola Haris', diagnosis: 'Common Cold', status: '01:30 PM' }
  ];

  nextPatient = {
    name: 'Sanath Deo',
    diagnosis: 'Health Checkup',
    id: '0220092200005',
    dob: '15 Jan 1989',
    sex: 'Male',
    weight: '59 Kg',
    height: '172 cm',
    lastAppointment: '15 Dec 2021',
    history: ['Asthma', 'Hypertension', 'Fever'],
    contact: '(088) 555-0102'
  };

  onSidebarCollapse(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
  }

  ngOnInit(): void {
    // Initialization logic if needed
  }

  calculateAge(dob: string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}
