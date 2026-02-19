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

      // Automatically open Diagnosis section by default
      this.openSection('diagnosis');
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
    
    // Clear the date filter to show all appointments
    this.appointmentFilterDate = '';
    
    // Reload appointments to reflect the status change
    this.loadAppointmentsFromAPI();
  }

  cancelAppointment(id: number) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      // Find the appointment to get the real API ID (UUID)
      const appointment = this.appointments.find(a => a.id === id);
      if (!appointment || !(appointment as any).apiData) {
        alert('Error: Could not find appointment details.');
        return;
      }

      const realAppointmentId = (appointment as any).apiData.id; // Get the UUID from apiData
      console.log('Cancelling appointment with UUID:', realAppointmentId);

      // Call the API to update the appointment status in the database
      this.doctorService.cancelAppointmentInDB(realAppointmentId).subscribe({
        next: () => {
          console.log('Appointment cancelled successfully');
          alert('Appointment cancelled successfully ❌');
          // Update local state
          this.doctorService.cancelAppointment(id);
          // Reload appointments to reflect changes
          this.loadAppointmentsFromAPI();
        },
        error: (err: any) => {
          console.error('Error cancelling appointment:', err);
          alert('Failed to cancel appointment. Please try again.');
        }
      });
    }
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
    // Check if appointment is selected and diagnosis is provided
    if (!this.selectedAppointment) {
      console.error('No appointment selected for diagnosis submission');
      return;
    }

    const diagnosisData = this.completionData.diagnosis;

    // Validate diagnosis is provided
    if (!diagnosisData || !diagnosisData.trim()) {
      console.warn('No diagnosis data provided');
      alert('Please enter a diagnosis before saving.');
      return;
    }

    // Call API to save diagnosis
    console.log('Saving diagnosis for appointment:', this.selectedAppointment);

    this.doctorService
      .completeAppointmentWithDiagnosis(this.selectedAppointment, diagnosisData)
      .subscribe({
        next: (response) => {
          console.log('Diagnosis saved successfully:', response);
          this.addingDiagnosis = false;
          this.openNextSection('diagnosis');
          // Show success message
          alert('Diagnosis saved successfully!');
        },
        error: (error) => {
          console.error('Error saving diagnosis:', error);
          // Show error message
          alert('Failed to save diagnosis. Please try again.');
          // Don't close the diagnosis section on error to allow retry
        },
      });
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
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Document Title
    doc.setTextColor(8, 71, 113);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Medical Appointment Record', pageWidth / 2, yPos, { align: 'center' });
    
    // Horizontal divider
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 4, pageWidth - 20, yPos + 4);

    yPos = 32;
    doc.setTextColor(0, 0, 0);

    // Helper function to draw section headers
    const drawSectionHeader = (title: string, y: number) => {
      doc.setFillColor(240, 248, 255); // Light blue background
      doc.rect(20, y - 5, pageWidth - 40, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(8, 71, 113);
      doc.text(title, 25, y);
      doc.setTextColor(0, 0, 0);
      return y + 10;
    };

    // Helper function to draw field with label
    const drawField = (label: string, value: string, x: number, y: number) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(label + ':', x, y);
      doc.setFont('helvetica', 'normal');
      const labelWidth = doc.getTextWidth(label + ': ') + 2; // Add 2pt spacing
      doc.text(value, x + labelWidth, y);
    };

    // Patient Demographics Section
    yPos = drawSectionHeader('Patient Information', yPos);
    
    const appointmentDate = new Date(this.selectedAppointment.date);
    
    drawField('Patient Name', this.selectedAppointment.patientName, 25, yPos);
    yPos += 7;
    drawField('Appointment Date', appointmentDate.toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    }), 25, yPos);
    yPos += 7;
    drawField('Appointment Time', this.selectedAppointment.time, 25, yPos);
    
    yPos += 12;

    // Clinical Assessment Section
    yPos = drawSectionHeader('CLINICAL ASSESSMENT', yPos);
    
    if (this.completionData.diagnosis) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Primary Diagnosis:', 25, yPos);
      doc.setFont('helvetica', 'normal');
      const diagnosisLines = doc.splitTextToSize(this.completionData.diagnosis, pageWidth - 50);
      doc.text(diagnosisLines, 25, yPos + 8);
      yPos += 8 + (diagnosisLines.length * 5) + 6;
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.text('No diagnosis recorded', 25, yPos);
      yPos += 12;
    }

    // Vital Signs Section
    if (
      this.completionData.vitals.bloodPressure ||
      this.completionData.vitals.heartRate ||
      this.completionData.vitals.temperature ||
      this.completionData.vitals.spO2
    ) {
      yPos = drawSectionHeader('Vital Signs', yPos);
      
      doc.setFontSize(9);
      
      // Blood Pressure
      if (this.completionData.vitals.bloodPressure) {
        doc.setFont('helvetica', 'bold');
        doc.text('BP:', 25, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(`${this.completionData.vitals.bloodPressure} mmHg`, 35, yPos);
      }
      
      // Heart Rate
      if (this.completionData.vitals.heartRate) {
        doc.setFont('helvetica', 'bold');
        doc.text('HR:', 95, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(`${this.completionData.vitals.heartRate} bpm`, 105, yPos);
      }
      yPos += 5;
      
      // Temperature
      if (this.completionData.vitals.temperature) {
        doc.setFont('helvetica', 'bold');
        doc.text('Temp:', 25, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(`${this.completionData.vitals.temperature}°F`, 40, yPos);
      }
      
      // SpO2
      if (this.completionData.vitals.spO2) {
        doc.setFont('helvetica', 'bold');
        doc.text('SpO2:', 95, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(`${this.completionData.vitals.spO2}%`, 110, yPos);
      }
      
      yPos += 8;
      doc.setFontSize(10);
    }

    // Medications Prescribed Section
    if (
      this.completionData.medications.length > 0 &&
      this.completionData.medications.some((m) => m.drug)
    ) {
      yPos = drawSectionHeader('Medications Prescribed', yPos);
      
      this.completionData.medications
        .filter((m) => m.drug)
        .forEach((med, i) => {
          doc.setFont('helvetica', 'bold');
          doc.text(`${i + 1}. ${med.drug}`, 25, yPos + (i * 20));
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.text(`Dosage: ${med.dose}`, 30, yPos + (i * 20) + 6);
          doc.text(`Route: ${med.route} | Frequency: ${med.frequency}`, 30, yPos + (i * 20) + 11);
          doc.text(`Instructions: ${med.activity}`, 30, yPos + (i * 20) + 16);
          doc.setFontSize(10);
        });
      
      yPos += this.completionData.medications.filter((m) => m.drug).length * 20 + 6;
    }

    // Billing Information Section
    if (
      this.completionData.billing.consultationFee ||
      this.completionData.billing.labFee ||
      this.completionData.billing.medicineFee
    ) {
      yPos = drawSectionHeader('Billing Summary', yPos);
      
      drawField('Consultation Type', this.completionData.billing.consultationType || 'N/A', 25, yPos);
      yPos += 10;
      
      // Billing table
      const billingY = yPos;
      doc.setFont('helvetica', 'bold');
      doc.text('Service', 25, billingY);
      doc.text('Amount', 150, billingY);
      
      doc.setLineWidth(0.3);
      doc.line(25, billingY + 2, pageWidth - 25, billingY + 2);
      
      doc.setFont('helvetica', 'normal');
      doc.text('Consultation Fee', 25, billingY + 10);
      doc.text(`${(parseFloat(this.completionData.billing.consultationFee) || 0).toFixed(2)}`, 150, billingY + 10);
      
      doc.text('Laboratory Fee', 25, billingY + 18);
      doc.text(`${(parseFloat(this.completionData.billing.labFee) || 0).toFixed(2)}`, 150, billingY + 18);
      
      doc.text('Medicine Fee', 25, billingY + 26);
      doc.text(`${(parseFloat(this.completionData.billing.medicineFee) || 0).toFixed(2)}`, 150, billingY + 26);
      
      doc.setLineWidth(0.5);
      doc.line(25, billingY + 30, pageWidth - 25, billingY + 30);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Total Amount', 25, billingY + 38);
      doc.text(`${(parseFloat(this.completionData.billing.total) || 0).toFixed(2)}`, 150, billingY + 38);
      
      yPos = billingY + 50;
    }

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('This is a computer-generated medical record and does not require a signature.', pageWidth / 2, pageHeight - 20, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString('en-US')}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
    doc.text('Page 1 of 1', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Save with professional filename
    const fileName = `${this.selectedAppointment.patientName.replace(/\s+/g, '_')}_Medical_Record_${appointmentDate.toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
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
