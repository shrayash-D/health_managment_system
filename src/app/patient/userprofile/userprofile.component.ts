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
  photoPreview?: string | null = null;
  tempPhotoUrl?: string | null = null;
  showSavePhotoBtn = false;
  saved = false;
  loading = false;
  patientData?: PatientApiResponse;

  private storageKey = 'userProfile';

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
  ) {}

  ngOnInit(): void {
    // Initialize form immediately to prevent template errors
    this.initializeDefaultForm();
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
        this.patientData = data;
        this.photoPreview = data.profileImage || null;

        // Format the date for the input field
        const dob = data.user.dob
          ? new Date(data.user.dob).toISOString().split('T')[0]
          : '';

        this.profileForm = this.fb.group({
          name: [data.user.name || '', Validators.required],
          email: [
            data.user.email || '',
            [Validators.required, Validators.email],
          ],
          phone: [data.user.phoneNumber || ''],
          dob: [dob],
          address: [''],
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

    const payload: Profile = {
      ...this.profileForm.value,
      photo: this.photoPreview ?? undefined,
    };

    localStorage.setItem(this.storageKey, JSON.stringify(payload));
    this.saved = true;

    // quick UX: clear saved flag after 2s
    setTimeout(() => (this.saved = false), 2000);
  }
}
