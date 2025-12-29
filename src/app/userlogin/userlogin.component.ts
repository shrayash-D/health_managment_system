import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
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
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    role: new FormControl('', Validators.required),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });
  passwordVisible = false;

  constructor(private authService: AuthService, private router: Router) {}
  get passwordType(): string {
    return this.passwordVisible ? 'text' : 'password';
  }
  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  login() {
    console.log('Attempting login...');
    const fv = this.loginForm.value;
    const user: User = {
      email: fv.email ?? '',
      role: fv.role ?? '',
      // token/name can be set after real authentication
    };
    this.authService.login(user);
  }
  onSubmit() {
    if (this.loginForm.valid) {
      this.login();
      const role = this.loginForm.value.role;
      if (role === 'admin') this.router.navigate(['/admin']);
      else if (role === 'patient') this.router.navigate(['/patient']);
      else if (role === 'doctor') this.router.navigate(['/doctor']);
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
