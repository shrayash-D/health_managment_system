import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { Doctor } from '../../models/doctor.interface';
import { DoctorSlot } from '../../models/doctor-slot.interface';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.css'],
})
export class AppointmentFormComponent implements OnInit {
  appointmentForm!: FormGroup;
  saved = false;
  loading = false;
  error = '';
  doctors: Doctor[] = [];
  slots: DoctorSlot[] = [];
  selectedDoctorId: string = '';
  availableDates: string[] = [];
  selectedDate: string = '';
  availableTimesForDate: DoctorSlot[] = [];

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.appointmentForm = this.fb.group({
      clinician: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      slotId: ['', Validators.required],
      reason: ['', Validators.required],
    });

    // Check if user is logged in
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.error = 'Please log in to book an appointment.';
      return;
    }

    this.loadDoctors();
  }

  loadDoctors(): void {
    this.loading = true;
    this.error = '';
    this.appointmentService.getDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.loading = false;
        console.log('Doctors loaded:', doctors);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading doctors:', err);

        // Provide specific error messages based on status code
        if (err.status === 401) {
          this.error = 'Your session has expired. Please log in again.';
        } else if (err.status === 403) {
          this.error =
            'You do not have permission to view doctors. Please ensure you are logged in as a patient.';
        } else if (err.status === 0) {
          this.error =
            'Cannot connect to server. Please check if the backend is running on https://localhost:7068';
        } else {
          this.error = 'Failed to load doctors. Please try again later.';
        }
      },
    });
  }

  onDoctorChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const doctorId = select.value;
    this.selectedDoctorId = doctorId;

    // Reset selections when doctor changes
    this.appointmentForm.patchValue({
      appointmentDate: '',
      slotId: '',
    });
    this.slots = [];
    this.availableDates = [];
    this.selectedDate = '';
    this.availableTimesForDate = [];

    if (doctorId) {
      this.loadSlots(doctorId);
    }
  }

  loadSlots(doctorId: string): void {
    this.loading = true;
    this.error = '';
    this.appointmentService.getDoctorSlots(doctorId).subscribe({
      next: (response) => {
        // Backend returns an object with slots array
        this.slots = response.slots || [];
        this.loading = false;
        console.log('Slots loaded:', this.slots);

        if (this.slots.length === 0) {
          this.error = 'No available slots for this doctor.';
        } else {
          // Extract unique dates from slots
          this.extractAvailableDates();
        }
      },
      error: (err) => {
        this.error = 'Failed to load available slots. Please try again.';
        this.loading = false;
        console.error('Error loading slots:', err);
      },
    });
  }

  extractAvailableDates(): void {
    // Get unique dates from all slots
    const uniqueDates = [...new Set(this.slots.map((slot) => slot.date))];
    this.availableDates = uniqueDates.sort();
    console.log('Available dates:', this.availableDates);
  }

  onDateChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const selectedDate = select.value;
    this.selectedDate = selectedDate;

    // Reset time slot selection
    this.appointmentForm.patchValue({ slotId: '' });

    // Filter slots for the selected date
    this.availableTimesForDate = this.slots.filter(
      (slot) => slot.date === selectedDate,
    );
    console.log(
      'Available times for',
      selectedDate,
      ':',
      this.availableTimesForDate,
    );
  }

  resetForm(): void {
    this.appointmentForm.reset();
    this.saved = false;
    this.error = '';
    this.slots = [];
    this.selectedDoctorId = '';
    this.availableDates = [];
    this.selectedDate = '';
    this.availableTimesForDate = [];
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      this.error = 'Please fill all required fields.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.saved = false;

    // Get patient ID from logged-in user
    const currentUser = this.authService.currentUserValue;
    if (!currentUser?.id) {
      this.error = 'User not logged in. Please log in to book an appointment.';
      this.loading = false;
      return;
    }

    const bookingRequest = {
      doctorId: this.appointmentForm.value.clinician,
      patientId: currentUser.id,
      slotId: this.appointmentForm.value.slotId,
      reason: this.appointmentForm.value.reason,
    };

    this.appointmentService.bookAppointment(bookingRequest).subscribe({
      next: (response) => {
        this.saved = true;
        this.loading = false;
        console.log('Appointment booked successfully:', response);

        // Reset form after 3 seconds
        setTimeout(() => {
          this.saved = false;
          this.resetForm();
        }, 3000);
      },
      error: (err) => {
        this.error = 'Failed to book appointment. Please try again.';
        this.loading = false;
        console.error('Error booking appointment:', err);
      },
    });
  }
}
