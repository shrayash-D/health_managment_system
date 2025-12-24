import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DoctorDataService } from '../../services/doctor-data.service';
import { RouterModule } from '@angular/router';
import { inject } from '@angular/core';
import { Location } from '@angular/common';
@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.css']
})
export class DoctorProfileComponent implements OnInit {
  profileForm: FormGroup;
  isEditing = false;
  photoUrl: string | null = null;
  tempPhotoUrl: string | null = null;
  showSavePhotoBtn = false;
  doctor: any;
 private location = inject(Location);
 
 
  countryCodes = [
    { code: '+91', country: 'India' },
    { code: '+1', country: 'USA' },
    { code: '+44', country: 'UK' },
    { code: '+61', country: 'Australia' },
    { code: '+81', country: 'Japan' },
    { code: '+49', country: 'Germany' },
    { code: '+33', country: 'France' }
  ];

  constructor(private fb: FormBuilder, private doctorService: DoctorDataService) {
    this.doctor = this.doctorService.getDoctor();
    this.profileForm = this.fb.group({
      fullName: [this.doctor.fullName, Validators.required],
      email: [{ value: this.doctor.email, disabled: true }],
      countryCode: [this.doctor.countryCode, Validators.required],
      phone: [this.doctor.phone, [Validators.required, Validators.pattern(/^\d{10}$/)]],
      specialization: [{ value: this.doctor.specialization, disabled: true }],
      bio: [this.doctor.bio]
    });
    this.lockFields();
  }

  goBack() { this.location.back();}


  ngOnInit() {
    this.photoUrl = this.doctor.photoUrl;
  }

  lockFields() {
    this.profileForm.get('fullName')?.disable();
    this.profileForm.get('phone')?.disable();
    this.profileForm.get('bio')?.disable();
    this.profileForm.get('countryCode')?.disable();
  }

  enableEdit() {
    this.isEditing = true;
    this.profileForm.get('fullName')?.enable();
    this.profileForm.get('phone')?.enable();
    this.profileForm.get('bio')?.enable();
    this.profileForm.get('countryCode')?.enable();
  }

  cancelEdit() {
    this.isEditing = false;
    this.profileForm.reset(this.doctor);
    this.lockFields();
  }

  onSave() {
    if (this.profileForm.valid) {
      this.doctorService.updateDoctor(this.profileForm.getRawValue());
      this.doctor = this.doctorService.getDoctor();
      this.cancelEdit();
    }
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        this.tempPhotoUrl = reader.result as string;
        this.showSavePhotoBtn = true;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  savePhoto() {
    if (this.tempPhotoUrl) {
      this.doctorService.updateDoctor({ photoUrl: this.tempPhotoUrl });
      this.photoUrl = this.doctorService.getDoctor().photoUrl;
      this.showSavePhotoBtn = false;
    }
  }
}
