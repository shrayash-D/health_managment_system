import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DoctorDataService,
  Appointment,
  Consultation,
  Invoice,
} from '../../services/doctor-data.service';
import { AuthService } from '../../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import jsPDF from 'jspdf';

export enum AppointmentStatus {
  BOOKED = 'BOOKED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.css',
})
export class AppointmentComponent implements OnInit, OnDestroy {
  appointments: Appointment[] = [];
  appointmentFilterDate = '';
  appointmentFilterStatus = '';
  slotStartDate = '';
  slotEndDate = '';
  availableSlots: string[] = [];
  minDate = '';

  // API Statistics
  appointmentApiStats: { doctorId: string; totalAppointments: number } | null =
    null;

  showCompletionModal: boolean = false;
  selectedAppointment: Appointment | null = null;
  completionData = {
    diagnosis: '',
    date: '',
    vitals: { bloodPressure: '', heartRate: '', temperature: '', spO2: '' },
    medications: [] as {
      drug: string;
      dose: string;
      route: string;
      frequency: string;
      activity: string;
    }[],
    labTests: { cbc: '', lft: '', creatinine: '', hba1c: '' },
    billing: {
      consultationType: '',
      consultationFee: '',
      labFee: '',
      medicineFee: '',
      total: '',
    },
  };

  addingVitals = false;
  addingMedications = false;
  addingBilling = false;

  activeSection: string = '';

