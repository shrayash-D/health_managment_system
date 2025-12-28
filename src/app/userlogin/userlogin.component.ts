import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-userlogin',
  imports: [RouterLink, RouterOutlet, CommonModule, ReactiveFormsModule],
  templateUrl: './userlogin.component.html',
  styleUrl: './userlogin.component.css',
})
export class LoginComponent {
  
  authorizeDet() {
    throw new Error('Method not implemented.');
  }
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    role: new FormControl('', Validators.required),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });
  passwordVisible =false;

  constructor(private authService: AuthService, private router: Router) {}
  get passwordType(): string {
    return this.passwordVisible ? 'text' : 'password';
  }
  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  login() {
    this.authService.login();
    this.router.navigate(['profile']);
  }
  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login();

      if (this.loginForm.value.role === 'admin')
        this.router.navigate(['/admin']);
      else if (this.loginForm.value.role === 'patient')
        this.router.navigate(['/profile']);
      else if (this.loginForm.value.role === 'doctor')
        this.router.navigate(['/doctor']);
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
