import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

type Severity = 'Mild' | 'Moderate' | 'Severe' | 'Critical';

interface DiagnosisFormModel {
  pid: string;
  pname: string;
  dob: string;       // yyyy-MM-dd
  encDate: string;   // yyyy-MM-dd
  chief: string;
  history: string;
  diagnosis: string; // ICD-10 code
  severity: Severity;
  plan: string;
  followupRequired: boolean;
}

@Component({
  selector: 'app-diagnosis-form',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './diagnosis-form.component.html',
  styleUrl: './diagnosis-form.component.css'
})
export class DiagnosisFormComponent implements OnInit {
  form!: FormGroup;

  severities: Severity[] = ['Mild', 'Moderate', 'Severe', 'Critical'];

  submitting = false;
  savingDraft = false;

  // Patterns
  private readonly pidPattern = /^[A-Za-z]\d{3,}$/; // e.g., P123, A4567
  private readonly namePattern = /^[A-Za-z][A-Za-z\s'.-]{1,}$/; // letters + spaces/punct.
  // Common ICD-10 code shape: E11.9, J20, A04.7, etc.
  private readonly icd10Pattern = /^[A-TV-Z][0-9]{2}(?:\.[A-Z0-9]{1,4})?$/i;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        pid: ['', [Validators.required, Validators.pattern(this.pidPattern)]],
        pname: ['', [Validators.required, Validators.minLength(2), Validators.pattern(this.namePattern)]],
        dob: ['', [Validators.required, this.notFutureDate]],
        encDate: ['', [Validators.required, this.notFutureDate]],
        chief: ['', [Validators.required, Validators.minLength(3)]],
        history: ['', [Validators.required, Validators.minLength(10)]],
        diagnosis: ['', [Validators.required, Validators.pattern(this.icd10Pattern)]],
        severity: ['Mild', [Validators.required]],
        plan: ['', [Validators.required, Validators.minLength(10)]],
        followupRequired: [false],
      },
      { validators: [this.encounterAfterDob] }
    );

    // Optional: restore any previously saved draft
    this.restoreDraft();
  }

  get f() {
    return this.form.controls;
  }

  // --- Custom validators ---

  /** Disallow future dates */
  private notFutureDate(control: AbstractControl): ValidationErrors | null {
    const v = control.value;
    if (!v) return null;
    const input = new Date(v);
    const today = new Date();
    input.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return input > today ? { futureDate: true } : null;
  }

  /** Encounter date must not be before DOB */
  private encounterAfterDob(group: AbstractControl): ValidationErrors | null {
    const dob = group.get('dob')?.value;
    const enc = group.get('encDate')?.value;
    if (!dob || !enc) return null;
    const dobDate = new Date(dob);
    const encDate = new Date(enc);
    dobDate.setHours(0, 0, 0, 0);
    encDate.setHours(0, 0, 0, 0);
    return encDate < dobDate ? { encBeforeDob: true } : null;
  }

  // --- Actions ---

  onSaveDraft(): void {
    this.savingDraft = true;
    try {
      const value = this.form.getRawValue() as DiagnosisFormModel;
      localStorage.setItem('diagnosisDraft', JSON.stringify(value));
      alert('Draft saved.');
    } catch (e) {
      console.error('Draft save failed:', e);
      alert('Could not save draft.');
    } finally {
      this.savingDraft = false;
    }
  }

  private restoreDraft(): void {
    const raw = localStorage.getItem('diagnosisDraft');
    if (!raw) return;
    try {
      const draft = JSON.parse(raw) as Partial<DiagnosisFormModel>;
      this.form.patchValue(draft);
    } catch {
      // ignore invalid draft
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload = this.form.value as DiagnosisFormModel;

    try {
      // TODO: Replace with real API call
      console.log('Finalize Diagnosis payload:', payload);
      alert('Diagnosis finalized successfully.');

      // Optional: clear draft
      localStorage.removeItem('diagnosisDraft');

      // Reset form to defaults
      this.form.reset({
        pid: '',
        pname: '',
        dob: '',
        encDate: '',
        chief: '',
        history: '',
        diagnosis: '',
        severity: 'Mild',
        plan: '',
        followupRequired: false,
      });
    } catch (e) {
      console.error('Finalize failed:', e);
      alert('Something went wrong. Please try again.');
    } finally {
      this.submitting = false;
    }
  }
}

