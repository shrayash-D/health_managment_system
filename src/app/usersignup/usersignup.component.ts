import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router ,RouterLink} from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl
} from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterLink],
  templateUrl: './usersignup.component.html',
  styleUrls: ['./usersignup.component.css']
})
export class SignupComponent implements OnInit {
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

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        phone: [
          '',
          [
            Validators.required,
            Validators.pattern(/^\+91\s\d{5}\s\d{5}$/) // +91 XXXXX XXXXX
          ]
        ],
        dob: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirm: ['', Validators.required],
        terms: [false, Validators.requiredTrue]
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

  // ✅ Helper for showing errors in template
  isInvalid(field: string): boolean {
    const control = this.signupForm.get(field);
    return !!(control && control.touched && control.invalid);
  }

  // ✅ Handle form submission
  onSubmit() {
    if (this.signupForm.valid) {
      console.log('Form Submitted:', this.signupForm.value);
      this.router.navigate(['/login']);
    } else {
      this.signupForm.markAllAsTouched();
    }
  }
}
