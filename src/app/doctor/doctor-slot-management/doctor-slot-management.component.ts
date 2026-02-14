import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DoctorSlotService } from '../../services/doctor-slot.service';

@Component({
  selector: 'app-doctor-slot-management',
  templateUrl: './doctor-slot-management.component.html',
  styleUrls: ['./doctor-slot-management.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class DoctorSlotManagementComponent implements OnInit {
  slots: any[] = [];
  availableDates: string[] = [];
  doctorId: string = '';
  loading = false;
  error = '';

  constructor(private doctorService: DoctorSlotService) {}

  ngOnInit() {
    // TODO: Set doctorId from auth or route
    this.doctorId = this.getDoctorId();
    this.loadSlots();
    this.loadAvailableDates();
  }

  getDoctorId(): string {
    // Replace with actual logic to get doctorId from auth/session
    return localStorage.getItem('doctorId') || '';
  }

  loadSlots() {
    this.loading = true;
  this.doctorService.getDoctorSlots(this.doctorId).subscribe({
      next: slots => { this.slots = slots; this.loading = false; },
      error: err => { this.error = 'Failed to load slots.'; this.loading = false; }
    });
  }

  loadAvailableDates() {
  this.doctorService.getDoctorAvailableDates(this.doctorId).subscribe({
      next: dates => this.availableDates = dates,
      error: err => this.error = 'Failed to load available dates.'
    });
  }

  generateSlots(form: NgForm) {
    if (!form.valid) return;
    this.loading = true;
    const data = { ...form.value, doctorId: this.doctorId };
  this.doctorService.generateDoctorSlots(data).subscribe({
      next: () => { this.loadSlots(); form.resetForm(); this.loading = false; },
      error: err => { this.error = 'Failed to generate slots.'; this.loading = false; }
    });
  }

  deleteSlot(slotId: string) {
    if (!confirm('Delete this slot?')) return;
  this.doctorService.deleteDoctorSlot(slotId).subscribe({
      next: () => this.loadSlots(),
      error: err => this.error = 'Failed to delete slot.'
    });
  }
}
