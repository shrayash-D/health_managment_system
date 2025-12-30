import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

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
  saved = false;

  private storageKey = 'userProfile';

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const stored = localStorage.getItem(this.storageKey);
    const initial: Profile = stored
      ? (JSON.parse(stored) as Profile)
      : {
          name: 'Shrayash Desai',
          email: 'shrayash@example.com',
          phone: '+91 98XXX XXX90',
          dob: '',
          address: '',
          role: 'Patient',
          photo: undefined,
        };

    this.photoPreview = initial.photo ?? null;

    this.profileForm = this.fb.group({
      name: [initial.name, Validators.required],
      email: [initial.email, [Validators.required, Validators.email]],
      phone: [initial.phone],
      dob: [initial.dob],
      address: [initial.address],
      role: [initial.role],
    });
  }

  get initials(): string {
    const name = this.profileForm?.get('name')?.value || '';
    if (!name) return 'U';
    return name
      .split(' ')
      .filter(Boolean)
      .map((n: string) => n[0].toUpperCase())
      .slice(0, 2)
      .join('');
  }

  get displayName(): string {
    return this.profileForm?.get('name')?.value || '';
  }

  get displayRole(): string {
    return this.profileForm?.get('role')?.value || '';
  }

  onPhotoSelect(event: Event | any): void {
    const input = event.target as HTMLInputElement;
    if (!input?.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removePhoto(): void {
    this.photoPreview = null;
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