  showEMRModal = false;
  selectedConsultation: Consultation | null = null;
  addingDiagnosis = false;
  newDiagnosis = '';
  newLabResult = { testName: '', value: '', unit: '', notes: '' };
  lastConsultation: Consultation | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private doctorService: DoctorDataService,
    private router: Router,
    private authService: AuthService,
  ) {
    // Set minimum date to today (allow selecting today's date)
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit() {
    // Load appointments from API first
    this.loadAppointmentsFromAPI();

    this.doctorService.appointments$
      .pipe(takeUntil(this.destroy$))
      .subscribe((appointments) => {
        this.appointments = appointments;
      });

    // Subscribe to appointment API stats
    this.doctorService.appointmentStats$
      .pipe(takeUntil(this.destroy$))
      .subscribe((stats) => {
        this.appointmentApiStats = stats;
      });

    this.doctorService.slots$
      .pipe(takeUntil(this.destroy$))
      .subscribe((slots) => {
        this.availableSlots = slots;
      });

    // Subscribe to available time-based slots from API
    this.doctorService.availableSlots$
      .pipe(takeUntil(this.destroy$))
      .subscribe((availableSlots) => {
        console.log('Available slots updated:', availableSlots);
        // availableSlots now contains time-based slots from the API
        // You can use this data to display time slots in the UI
      });
  }

  private loadAppointmentsFromAPI(): void {
    // Get the real doctor ID from localStorage first
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedUser) {
      try {
        const currentUser = JSON.parse(storedUser);
        console.log('Current user from localStorage:', currentUser);
        
        if (currentUser && currentUser.id) {
          // First fetch doctor profile to get the real doctorId
          this.doctorService.getDoctorById(currentUser.id).subscribe({
            next: (doctorResponse) => {
              console.log('Doctor response for appointments:', doctorResponse);
              
              if (doctorResponse && doctorResponse.id) {
                // Now load appointments using the real doctor ID
                console.log('Loading appointments for real doctor ID:', doctorResponse.id);
                this.doctorService.loadAppointmentsFromApi(doctorResponse.id);
              } else {
                console.warn('No doctor ID in response');
              }
            },
            error: (error) => {
              console.error('Error fetching doctor profile:', error);
            }
          });
        } else {
          console.warn('No user ID in localStorage');
        }
      } catch (error) {
        console.error('Error parsing currentUser from localStorage:', error);
      }
    } else {
      console.warn('No currentUser in localStorage');
    }
  }

  // 🔹 Get patient name from appointment data
  getPatientName(appointment: Appointment): string {
    // Return the patient identifier (already set by the service based on patient ID)
    return appointment.patientName || 'Unknown Patient';
  }

  /**
   * Fetch available time-based slots for today
   * This populates the availableSlots$ observable with time slot information
   */
  private fetchAvailableSlotsForToday(): void {
    // Get today's date in ISO format (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    this.doctorService
      .fetchAvailableSlots(today)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Available slots for today:', response);
        },
        error: (error) => {
          console.warn('Could not load available slots:', error);
          // Silently fail - component still works with mock data
        },
      });
  }

  /**
   * Public method to fetch available slots for a specific date
   * @param date ISO format date string (YYYY-MM-DD)
   */
  fetchAvailableSlotsForDate(date: string): void {
    this.doctorService
      .fetchAvailableSlots(date)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Available slots for', date, ':', response);
        },
        error: (error) => {
          console.error('Error fetching available slots for', date, ':', error);
        },
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addSlot() {
    // Validation: Check if both dates are provided
    if (!this.slotStartDate || !this.slotEndDate) {
      alert('Please select both start and end dates.');
      return;
    }

    // Validation: Check if dates are in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(this.slotStartDate);
    const endDate = new Date(this.slotEndDate);

    if (startDate < today) {
      alert("Start date must be ahead of today's date.");
      return;
    }

    if (endDate < today) {
      alert("End date must be ahead of today's date.");
      return;
    }

    // Validation: Check if end date is not before start date
    if (endDate < startDate) {
      alert('End date cannot be before start date.');
      return;
    }

    console.log(
      'Generating slots from:',
      this.slotStartDate,
      'to:',
      this.slotEndDate,
    );

    // Call API to generate slots for the date range
    this.doctorService
      .generateDoctorSlot(this.slotStartDate, this.slotEndDate)
      .subscribe({
        next: (response) => {
          console.log('Slots created via API:', response);

          // Reset form
          this.slotStartDate = '';
          this.slotEndDate = '';

          // Show success message
          alert(`Appointment slots created successfully! ✅`);
        },
        error: (error) => {
          console.error('Error creating slots:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            response: error.error,
          });

          let errorMessage = 'Failed to create appointment slots.';

          if (error.message === 'Doctor profile not loaded') {
            errorMessage =
              'Doctor profile is not loaded yet. Please wait and try again.';
          } else if (error.status === 400) {
            errorMessage = 'Invalid date format. Please check your input.';
          } else if (error.status === 401) {
            errorMessage = 'Your session has expired. Please log in again.';
          } else if (error.status === 404) {
            errorMessage = 'Doctor not found. Please check your profile.';
          } else if (error.status === 409) {
            errorMessage = 'Slots already exist for this date.';
          } else if (error.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          alert(`Error: ${errorMessage}`);
        },
      });
  }

  get filteredAppointments() {
    return this.appointments.filter((appointment) => {
      const dateMatch =
        !this.appointmentFilterDate ||
        appointment.date === this.appointmentFilterDate;
      const statusMatch =
        !this.appointmentFilterStatus ||
        appointment.status === this.appointmentFilterStatus;
      return dateMatch && statusMatch;
    });
  }

  get hasMedications() {
    return (
      this.completionData.medications.length > 0 &&
      this.completionData.medications.some((med) => med.drug)
    );
  }

  openCompletionModal(id: number) {
    this.selectedAppointment =
      this.appointments.find((a) => a.id === id) || null;
    if (this.selectedAppointment) {
      this.showCompletionModal = true;
      // Reset completion data
      this.completionData = {
        diagnosis: '',
        date: '',
        vitals: { bloodPressure: '', heartRate: '', temperature: '', spO2: '' },
        medications: [
          { drug: '', dose: '', route: '', frequency: '', activity: 'active' },
        ],
        labTests: { cbc: '', lft: '', creatinine: '', hba1c: '' },
        billing: {
          consultationType: '',
          consultationFee: '',
          labFee: '',
          medicineFee: '',
          total: '',
        },
      };
      // Set current date
      this.completionData.date = new Date().toISOString().split('T')[0];

      this.addingDiagnosis = false;
      this.addingVitals = false;
      this.addingMedications = false;
      this.addingBilling = false;
    }
  }

  addMedication() {
    this.completionData.medications.push({
      drug: '',
      dose: '',
      route: '',
      frequency: '',
      activity: 'active',
    });
  }

  removeMedication(index: number) {
    this.completionData.medications.splice(index, 1);
  }

  submitCompletion() {
    if (!this.selectedAppointment) return;

    // Calculate total
    this.calculateTotal();

    // First, submit diagnosis to backend API if diagnosis is provided
    if (this.completionData.diagnosis && this.completionData.diagnosis.trim()) {
      console.log(
        'Submitting diagnosis for appointment:',
        this.selectedAppointment,
      );

      this.doctorService
        .completeAppointmentWithDiagnosis(
          this.selectedAppointment,
          this.completionData.diagnosis,
        )
        .subscribe({
          next: (diagnosisResponse) => {
            console.log('Diagnosis submitted successfully:', diagnosisResponse);

            // After successful diagnosis submission, update appointment status to COMPLETED
            this.updateAppointmentStatusToCompleted();
          },
          error: (error) => {
            console.error('Error submitting diagnosis:', error);
            alert(
              'Error completing appointment with diagnosis. Please try again.',
            );
          },
        });
    } else {
      // If no diagnosis provided, just update status to completed
      this.updateAppointmentStatusToCompleted();
    }
  }

  private updateAppointmentStatusToCompleted() {
    if (!this.selectedAppointment) return;

    console.log(
      'Updating appointment status to COMPLETED for:',
      this.selectedAppointment,
    );

    this.doctorService
      .markAppointmentCompleted(this.selectedAppointment)
      .subscribe({
        next: (statusResponse) => {
          console.log(
            'Appointment status updated to COMPLETED:',
            statusResponse,
          );
          // Only update local appointment status in the UI if API call succeeded
          if (this.selectedAppointment) {
            this.selectedAppointment.status = 'COMPLETED';
            const appointmentIndex = this.appointments.findIndex(
              (app) => app.id === this.selectedAppointment!.id,
            );
            if (appointmentIndex !== -1) {
              this.appointments[appointmentIndex].status = 'COMPLETED';
            }
            this.processLocalCompletionData();
            alert(
              'Appointment completed successfully! Status updated to COMPLETED ✅',
            );
            this.loadAppointmentsFromAPI();
          }
        },
        error: (error) => {
          console.error('Error updating appointment status:', error);
          // Do NOT update status if API call failed
          alert(
            'Failed to update appointment status in database. Please try again.',
          );
        },
      });
  }

  private processLocalCompletionData() {
    if (!this.selectedAppointment) return;

    const consultation: Consultation = {
      id: Date.now(),
      patientId: this.selectedAppointment.id,
      patientName: this.selectedAppointment.patientName,
      date: this.selectedAppointment.date,
      diagnosis: this.completionData.diagnosis,
      labResults: [],
      vitals: this.completionData.vitals,
      medications: this.completionData.medications,
      labTests: this.completionData.labTests,
      billing: this.completionData.billing,
    };

    this.doctorService.addConsultation(consultation);
    this.doctorService.completeAppointment(this.selectedAppointment.id);

    // Create invoice
    const totalAmount = parseFloat(this.completionData.billing.total) || 0;
    const invoice: Invoice = {
      id: 'INV' + Date.now(),
      patientId: this.selectedAppointment.id,
      patientName: this.selectedAppointment.patientName,
      amount: totalAmount,
      paymentStatus: 'PAID',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0], // 30 days from now
      paymentMethod: '',
      transactionId: '',
      consultationType:
        this.completionData.billing.consultationType || 'General Consultation',
      consultationFee:
        parseFloat(this.completionData.billing.consultationFee) || 0,
      labFee: parseFloat(this.completionData.billing.labFee) || 0,
      medicineFee: parseFloat(this.completionData.billing.medicineFee) || 0,
      otherCharges: 0,
      subtotal: totalAmount,
    };
    this.doctorService.addInvoice(invoice);

    // Update patient history
    const patient = this.doctorService.getPatientById(
      this.selectedAppointment.id,
    );
    if (patient) {
      const updatedPatient = { ...patient };
      if (this.completionData.diagnosis) {
        updatedPatient.diagnosis = this.completionData.diagnosis;
      }
      if (this.completionData.medications.length > 0) {
        const medicationList = this.completionData.medications
          .filter((med) => med.drug)
          .map((med) => `${med.drug} ${med.dose} ${med.route} ${med.frequency}`)
          .join(', ');
        updatedPatient.ongoingTreatment = medicationList;
      }
      updatedPatient.lastAppointment = this.selectedAppointment.date;
      this.doctorService.updatePatient(updatedPatient);
    }

    this.showCompletionModal = false;
    this.selectedAppointment = null;
  }

  cancelAppointment(id: number) {
    this.doctorService.cancelAppointment(id);
  }

  private openSection(section: string) {
    this.addingDiagnosis = false;
    this.addingVitals = false;
    this.addingMedications = false;
    this.addingBilling = false;
    this.activeSection = section;

    if (section === 'diagnosis') {
      this.addingDiagnosis = true;
    } else if (section === 'vitals') {
      this.addingVitals = true;
    } else if (section === 'medications') {
      this.addingMedications = true;
    } else if (section === 'billing') {
      this.addingBilling = true;
    }
  }

  private openNextSection(currentSection: string) {
    if (currentSection === 'diagnosis') {
      this.openSection('vitals');
      return;
    }

    if (currentSection === 'vitals') {
      this.openSection('medications');
      return;
    }

    if (currentSection === 'medications') {
      this.openSection('billing');
      return;
    }

    this.openSection('');
  }

  startAddDiagnosis() {
    this.openSection('diagnosis');
  }

  startAddVitals() {
    this.openSection('vitals');
  }

  startAddMedications() {
    this.openSection('medications');
  }

  startAddBilling() {
    this.openSection('billing');
  }

  saveDiagnosis() {
    this.addingDiagnosis = false;
    this.openNextSection('diagnosis');
  }

  saveVitals() {
    // Check if vitals data exists and appointment is selected
    if (!this.selectedAppointment) {
      console.error('No appointment selected for vitals submission');
      return;
    }

    const vitalsData = this.completionData.vitals;

    // Validate at least one vital is provided
    if (
      !vitalsData.bloodPressure &&
      !vitalsData.heartRate &&
      !vitalsData.temperature &&
      !vitalsData.spO2
    ) {
      console.warn('No vitals data provided');
      this.addingVitals = false;
      return;
    }

    // Call API to save vitals
    console.log('Saving vitals for appointment:', this.selectedAppointment);

    this.doctorService
      .completeAppointmentWithVitals(this.selectedAppointment, vitalsData)
      .subscribe({
        next: (response) => {
          console.log('Vitals saved successfully:', response);
          this.openNextSection('vitals');
          // Show success message (you can add a toast notification here)
          alert('Vitals saved successfully!');
        },
        error: (error) => {
          console.error('Error saving vitals:', error);
          // Show error message (you can add a toast notification here)
          alert('Failed to save vitals. Please try again.');
          // Don't close the vitals section on error to allow retry
        },
      });
  }

  cancelVitals() {
    this.addingVitals = false;
    // Optionally reset vitals data
    this.completionData.vitals = {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      spO2: '',
    };
  }

  saveMedications() {
    // Check if appointment is selected
    if (!this.selectedAppointment) {
      console.error('No appointment selected for medications submission');
      return;
    }

    const medicationsData = this.completionData.medications;

    // Validate at least one medication with a drug name is provided
    const validMedications = medicationsData.filter(
      (med) => med.drug && med.drug.trim(),
    );
    if (validMedications.length === 0) {
      console.warn('No valid medications data provided');
      this.addingMedications = false;
      return;
    }

    // Call API to save medications
    console.log(
      'Saving medications for appointment:',
      this.selectedAppointment,
    );

    this.doctorService
      .completeAppointmentWithMedications(
        this.selectedAppointment,
        medicationsData,
      )
      .subscribe({
        next: (responses) => {
          console.log('Medications saved successfully:', responses);
          this.openNextSection('medications');
          // Show success message
          alert(`${responses.length} medication(s) saved successfully!`);
        },
        error: (error) => {
          console.error('Error saving medications:', error);
          // Show error message
          alert('Failed to save medications. Please try again.');
          // Don't close the medications section on error to allow retry
        },
      });
  }

  cancelMedications() {
    this.addingMedications = false;
    // Optionally reset medications data
    this.completionData.medications = [];
  }

  saveBilling() {
    // Check if appointment is selected
    if (!this.selectedAppointment) {
      console.error('No appointment selected for billing submission');
      return;
    }

    const billingData = this.completionData.billing;

    // Validate billing data - at least consultation type should be provided
    if (
      !billingData.consultationType &&
      !billingData.consultationFee &&
      !billingData.total
    ) {
      console.warn('No billing data provided');
      this.addingBilling = false;
      return;
    }

    // Ensure total is calculated
    if (!billingData.total) {
      this.calculateTotal();
    }

    // Call API to save invoice
    console.log('Saving billing for appointment:', this.selectedAppointment);

    this.doctorService
      .completeAppointmentWithInvoice(this.selectedAppointment, billingData)
      .subscribe({
        next: (response) => {
          console.log('Invoice saved successfully:', response);
          this.openNextSection('billing');
          // Show success message
          alert('Invoice saved successfully!');
        },
        error: (error) => {
          console.error('Error saving invoice:', error);
          // Show error message
          alert('Failed to save invoice. Please try again.');
          // Don't close the billing section on error to allow retry
        },
      });
  }

  cancelBilling() {
    this.addingBilling = false;
    // Optionally reset billing data
    this.completionData.billing = {
      consultationType: '',
      consultationFee: '',
      labFee: '',
      medicineFee: '',
      total: '',
    };
  }

  // EMR Navigation method
  openEMRModal(consultation: Consultation) {
    this.router.navigate(['/doctor/emr'], {
      queryParams: { consultationId: consultation.id },
    });
  }

  closeEMRModal() {
    this.showEMRModal = false;
    this.selectedConsultation = null;
    this.addingDiagnosis = false;
  }

  downloadAppointmentReport() {
    if (!this.selectedAppointment) return;

    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFillColor(10, 91, 143);
    doc.rect(0, 0, pageWidth, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Appointment Completion Report', 20, 18);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    doc.text(`Patient: `, 20, 40);
    doc.setFont('helvetica', 'bold');
    doc.text(`${this.selectedAppointment.patientName}`, 60, 40);

    doc.setFont('helvetica', 'normal');
    doc.text(`Date: `, 20, 50);
    doc.setFont('helvetica', 'bold');
    doc.text(`${this.selectedAppointment.date}`, 60, 50);

    doc.setFont('helvetica', 'normal');
    doc.text(`Diagnosis: `, 20, 60);
    doc.setFont('helvetica', 'bold');
    doc.text(`${this.completionData.diagnosis || 'Not provided'}`, 60, 60);

    let yPos = 78;

    const drawSectionTitle = (title: string, y: number) => {
      doc.setTextColor(10, 91, 143);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(title, 20, y);
      doc.setDrawColor(214, 230, 245);
      doc.line(20, y + 2, pageWidth - 20, y + 2);
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
    };

    if (
      this.completionData.vitals.bloodPressure ||
      this.completionData.vitals.heartRate ||
      this.completionData.vitals.temperature ||
      this.completionData.vitals.spO2
    ) {
      drawSectionTitle('Vitals', yPos);
      doc.setFont('helvetica', 'normal');
      if (this.completionData.vitals.bloodPressure)
        doc.text(
          `Blood Pressure: ${this.completionData.vitals.bloodPressure}`,
          30,
          yPos + 10,
        );
      if (this.completionData.vitals.heartRate)
        doc.text(
          `Heart Rate: ${this.completionData.vitals.heartRate}`,
          30,
          yPos + 20,
        );
      if (this.completionData.vitals.temperature)
        doc.text(
          `Temperature: ${this.completionData.vitals.temperature}`,
          30,
          yPos + 30,
        );
      if (this.completionData.vitals.spO2)
        doc.text(`SpO2: ${this.completionData.vitals.spO2}`, 30, yPos + 40);
      yPos += 62;
    }

    if (
      this.completionData.medications.length > 0 &&
      this.completionData.medications.some((m) => m.drug)
    ) {
      drawSectionTitle('Medications', yPos);
      doc.setFont('helvetica', 'normal');
      this.completionData.medications
        .filter((m) => m.drug)
        .forEach((med, i) => {
          doc.text(
            `- ${med.drug} (${med.dose}, ${med.route}, ${med.frequency}, ${med.activity})`,
            30,
            yPos + 10 + i * 10,
          );
        });
      yPos +=
        20 + this.completionData.medications.filter((m) => m.drug).length * 10;
    }

    if (
      this.completionData.billing.consultationFee ||
      this.completionData.billing.labFee ||
      this.completionData.billing.medicineFee
    ) {
      drawSectionTitle('Billing', yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Type: ${this.completionData.billing.consultationType || 'N/A'}`,
        30,
        yPos + 10,
      );
      doc.text(
        `Consultation Fee: $${this.completionData.billing.consultationFee}`,
        30,
        yPos + 20,
      );
      doc.text(
        `Lab Fee: $${this.completionData.billing.labFee}`,
        30,
        yPos + 30,
      );
      doc.text(
        `Medicine Fee: $${this.completionData.billing.medicineFee}`,
        30,
        yPos + 40,
      );
      doc.text(`Total: $${this.completionData.billing.total}`, 30, yPos + 50);
    }

    doc.save(`${this.selectedAppointment.patientName}_Appointment_Report.pdf`);
  }

  downloadEMRReport() {
    // Implement download logic here
    console.log(
      'Downloading EMR Report for',
      this.selectedConsultation?.patientName,
    );
  }

  addLabResult(patientId: number, labResult: any) {
    // Implement add lab result logic
    console.log('Adding lab result for patient', patientId, labResult);
    this.addingDiagnosis = false;
    this.newLabResult = { testName: '', value: '', unit: '', notes: '' };
  }

  cancelDiagnosis() {
    this.addingDiagnosis = false;
    this.newDiagnosis = '';
    this.newLabResult = { testName: '', value: '', unit: '', notes: '' };
  }

  calculateTotal() {
    const consultation =
      parseFloat(this.completionData.billing.consultationFee) || 0;
    const lab = parseFloat(this.completionData.billing.labFee) || 0;
    const medicine = parseFloat(this.completionData.billing.medicineFee) || 0;
    this.completionData.billing.total = (
      consultation +
      lab +
      medicine
    ).toString();
  }
}
