import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

type ContactMethod = 'Email' | 'Phone' | 'SMS';
type Urgency = 'Normal' | 'High' | 'Critical';

interface ContactFormModel {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  contactMethod: ContactMethod;
  urgency: Urgency;
  consent: boolean;
}

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  styleUrl: './contact-us.component.css',
})
export class ContactUsComponent implements OnInit {
  form!: FormGroup;

  contactMethods: ContactMethod[] = ['Email', 'Phone', 'SMS'];
  urgencies: Urgency[] = ['Normal', 'High', 'Critical'];

  // India phone pattern (+91 optional, 10 digits)
  private readonly phonePattern = /^(?:\+91[\s-]?)?[1-9]\d{9}$/;

  // Simple submit state (no CSS added)
  submitting = signal(false);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(this.phonePattern)]], // optional field but must be valid if filled
      subject: ['', [Validators.required, Validators.minLength(3)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
      contactMethod: ['Email', [Validators.required]],
      urgency: ['Normal', [Validators.required]],
      consent: [false, [Validators.requiredTrue]],
    });
  }

  get f() {
    return this.form.controls;
  }

  onReset(): void {
    this.form.reset({
      fullName: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      contactMethod: 'Email',
      urgency: 'Normal',
      consent: false,
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const payload: ContactFormModel = this.form.value as ContactFormModel;

    try {
      // TODO: replace with real API/service call
      await new Promise((res) => setTimeout(res, 600)); // simulate network
      console.log('Submitting contact form:', payload);
      alert('Thanks! Your message has been submitted.');
      this.onReset();
    } catch (err) {
      console.error('Submit failed:', err);
      alert('Something went wrong. Please try again later.');
    } finally {
      this.submitting.set(false);
    }
  }
}
