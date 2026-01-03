import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

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

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.appointmentForm = this.fb.group({
      patientId: ['', Validators.required],
      patientName: ['', Validators.required],
      clinician: ['', Validators.required],
      dept: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      reason: ['', Validators.required],
      type: ['In‑person'],
      status: ['Scheduled'],
      notes: [''],
      sendConfirmation: [true],
    });
  }

  resetForm(): void {
    this.appointmentForm.reset({
      type: 'In‑person',
      status: 'Scheduled',
      sendConfirmation: true,
    });
    this.saved = false;
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    const payload = {
      id: Date.now(),
      ...this.appointmentForm.value,
    };

    const key = 'appointments';
    const existingRaw = localStorage.getItem(key);
    const existing = existingRaw ? (JSON.parse(existingRaw) as any[]) : [];
    existing.push(payload);
    localStorage.setItem(key, JSON.stringify(existing));

    this.saved = true;
    // keep form state — optionally reset or navigate
  }
}
