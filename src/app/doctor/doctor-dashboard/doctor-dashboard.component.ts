import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Appointment } from '../../services/doctor-data.service';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css'],
  imports: [CommonModule, NgChartsModule]
})
export class DoctorDashboardComponent implements OnInit {
  sidebarCollapsed = false;

  appointments: Appointment[] = [];
  invoices: any[] = [];
  private _today: Date = new Date();
  todayDate: number = this._today.getDate();
   todayMonthIndex: number = new Date().getMonth();
  todayYear: number = new Date().getFullYear();

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

  // Calendar state
  currentMonth: string = '';
  currentYear: number = 0;
  days: number[] = [];

 
 

  // Current month index for navigation
  currentMonthIndex: number = new Date().getMonth();

  ngOnInit(): void {
    this.generateCalendar();
  }

  onSidebarCollapse(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
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

  private generateCalendar(): void {
    this.currentYear = new Date().getFullYear();
    this.currentMonth = new Date(this.currentYear, this.currentMonthIndex)
      .toLocaleString('default', { month: 'long' });

    const daysInMonth = new Date(this.currentYear, this.currentMonthIndex + 1, 0).getDate();
    this.days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  goToPreviousMonth(): void {
    this.currentMonthIndex--;
    if (this.currentMonthIndex < 0) {
      this.currentMonthIndex = 11;
      this.currentYear--;
    }
    this.updateMonth();
  }

  goToNextMonth(): void {
    this.currentMonthIndex++;
    if (this.currentMonthIndex > 11) {
      this.currentMonthIndex = 0;
      this.currentYear++;
    }
    this.updateMonth();
  }

  private updateMonth(): void {
    this.currentMonth = new Date(this.currentYear, this.currentMonthIndex)
      .toLocaleString('default', { month: 'long' });

    const daysInMonth = new Date(this.currentYear, this.currentMonthIndex + 1, 0).getDate();
    this.days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }
  

  isToday(day: number): boolean {
    return (
      day === this.todayDate &&
      this.currentMonthIndex === this._today.getMonth() &&
      this.currentYear === this._today.getFullYear()
    );
  }

}
