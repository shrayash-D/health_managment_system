import { Component} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DoctorDataService } from '../../services/doctor-data.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.css']
})
export class DoctorProfileComponent  {
  profileForm: FormGroup;
  isEditing = false;
  doctor: any;
  photoUrl: string | null = null;
  tempPhotoUrl: string | null = null;
  showSavePhotoBtn = false;

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
      email: [this.doctor.email, [Validators.required, Validators.email]], // ✅ added email validator
      countryCode: [this.doctor.countryCode, Validators.required],
      phone: [this.doctor.phone, [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
      specialization: [this.doctor.specialization, Validators.required],
      experience: [this.doctor.experience, Validators.required],
      bio: [this.doctor.bio]
    });
    this.photoUrl = this.doctor.photoUrl; // ✅ initialize here
  }

 

  enableEdit() {
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
    this.profileForm.reset(this.doctor);
  }

  onSave() {
    if (this.profileForm.valid) {
      this.doctorService.updateDoctor(this.profileForm.getRawValue());
      this.doctor = this.doctorService.getDoctor();
      this.isEditing = false;
      this.showMessage('Profile saved successfully!');
    } else {
      this.showMessage('Please fix the errors before saving.');
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
      this.showMessage('Photo updated successfully!');
    }
  }

  private showMessage(msg: string) {
    alert(msg);
  }
}
