import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { DoctorDataService } from '../../services/doctor-data.service';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css'],
  imports: [CommonModule, NgChartsModule]
})
export class DoctorDashboardComponent implements OnInit {

  doctorName: string = 'Doctor';
  
  totalPatients: number = 0;
  isLoadingPatients: boolean = false;
  
  todayAppointments: any[] = [];
  todayPatients: any[] = [];
  isLoadingAppointments: boolean = false;
  totalTodayAppointments: number = 0;
  totalTodayPatients: number = 0;

  nextAppointments: any[] = [];
  isLoadingNextAppointment: boolean = false;
  totalNextAppointments: number = 0;
  
  private _today: Date = new Date();
  todayDate: number = this._today.getDate();
  todayYear: number = this._today.getFullYear();

 
  

  nextPatient: any = null;

  // Calendar state
  currentMonth: string = '';
  currentYear: number = 0;
  days: number[] = [];

  // Current month index for navigation
  currentMonthIndex: number = new Date().getMonth();

  constructor(private doctorDataService: DoctorDataService) {}

  ngOnInit(): void {
    this.loadDoctorName();
    this.generateCalendar();
    this.loadTotalPatients();
    this.loadTodayAppointments();
    this.loadNextAppointments();
  }

  /**
   * Load doctor name for welcome message from database
   */
  private loadDoctorName(): void {
    const doctor = this.doctorDataService.getDoctor();
    console.log('Current doctor from service:', doctor);
    
    if (doctor && doctor.userId) {
      // Fetch from database using the user ID
      this.doctorDataService.getDoctorById(doctor.userId).subscribe({
        next: (response) => {
          console.log('Doctor response from API:', response);
          if (response && response.user && response.user.name) {
            this.doctorName = response.user.name;
            console.log('Doctor name successfully fetched from DB:', this.doctorName);
          }
        },
        error: (error) => {
          console.error('Error fetching doctor name from DB:', error);
          // Fallback to local doctor data if API fails
          if (doctor.doctorName) {
            this.doctorName = doctor.doctorName;
            console.log('Using fallback doctor name:', this.doctorName);
          }
        }
      });
    } else {
      console.warn('No doctor userId available, doctor object:', doctor);
    }
  }

  /**
   * Load total number of patients assigned to the current doctor
   */
  private loadTotalPatients(): void {
    this.isLoadingPatients = true;
    this.doctorDataService.getPatientsByDoctor().subscribe({
      next: (response) => {
        this.totalPatients = response.totalPatients;
        console.log('Total patients loaded:', this.totalPatients);
        this.isLoadingPatients = false;
      },
      error: (error) => {
        console.error('Error loading total patients:', error);
        this.isLoadingPatients = false;
        this.totalPatients = 0; // Set default value on error
      }
    });
  }

  /**
   * Load today's appointments for the current doctor
   */
  private loadTodayAppointments(): void {
    this.isLoadingAppointments = true;
    console.log('Starting to load today appointments...');
    
    this.doctorDataService.getTodayAppointments().subscribe({
      next: (response) => {
        console.log('Today appointments API response:', response);
        
        // Set total appointments count
        this.totalTodayAppointments = response.totalAppointments || 0;
        console.log('Total today appointments set to:', this.totalTodayAppointments);
        
        // Map appointments for display
        this.todayAppointments = response.appointments.map(apt => ({
          name: apt.patientName,
          diagnosis: apt.reason,
          status: apt.startTime, // Display the start time as status
          id: apt.id,
          patientId: apt.patientId,
          startTime: apt.startTime,
          endTime: apt.endTime,
          appointmentStatus: apt.status === 1 ? 'Completed' : 'Scheduled'
        }));

        // Extract unique patients from today's appointments
        const uniquePatients = new Map<string, any>();
        response.appointments.forEach(apt => {
          if (!uniquePatients.has(apt.patientId)) {
            uniquePatients.set(apt.patientId, {
              patientId: apt.patientId,
              patientName: apt.patientName,
              appointmentCount: 1,
              appointments: [apt]
            });
          } else {
            // Increment appointment count for existing patient
            const patient = uniquePatients.get(apt.patientId)!;
            patient.appointmentCount++;
            patient.appointments.push(apt);
          }
        });

        // Convert map to array
        this.todayPatients = Array.from(uniquePatients.values());
        this.totalTodayPatients = this.todayPatients.length;

        console.log('Today appointments loaded:', this.todayAppointments);
        console.log('Today unique patients:', this.todayPatients);
        console.log(`Total unique patients today: ${this.totalTodayPatients}`);
        console.log(`Total appointments today: ${this.totalTodayAppointments}`);
        this.isLoadingAppointments = false;
      },
      error: (error) => {
        console.error('Error loading today appointments:', error);
        this.isLoadingAppointments = false;
        this.todayAppointments = [];
        this.todayPatients = [];
        this.totalTodayAppointments = 0;
        this.totalTodayPatients = 0;
      }
    });
  }

  /**
   * Load next upcoming appointment for the current doctor
   * Uses the today's appointments API and filters for scheduled (not completed) appointments
   */
  private loadNextAppointments(): void {
    this.isLoadingNextAppointment = true;
    // Use the same API as today's appointments, but filter for the next scheduled one
    this.doctorDataService.getTodayAppointments().subscribe({
      next: (response) => {
        this.totalNextAppointments = response.totalAppointments;
        if (response.appointments && response.appointments.length > 0) {
          // Filter for scheduled appointments (status === 0) - these are the upcoming ones
          const scheduledAppointments = response.appointments.filter(apt => apt.status === 0);
          const appointmentToDisplay = scheduledAppointments.length > 0 
            ? scheduledAppointments[0]  // Get the first scheduled appointment (earliest time)
            : null; // No scheduled appointments
          
          if (appointmentToDisplay) {
            const nextApt = appointmentToDisplay;
            this.nextPatient = {
              name: nextApt.patientName,
              diagnosis: nextApt.reason,
              id: nextApt.patientId,
              startTime: nextApt.startTime,
              endTime: nextApt.endTime,
              appointmentDate: nextApt.appointmentDate,
              appointmentStatus: nextApt.status === 1 ? 'Completed' : 'Scheduled',
              time: `${nextApt.startTime.substring(0, 5)} - ${nextApt.endTime.substring(0, 5)}`
            };
          } else {
            this.nextPatient = null;
          }
        } else {
          this.nextPatient = null;
        }
        console.log('Next appointment loaded:', this.nextPatient);
        this.isLoadingNextAppointment = false;
      },
      error: (error) => {
        console.error('Error loading next appointments:', error);
        this.isLoadingNextAppointment = false;
        this.nextPatient = null;
        this.totalNextAppointments = 0;
      }
    });
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
