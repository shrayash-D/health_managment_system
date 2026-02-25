import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DoctorDataService } from '../../services/doctor-data.service';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingComponent } from '../../shared/loading/loading.component';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, LoadingComponent],
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.css'],
})
export class DoctorProfileComponent implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  isEditing = false;
  doctor: any;
  photoUrl: string | null = null;
  tempPhotoUrl: string | null = null;
  showSavePhotoBtn = false;
  isUploadingPhoto = false;
  passwordUpdateSuccess = false;
  passwordUpdateError = '';
  isLoadingDoctor = true;
  doctorLoadError = '';
  isSavingProfile = false;
  profileSaveSuccess = false;
  profileSaveError = '';

  private doctorSubscription?: Subscription;

  countryCodes = [
    { code: '+91', country: 'India' },
    { code: '+1', country: 'USA' },
    { code: '+44', country: 'UK' },
    { code: '+61', country: 'Australia' },
    { code: '+81', country: 'Japan' },
    { code: '+49', country: 'Germany' },
    { code: '+33', country: 'France' },
  ];

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorDataService,
  ) {
    // Initialize with current doctor data (could be mock initially)
    this.doctor = this.doctorService.getDoctor();
    this.initializeForms();
  }

  ngOnInit(): void {
    // Doctor data will automatically load via auth service subscription
    // Just subscribe to doctor data changes
    this.doctorSubscription = this.doctorService.doctor$.subscribe({
      next: (doctorData) => {
        console.log('Component received doctor data:', doctorData);
        this.doctor = doctorData;
        this.photoUrl = doctorData.photoUrl;
        this.updateFormWithDoctorData();
        this.isLoadingDoctor = false;
        this.doctorLoadError = '';
      },
      error: (error) => {
        console.error('Error loading doctor data:', error);
        this.isLoadingDoctor = false;
        this.doctorLoadError = 'Failed to load doctor profile';
      },
    });
  }

  ngOnDestroy(): void {
    if (this.doctorSubscription) {
      this.doctorSubscription.unsubscribe();
    }
  }

  private initializeForms(): void {
    // Initialize profile form
    this.profileForm = this.fb.group({
      fullName: [this.doctor.fullName, Validators.required],
      email: [this.doctor.email, [Validators.required, Validators.email]],
      countryCode: [this.doctor.countryCode, Validators.required],
      phone: [
        this.doctor.phone,
        [Validators.required, Validators.pattern(/^\d{10,15}$/)],
      ],
      specialization: [this.doctor.specialization, Validators.required],
      experience: [this.doctor.experience, Validators.required],
      bio: [this.doctor.bio],
    });

    this.initializePasswordForm();
  }

  private updateFormWithDoctorData(): void {
    if (this.profileForm && this.doctor) {
      console.log('Updating form with doctor data:', this.doctor);
      console.log(
        'Doctor phone details - Country Code:',
        this.doctor.countryCode,
        'Phone:',
        this.doctor.phone,
      );

      const formData = {
        fullName: this.doctor.fullName || '',
        email: this.doctor.email || '',
        countryCode: this.doctor.countryCode || '+91',
        phone: this.doctor.phone || '',
        specialization: this.doctor.specialization || '',
        experience: this.doctor.experience || '',
        bio: this.doctor.bio || '',
      };

      console.log('Form data to update:', formData);

      this.profileForm.patchValue(formData);

      // Force change detection
      this.profileForm.markAsPristine();
      this.profileForm.updateValueAndValidity();
    } else {
      console.warn('Cannot update form - form or doctor data missing', {
        hasForm: !!this.profileForm,
        hasDoctorData: !!this.doctor,
      });
    }
  }

  // 🔹 Reload page on error
  reloadPage(): void {
    window.location.reload();
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
      this.isSavingProfile = true;
      this.profileSaveError = '';
      this.profileSaveSuccess = false;

      const formData = this.profileForm.getRawValue();
      console.log('Form data to save:', formData);

      const updateResult = this.doctorService.updateDoctor(formData);

      // Handle API response
      if (updateResult && typeof updateResult.subscribe === 'function') {
        updateResult.subscribe({
          next: (response) => {
            console.log('Profile update successful:', response);
            this.profileSaveSuccess = true;
            this.profileSaveError = '';
            this.isSavingProfile = false;
            this.isEditing = false;

            // Reload doctor data to get updated information
            const currentUser =
              this.doctorService.authService?.currentUserValue;
            if (currentUser?.id) {
              this.doctorService.loadDoctorFromApi(currentUser.id);
            }

            // Hide success message after 3 seconds
            setTimeout(() => {
              this.profileSaveSuccess = false;
            }, 3000);
          },
          error: (error) => {
            console.error('Profile update failed:', error);
            this.isSavingProfile = false;
            this.profileSaveSuccess = false;

            let errorMessage = 'Failed to update profile. Please try again.';
            if (error.status === 401) {
              errorMessage = 'Authentication required. Please log in again.';
            } else if (error.error?.message) {
              errorMessage = error.error.message;
            }

            this.profileSaveError = errorMessage;

            // Hide error message after 5 seconds
            setTimeout(() => {
              this.profileSaveError = '';
            }, 5000);
          },
        });
      } else {
        // Handle photo-only updates (no API call)
        this.isEditing = false;
        this.showMessage('Profile updated successfully!');
      }
    } else {
      this.profileForm.markAllAsTouched();
      this.showMessage('Please fix the errors before saving.');
    }
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file size (5MB max, matching backend validation)
      if (file.size > 5 * 1024 * 1024) {
        this.showMessage('File size must be less than 5MB');
        return;
      }

      // Validate file type (matching backend validation)
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/bmp',
      ];
      if (!allowedTypes.includes(file.type)) {
        this.showMessage('Only JPG, JPEG, PNG, GIF, and BMP files are allowed');
        return;
      }

      // Preview the image
      const reader = new FileReader();
      reader.onload = () => {
        this.tempPhotoUrl = reader.result as string;
        this.showSavePhotoBtn = true;
      };
      reader.readAsDataURL(file);

      // Store the file for uploading
      (input as any).selectedFile = file;
    }
  }

  savePhoto() {
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = (fileInput as any)?.selectedFile;

    if (!file) {
      this.showMessage('No file selected');
      return;
    }

    console.log(
      'Uploading file:',
      file.name,
      'Size:',
      file.size,
      'Type:',
      file.type,
    );
    this.isUploadingPhoto = true;

    this.doctorService
      .uploadProfilePhoto(file, 'Doctor profile photo')
      .subscribe({
        next: (response) => {
          console.log('Upload successful:', response);
          // Update the doctor's profile with the new photo path
          this.doctorService.updateDoctor({ photoUrl: response.data.filePath });
          this.photoUrl = response.data.filePath;
          this.tempPhotoUrl = null;
          this.showSavePhotoBtn = false;
          this.isUploadingPhoto = false;
          this.showMessage('Photo updated successfully!');
        },
        error: (error) => {
          console.error('Photo upload failed:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.error);
          this.tempPhotoUrl = null;
          this.showSavePhotoBtn = false;
          this.isUploadingPhoto = false;

          // Show specific error message from backend if available
          let errorMessage = 'Failed to update photo. Please try again.';

          if (error.status === 401) {
            errorMessage = 'Authentication required. Please log in again.';
          } else if (error.status === 400) {
            errorMessage =
              error.error?.message ||
              'Invalid file. Please check file size and type.';
          } else if (error.status === 0) {
            errorMessage =
              'Cannot connect to server. Please check your connection.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }

          this.showMessage(errorMessage);
        },
      });
  }

  cancelPhoto() {
    this.tempPhotoUrl = null;
    this.showSavePhotoBtn = false;
    this.isUploadingPhoto = false;

    // Clear the file input
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
      (fileInput as any).selectedFile = null;
    }
  }

  // 🔹 Password functionality
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

    this.doctorService.updatePassword(payload).subscribe({
      next: (response) => {
        console.log('Password update response: ', response);
        this.passwordUpdateSuccess = true;
        this.passwordUpdateError = '';
        this.passwordForm.reset();

        // Hide success message after 3 seconds
        setTimeout(() => {
          this.passwordUpdateSuccess = false;
        }, 3000);
      },
      error: (error) => {
        console.error('Error updating password:', error);
        this.passwordUpdateSuccess = false;
        this.passwordUpdateError =
          error.error?.message || 'Failed to update password';

        // Hide error message after 5 seconds
        setTimeout(() => {
          this.passwordUpdateError = '';
        }, 5000);
      },
    });
  }

  private showMessage(msg: string) {
    alert(msg);
  }
}
