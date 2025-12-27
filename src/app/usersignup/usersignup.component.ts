import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  FormControl,
} from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterOutlet],
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

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.signupForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [
        Validators.required,
        // Validators.pattern(/^\+91\s\d{5}\s\d{5}$/) // +91 XXXXX XXXXX
      ]),
      dob: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.required]),
      confirm: new FormControl('', Validators.required),
      terms: new FormControl(false),
    });
    this.signupForm.statusChanges.subscribe(() => this.updateInvalidCount());
    this.signupForm.valueChanges.subscribe(() => this.updateInvalidCount());
    this.updateInvalidCount();
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
      console.log('Form is invalid');
      console.log(this.signupForm.errors);
      this.signupForm.markAllAsTouched();
    }
  }
  popupVisible = false;
  invalidCount = 0;

  togglePopup(): void {
    this.popupVisible = !this.popupVisible;
  }
  private updateInvalidCount(): void {
    const controls = this.signupForm.controls;
    this.invalidCount = Object.values(controls).filter((c) => c.invalid).length;
  }
}
