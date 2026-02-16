import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { DoctorDataService } from '../../services/doctor-data.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css'],
  imports: [CommonModule, NgChartsModule]
})
export class DoctorDashboardComponent implements OnInit {

  doctorName: string = 'Doctor';
  currentDoctorId: string = ''; // Store current doctor ID for filtering
  
  totalPatients: number = 0;
  isLoadingPatients: boolean = false;
  
  todayAppointments: any[] = [];
  todayPatients: any[] = [];
  isLoadingAppointments: boolean = false;
  totalTodayAppointments: number = 0;
  totalTodayPatients: number = 0;

  totalAppointments: number = 0; // Total appointments for the doctor (all dates)
  isLoadingTotalAppointments: boolean = false;

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

  constructor(
    private doctorDataService: DoctorDataService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Always load all data when component initializes (on refresh, sidebar navigation, etc)
    this.loadAllData();
  }

  /**
   * Load all dashboard data - called on every ngOnInit
   */
  private loadAllData(): void {
    console.log('Loading all dashboard data...');
    this.generateCalendar();
    
    // Load doctor profile first to get the currentDoctorId
    // Then load all other data that depends on currentDoctorId
    this.loadDoctorName();
  }

  /**
   * Load doctor name for welcome message from database
   */
  private loadDoctorName(): void {
    // Get userId from AuthService (stored in localStorage after login)
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedUser) {
      try {
        const currentUser = JSON.parse(storedUser);
        console.log('Current user from localStorage:', currentUser);
        
        if (currentUser && currentUser.id) {
          // Fetch doctor data from database using the user ID
          this.doctorDataService.getDoctorById(currentUser.id).subscribe({
            next: (response) => {
              console.log('Doctor response from API:', response);
              
              // Store the current doctor ID for validation
              this.currentDoctorId = response.id;
              console.log('Current doctor ID stored:', this.currentDoctorId);
              
              if (response && response.user && response.user.name) {
                this.doctorName = response.user.name;
                console.log('Doctor name successfully fetched from DB:', this.doctorName);
              }
              
              // NOW load all other data that depends on currentDoctorId
              console.log('Doctor ID set, now loading other data...');
              this.loadTotalPatients();
              this.loadTodayAppointments();
              this.loadNextAppointments();
              this.loadTotalAppointments();
            },
            error: (error) => {
              console.error('Error fetching doctor name from DB:', error);
              // Fallback: Use name from localStorage if available
              if (currentUser.name) {
                this.doctorName = currentUser.name;
                console.log('Using fallback doctor name from auth:', this.doctorName);
              }
              // Still try to load other data even if doctor fetch fails
              this.loadTotalPatients();
              this.loadTodayAppointments();
              this.loadNextAppointments();
            }
          });
        } else {
          console.warn('No user ID available in localStorage');
        }
      } catch (error) {
        console.error('Error parsing currentUser from localStorage:', error);
      }
    } else {
      console.warn('No currentUser in localStorage');
    }
  }

  /**
   * Load total number of patients assigned to the current doctor
   */
  private loadTotalPatients(): void {
    this.isLoadingPatients = true;
    
    // Get userId from localStorage (stored during login)
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedUser) {
      try {
        const currentUser = JSON.parse(storedUser);
        console.log('Current user from localStorage:', currentUser);
        
        if (currentUser && currentUser.id) {
          // First fetch doctor profile to get the doctorId
          this.doctorDataService.getDoctorById(currentUser.id).subscribe({
            next: (doctorResponse) => {
              console.log('Doctor response for getting doctorId:', doctorResponse);
              
              if (doctorResponse && doctorResponse.id) {
                // Now use the doctorId to get patients
                this.doctorDataService.getPatientsByDoctorId(doctorResponse.id).subscribe({
                  next: (response) => {
                    this.totalPatients = response.totalPatients || 0;
                    console.log('Total patients loaded:', this.totalPatients);
                    this.isLoadingPatients = false;
                  },
                  error: (error) => {
                    console.error('Error loading total patients:', error);
                    this.isLoadingPatients = false;
                    this.totalPatients = 0;
                  }
                });
              } else {
                console.warn('No doctorId in response');
                this.isLoadingPatients = false;
                this.totalPatients = 0;
              }
            },
            error: (error) => {
              console.error('Error fetching doctor profile for patients:', error);
              this.isLoadingPatients = false;
              this.totalPatients = 0;
            }
          });
        } else {
          console.warn('No user ID available in localStorage');
          this.isLoadingPatients = false;
          this.totalPatients = 0;
        }
      } catch (error) {
        console.error('Error parsing currentUser from localStorage:', error);
        this.isLoadingPatients = false;
        this.totalPatients = 0;
      }
    } else {
      console.warn('No currentUser in localStorage');
      this.isLoadingPatients = false;
      this.totalPatients = 0;
    }
  }

  /**
   * Load today's appointments for the current doctor
   * Fetches ALL appointments for the doctor and filters by today's date client-side
   */
  private loadTodayAppointments(): void {
    this.isLoadingAppointments = true;
    this.todayAppointments = []; // Clear previous data
    this.todayPatients = [];
    console.log('Starting to load today appointments for doctor:', this.currentDoctorId);
    
    // Fetch ALL appointments for the current doctor using /api/Doctor/appointments/{doctorId}
    this.doctorDataService.getAllAppointmentsByDoctorId(this.currentDoctorId).subscribe({
      next: (response) => {
        console.log('All appointments API response for doctor:', response);
        
        // Check if response and appointments exist
        if (!response || !response.appointments) {
          console.warn('No appointments in response');
          this.totalTodayAppointments = 0;
          this.totalTodayPatients = 0;
          this.isLoadingAppointments = false;
          return;
        }
        
        console.log(`Total appointments count in response: ${response.appointments.length}`);
        
        // Get today's date for filtering
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Filter appointments to only show those for TODAY
        const todaysAppointments = response.appointments.filter((apt: any) => {
          const appointmentDate = new Date(apt.appointmentDate);
          appointmentDate.setHours(0, 0, 0, 0);
          return appointmentDate.getTime() === today.getTime();
        });
        
        console.log('Filtered appointments for today:', todaysAppointments);
        
        // Map appointments for display
        this.todayAppointments = todaysAppointments.map((apt: any) => ({
          name: apt.patientName,
          diagnosis: apt.reason,
          status: apt.startTime,
          id: apt.id,
          patientId: apt.patientId,
          startTime: apt.startTime,
          endTime: apt.endTime,
          appointmentStatus: apt.status === 1 ? 'Completed' : 'Scheduled'
        }));

        this.totalTodayAppointments = todaysAppointments.length || 0;
        console.log('Total today appointments after filtering:', this.totalTodayAppointments);

        // Extract unique patients from today's appointments
        const uniquePatients = new Map<string, any>();
        todaysAppointments.forEach((apt: any) => {
          if (!uniquePatients.has(apt.patientId)) {
            uniquePatients.set(apt.patientId, {
              patientId: apt.patientId,
              patientName: apt.patientName,
              appointmentCount: 1,
              appointments: [apt]
            });
          } else {
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
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Full error:', error);
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
   * Fetches ALL appointments for the doctor and finds the next scheduled one
   */
  private loadNextAppointments(): void {
    this.isLoadingNextAppointment = true;
    this.nextPatient = null; // Clear previous data
    console.log('Starting to load next appointment for doctor:', this.currentDoctorId);
    
    // Fetch ALL appointments for the current doctor using /api/Doctor/appointments/{doctorId}
    this.doctorDataService.getAllAppointmentsByDoctorId(this.currentDoctorId).subscribe({
      next: (response: any) => {
        console.log('All appointments API response for next:', response);
        
        if (!response || !response.appointments || response.appointments.length === 0) {
          console.log('No appointments in response');
          this.nextPatient = null;
          this.isLoadingNextAppointment = false;
          return;
        }
        
        // Filter for scheduled appointments (status === 0) and sort by appointment date
        const scheduledAppointments = response.appointments
          .filter((apt: any) => {
            const isScheduled = apt.status === 0;
            console.log(`Appointment: ${apt.patientName}, Status: ${apt.status}, IsScheduled: ${isScheduled}`);
            return isScheduled;
          })
          .sort((a: any, b: any) => {
            // Sort by appointment date first, then by start time
            const dateA = new Date(a.appointmentDate);
            const dateB = new Date(b.appointmentDate);
            if (dateA.getTime() !== dateB.getTime()) {
              return dateA.getTime() - dateB.getTime();
            }
            return a.startTime.localeCompare(b.startTime);
          });
        
        console.log('Scheduled appointments for current doctor:', scheduledAppointments);
        
        if (scheduledAppointments.length > 0) {
          // Get the first scheduled appointment (earliest date/time)
          const nextApt = scheduledAppointments[0];
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
          console.log('Next patient set:', this.nextPatient);
        } else {
          console.log('No scheduled appointments found for current doctor');
          this.nextPatient = null;
        }
        
        console.log('Next appointment loaded:', this.nextPatient);
        this.isLoadingNextAppointment = false;
      },
      error: (err: any) => {
        console.error('Error loading next appointments:', err);
        this.isLoadingNextAppointment = false;
        this.nextPatient = null;
        this.totalNextAppointments = 0;
      }
    });
  }

  /**
   * Load total appointments for the current doctor (all dates combined)
   * Fetches ALL appointments for the doctor to get the total count
   */
  private loadTotalAppointments(): void {
    this.isLoadingTotalAppointments = true;
    console.log('Starting to load total appointments for doctor:', this.currentDoctorId);
    
    // Fetch ALL appointments for the current doctor
    this.doctorDataService.getAllAppointmentsByDoctorId(this.currentDoctorId).subscribe({
      next: (response) => {
        console.log('All appointments API response:', response);
        
        if (!response || !response.appointments) {
          console.warn('No appointments in response');
          this.totalAppointments = 0;
          this.isLoadingTotalAppointments = false;
          return;
        }
        
        // Get total count of all appointments
        this.totalAppointments = response.totalAppointments || response.appointments.length || 0;
        console.log('Total appointments loaded:', this.totalAppointments);
        this.isLoadingTotalAppointments = false;
      },
      error: (error) => {
        console.error('Error loading total appointments:', error);
        this.isLoadingTotalAppointments = false;
        this.totalAppointments = 0;
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
