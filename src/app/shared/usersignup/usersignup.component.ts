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
import { AuthUser } from '../../models/auth.interface';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './usersignup.component.html',
  styleUrls: ['./usersignup.component.css'],
})
export class UsersignupComponent implements OnInit {
  signupForm!: FormGroup;

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
    private authService: AuthService
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
      { validators: this.passwordMatchValidator }
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
    const user: AuthUser = {
      email: fv.email ?? '',
      role: fv.role ?? '',
    };
    this.authService.signup(user);
  }

  // ✅ Handle form submission
  onSubmit() {
    if (this.signupForm.valid) {
      console.log('Form Submitted:', this.signupForm.value);

      if (this.signupForm.valid) {
        this.signup();
        const role = this.signupForm.value.role;
        console.log('Form is valid, proceeding with signup', role);
        if (role === 'ADMIN') this.router.navigate(['/admin']);
        else if (role === 'PATIENT') this.router.navigate(['/patient']);
        else if (role === 'DOCTOR') this.router.navigate(['/doctor']);
      } else {
        this.signupForm.markAllAsTouched();
      }
    } else {
      console.log('Form is invalid');
      console.log(this.signupForm.errors);
      this.signupForm.markAllAsTouched();
    }
  }
}
