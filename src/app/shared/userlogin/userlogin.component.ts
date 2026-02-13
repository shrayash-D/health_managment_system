import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthUser, LoginRequest } from '../../models/auth.interface';

@Component({
  selector: 'app-userlogin',
  imports: [RouterLink, RouterOutlet, CommonModule, ReactiveFormsModule],
  templateUrl: './userlogin.component.html',
  styleUrl: './userlogin.component.css',
})
export class LoginComponent {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    role: new FormControl('', Validators.required),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });
  passwordVisible = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  get passwordType(): string {
    return this.passwordVisible ? 'text' : 'password';
  }

  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  login() {
    console.log('Attempting login...');
    const fv = this.loginForm.value;
    console.log('Form values: ', this.loginForm);

    this.isLoading = true;
    this.errorMessage = '';

    const loginRequest: LoginRequest = {
      email: fv.email ?? '',
      password: fv.password ?? '',
      role: fv.role?.toUpperCase() ?? '', // Convert to uppercase to match backend (PATIENT, DOCTOR, ADMIN)
    };

    // Call the API
    this.authService.loginWithAPI(loginRequest).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.isLoading = false;

        // Navigate based on role
        const role = response.role.toLowerCase();
        if (role === 'admin') {
          this.router.navigate(['/admin']);
        } else if (role === 'patient') {
          this.router.navigate(['/patient']);
        } else if (role === 'doctor') {
          this.router.navigate(['/doctor']);
        }
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.isLoading = false;

        // Extract the error message from the error object
        let errorMsg = 'Login failed. Please try again.';

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

  onSubmit() {
    if (this.loginForm.valid) {
      this.login();
    } else {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }
}
