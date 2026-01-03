
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

type RxRoute = 'PO' | 'IV' | 'IM' | 'Topical';

interface Medication {
  drug: string;
  dose: string;
  route: RxRoute | '';
  frequency: string;
  duration: string;
  qty: number | null;
  refills: number | null;
  instructions: string;
}

interface PrescriptionFormModel {
  pid: string;
  pname: string;
  doctor: string;
  license: string;
  medications: Medication[];
  notes?: string;
  allowGeneric: boolean;
}

@Component({
  selector: 'app-prescription-form',
  standalone: true, // <-- important when using `imports`
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './prescription-form.component.html',
  styleUrls: ['./prescription-form.component.css']
})
export class PrescriptionFormComponent implements OnInit {
  form!: FormGroup;
  submitting = false;

  // Allowed routes (used by validator)
  private readonly routes: ReadonlyArray<RxRoute> = ['PO', 'IV', 'IM', 'Topical'];

  // Practical patterns (kept simple and common)
  private readonly pidPattern = /^[A-Za-z]\d{3,}$/;                 // e.g., P123, P12345
  private readonly namePattern = /^[A-Za-z][A-Za-z\s'.-]{1,}$/;     // letters + spaces/punct.
  private readonly licensePattern = /^[A-Za-z]{2,10}[\/-]?\d{3,10}$/; // e.g., MMC/123456, GMC-98765

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      pid: ['', [Validators.required, Validators.pattern(this.pidPattern)]],
      pname: ['', [Validators.required, Validators.minLength(2), Validators.pattern(this.namePattern)]],
      doctor: ['', [Validators.required, Validators.minLength(2)]],
      license: ['', [Validators.required, Validators.pattern(this.licensePattern)]],
      medications: this.fb.array([this.createMedicationRow(), this.createMedicationRow()]),
      notes: [''],
      allowGeneric: [false],
    });
  }

  // --- Convenience getters ---
  get f() {
    return this.form.controls;
  }

  get medications(): FormArray {
    return this.form.get('medications') as FormArray;
  }

  // --- Helper: optional min-length ---
  private minLenIfPresent = (len: number) => {
    return (control: AbstractControl): ValidationErrors | null => {
      const v = control.value;
      if (v === null || v === undefined || v === '') return null;
      const s = String(v);
      return s.length >= len ? null : { minLengthIfPresent: { requiredLength: len, actualLength: s.length } };
    };
  };

  // --- Row factory ---
  private createMedicationRow(): FormGroup {
    return this.fb.group(
      {
        drug: ['', [Validators.required, Validators.minLength(2)]],
        dose: ['', [Validators.required, Validators.minLength(2)]],
        route: ['', [Validators.required]],
        frequency: ['', [Validators.required, Validators.minLength(2)]],
        duration: ['', [Validators.required, Validators.minLength(2)]],
        qty: [null, [Validators.required, Validators.min(1)]],
        refills: [null, [Validators.required, Validators.min(0)]],
        instructions: ['', [this.minLenIfPresent(2)]], // optional; only checks when present
      },
      { validators: [this.routeMustBeValid] } // arrow fn captures `this`
    );
  }

  // --- Validators ---
  /** Ensure route is one of allowed values */
  private routeMustBeValid = (group: AbstractControl): ValidationErrors | null => {
    const route = group.get('route')?.value as RxRoute | '';
    if (!route) return null;
    return this.routes.includes(route) ? null : { invalidRoute: true };
  };

  // --- Actions ---
  addMedication(): void {
    this.medications.push(this.createMedicationRow());
  }

  onPreview(): void {
    const payload = this.form.getRawValue() as PrescriptionFormModel;
    console.log('Preview prescription:', payload);
    alert('Preview logged to console.');
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;

    const payload = this.form.value as PrescriptionFormModel;

    try {
      // TODO: Replace with real API/service call
      console.log('Save & Print payload:', payload);
      alert('Prescription saved. Now printing...');

      // Reset form to clean state (keeping class names/structure intact)
      this.form.reset({
        pid: '',
        pname: '',
        doctor: '',
        license: '',
        notes: '',
        allowGeneric: false,
      });

      // Ensure we keep at least two empty rows like the original table
      this.medications.clear();
      this.medications.push(this.createMedicationRow());
      this.medications.push(this.createMedicationRow());
    } catch (err) {
      console.error('Save & Print failed:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      this.submitting = false;
    }
  }
}
