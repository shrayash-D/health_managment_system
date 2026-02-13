import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  FormControl,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AuthUser, SignupRequest } from '../../models/auth.interface';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './usersignup.component.html',
  styleUrls: ['./usersignup.component.css'],
})
export class UsersignupComponent implements OnInit {
  signupForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  passVisible = false;
  confirmVisible = false;

  // These are bound to [type] in your HTML
  get passType(): string {
    return this.passVisible ? 'text' : 'password';
  }
  get confirmType(): string {
    return this.confirmVisible ? 'text' : 'password';
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    // add 'role' control and attach the password match validator to the group
    this.signupForm = new FormGroup(
      {
        name: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.required, Validators.email]),
        phone: new FormControl('', [
          Validators.required,
          Validators.pattern(/^\d{10}$/), // +91 XXXXX XXXXX
        ]),
        dob: new FormControl('', Validators.required),
        role: new FormControl('', Validators.required),
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(8),
        ]),
        confirm: new FormControl('', Validators.required),
        terms: new FormControl(false),
      },
      { validators: this.passwordMatchValidator },
    );
  }

  // ✅ Custom validator for password confirmation
  passwordMatchValidator(control: AbstractControl) {
    const pass = control.get('password')?.value;
    const confirm = control.get('confirm')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  // ✅ Toggle password visibility
  toggle(field: 'pass' | 'confirm') {
    if (field === 'pass') {
      this.passVisible = !this.passVisible;
    } else {
      this.confirmVisible = !this.confirmVisible;
    }
  }

  signup() {
    console.log('Attempting signup...');
    const fv = this.signupForm.value;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const signupRequest: SignupRequest = {
      email: fv.email ?? '',
      password: fv.password ?? '',
      name: fv.name ?? '',
      role: fv.role?.toUpperCase() ?? '', // Convert to uppercase (PATIENT, DOCTOR, ADMIN)
      phoneNumber: fv.phone ?? '',
      dob: fv.dob ? new Date(fv.dob).toISOString() : undefined,
    };

    // Call the API
    this.authService.signupWithAPI(signupRequest).subscribe({
      next: (response) => {
        console.log('Signup successful:', response);
        this.isLoading = false;
        this.successMessage =
          'Account created successfully! Redirecting to login...';

        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        console.error('Signup failed:', error);
        this.isLoading = false;

        // Extract the error message from the error object
        let errorMsg = 'Signup failed. Please try again.';

        if (error.message) {
          errorMsg = error.message;
        } else if (error.error) {
          if (typeof error.error === 'string') {
            errorMsg = error.error;
          } else if (error.error.message) {
            errorMsg = error.error.message;
          }
        }

        this.errorMessage = errorMsg;
      },
    });
  }

  // ✅ Handle form submission
  onSubmit() {
    if (this.signupForm.valid) {
      console.log('Form Submitted:', this.signupForm.value);
      this.signup();
    } else {
      console.log('Form is invalid');
      console.log(this.signupForm.errors);
      this.signupForm.markAllAsTouched();
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }
}
