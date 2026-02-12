import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { PatientApiResponse } from '../../models/patient.interface';

interface Profile {
  name: string;
  email: string;
  phone?: string;
  dob?: string;
  address?: string;
  role?: string;
  photo?: string; // base64 data URL
}

@Component({
  selector: 'app-userprofile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './userprofile.component.html',
  styleUrl: './userprofile.component.css',
})
export class UserprofileComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  photoPreview?: string | null = null;
  tempPhotoUrl?: string | null = null;
  showSavePhotoBtn = false;
  saved = false;
  loading = false;
  patientData?: PatientApiResponse;
  passwordUpdateSuccess = false;
  passwordUpdateError = '';

  private storageKey = 'userProfile';

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
  ) {}

  ngOnInit(): void {
    // Initialize form immediately to prevent template errors
    this.initializeDefaultForm();
    this.initializePasswordForm();
    this.loadPatientData();
  }

  loadPatientData(): void {
    // Get userId from localStorage
    var currentuser = localStorage.getItem('currentUser');
    var userId = currentuser ? JSON.parse(currentuser).id : null;

    if (!userId) {
      console.error('User ID not found in localStorage');
      this.initializeDefaultForm();
      return;
    }

    this.loading = true;
    this.patientService.getPatientByUserId(userId).subscribe({
      next: (data: PatientApiResponse) => {
        // console.log("data: ", data)
        this.patientData = data;
        this.photoPreview = data.profileImage || null;

        // Format the date for the input field
        const dob = data.user.dob
          ? new Date(data.user.dob).toISOString().split('T')[0]
          : '';

        // Get stored profile data for address fallback
        const stored = localStorage.getItem(this.storageKey);
        const storedProfile = stored ? (JSON.parse(stored) as Profile) : null;

        this.profileForm = this.fb.group({
          name: [data.user.name || '', Validators.required],
          email: [
            data.user.email || '',
            [Validators.required, Validators.email],
          ],
          phone: [data.user.phoneNumber || ''],
          dob: [dob],
          address: [data.address || storedProfile?.address || ''],
          role: ['Patient'],
          bloodGroup: [data.bloodGroup || ''],
        });

        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching patient data:', error);
        this.loading = false;
        this.initializeDefaultForm();
      },
    });
  }

  initializeDefaultForm(): void {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      dob: [''],
      address: [''],
      role: ['Patient'],
      bloodGroup: [''],
    });
  }

  initializePasswordForm(): void {
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (
      newPassword &&
      confirmPassword &&
      newPassword.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }
  get displayName(): string {
    return this.profileForm?.get('name')?.value || '';
  }

  get displayRole(): string {
    return this.profileForm?.get('role')?.value || '';
  }

  get displayEmail(): string {
    return this.profileForm?.get('email')?.value || '';
  }

  onPhotoSelect(event: Event | any): void {
    const input = event.target as HTMLInputElement;
    if (!input?.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.tempPhotoUrl = reader.result as string;
      this.showSavePhotoBtn = true;
    };
    reader.readAsDataURL(file);
  }

  removePhoto(): void {
    // remove from both temp and persisted storage
    this.tempPhotoUrl = null;
    this.photoPreview = null;
    this.showSavePhotoBtn = false;
    // clear stored photo in profile if present
    const raw = localStorage.getItem(this.storageKey);
    if (raw) {
      try {
        const p = JSON.parse(raw);
        if (p && typeof p === 'object') {
          delete p.photo;
          localStorage.setItem(this.storageKey, JSON.stringify(p));
        }
      } catch {}
    }
  }

  savePhoto(): void {
    if (!this.tempPhotoUrl) return;
    // persist into profile object
    const raw = localStorage.getItem(this.storageKey);
    let p: any = {};
    if (raw) {
      try {
        p = JSON.parse(raw) || {};
      } catch {
        p = {};
      }
    }
    p.photo = this.tempPhotoUrl;
    localStorage.setItem(this.storageKey, JSON.stringify(p));
    // update current preview and clear temp
    this.photoPreview = this.tempPhotoUrl;
    this.tempPhotoUrl = null;
    this.showSavePhotoBtn = false;
    this.saved = true;
    setTimeout(() => (this.saved = false), 1200);
  }

  onSave(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const formValue = this.profileForm.value;

    // Prepare the payload for the API
    const payload = {
      fullName: formValue.name,
      email: formValue.email,
      phone: formValue.phone,
      dob: formValue.dob ? new Date(formValue.dob).toISOString() : null,
      address: formValue.address || '',
      bloodGroup: formValue.bloodGroup || '',
    };

    // Get userId from patient data or localStorage
    const userId = this.patientData?.userId || localStorage.getItem('userId');

    if (!userId) {
      console.error('User ID not found');
      return;
    }

    this.patientService.updatePatientProfile(userId, payload).subscribe({
      next: (response) => {
        this.saved = true;
        // Update local patient data if needed
        if (this.patientData) {
          this.patientData.user.name = formValue.name;
          this.patientData.user.email = formValue.email;
          this.patientData.user.phoneNumber = formValue.phone;
          this.patientData.bloodGroup = formValue.bloodGroup;
          this.patientData.address = formValue.address;
          if (formValue.dob) {
            this.patientData.user.dob = formValue.dob;
          }
        }
        setTimeout(() => (this.saved = false), 2000);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        // Handle error - maybe show a message to user
      },
    });
  }

  onUpdatePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const formValue = this.passwordForm.value;
    const payload = {
      currentPassword: formValue.currentPassword,
      newPassword: formValue.newPassword,
    };

    this.patientService.updatePassword(payload).subscribe({
      next: (response) => {
        console.log("response: ", response)
        this.passwordUpdateSuccess = true;
        this.passwordUpdateError = '';
        this.passwordForm.reset();
      },
      error: (error) => {
        console.error('Error updating password:', error);
        this.passwordUpdateError =
          error.error?.message || 'Failed to update password';
      },
    });
  }
}
