import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DoctorDataService, Appointment, Consultation, Invoice} from '../../services/doctor-data.service';
import { AuthService } from '../../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import jsPDF from 'jspdf';

export enum AppointmentStatus {
  BOOKED = 'BOOKED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
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
  slotDate = '';
  slotStartTime = '';
  slotEndTime = '';
  availableSlots: { date: string; times: string[] }[] = [];

  // API Statistics
  appointmentApiStats: { doctorId: string; totalAppointments: number } | null = null;

  showCompletionModal: boolean = false;
  selectedAppointment: Appointment | null = null;
  completionData = {
    diagnosis: '',
    date: '',
    vitals: { bloodPressure: '', heartRate: '', temperature: '', spO2: '' },
    medications: [] as { drug: string; dose: string; route: string; frequency: string; activity: string }[],
    labTests: { cbc: '', lft: '', creatinine: '', hba1c: '' },
    billing: { consultationType: '', consultationFee: '', labFee: '', medicineFee: '', total: '' }
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
    private authService: AuthService
  ) {}

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
  }

  private loadAppointmentsFromAPI(): void {
    // Try to get doctor ID from multiple sources
    const currentDoctor = this.doctorService.getDoctor();
    const currentUser = this.authService.currentUserValue;
    
    console.log('Current doctor data:', currentDoctor);
    console.log('Current user data:', currentUser);
    
    let doctorId = null;
    
    // Try to get doctor ID from doctor service first
    if (currentDoctor && currentDoctor.id) {
      doctorId = currentDoctor.id;
    }
    // Fallback to user ID from auth service (assuming user ID = doctor ID)
    else if (currentUser && currentUser.id) {
      doctorId = currentUser.id;
    }
    
    if (doctorId) {
      console.log('Loading appointments for doctor ID:', doctorId);
      this.doctorService.loadAppointmentsFromApi(doctorId);
    } else {
      console.log('No doctor ID available, keeping mock data');
      console.log('Available data - Doctor:', currentDoctor, 'User:', currentUser);
    }
  }

  // 🔹 Get patient name from appointment data
  getPatientName(appointment: Appointment): string {
    // Return the patient identifier (already set by the service based on patient ID)
    return appointment.patientName || 'Unknown Patient';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addSlot() {
    if (this.slotDate && this.slotStartTime && this.slotEndTime) {
      const timeRange = `${this.slotStartTime}-${this.slotEndTime}`;
      this.doctorService.addSlot(this.slotDate, timeRange);
      this.slotDate = '';
      this.slotStartTime = '';
      this.slotEndTime = '';
    }
  }

  removeSlot(date: string, time: string) {
    this.doctorService.removeSlot(date, time);
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
    return this.completionData.medications.length > 0 && this.completionData.medications.some(med => med.drug);
  }

  openCompletionModal(id: number) {
    this.selectedAppointment = this.appointments.find(a => a.id === id) || null;
    if (this.selectedAppointment) {
      this.showCompletionModal = true;
      // Reset completion data
      this.completionData = {
        diagnosis: '',
        date: '',
        vitals: { bloodPressure: '', heartRate: '', temperature: '', spO2: '' },
        medications: [{ drug: '', dose: '', route: '', frequency: '', activity: 'active' }],
        labTests: { cbc: '', lft: '', creatinine: '', hba1c: '' },
        billing: { consultationType: '', consultationFee: '', labFee: '', medicineFee: '', total: '' }
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
    this.completionData.medications.push({ drug: '', dose: '', route: '', frequency: '', activity: 'active' });
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
      console.log('Submitting diagnosis for appointment:', this.selectedAppointment);
      
      this.doctorService.completeAppointmentWithDiagnosis(
        this.selectedAppointment, 
        this.completionData.diagnosis
      ).subscribe({
        next: (diagnosisResponse) => {
          console.log('Diagnosis submitted successfully:', diagnosisResponse);
          
          // After successful diagnosis submission, update appointment status to COMPLETED
          this.updateAppointmentStatusToCompleted();
        },
        error: (error) => {
          console.error('Error submitting diagnosis:', error);
          alert('Error completing appointment with diagnosis. Please try again.');
        }
      });
    } else {
      // If no diagnosis provided, just update status to completed
      this.updateAppointmentStatusToCompleted();
    }
  }

  private updateAppointmentStatusToCompleted() {
    if (!this.selectedAppointment) return;

    console.log('Updating appointment status to COMPLETED for:', this.selectedAppointment);
    
    this.doctorService.markAppointmentCompleted(this.selectedAppointment).subscribe({
      next: (statusResponse) => {
        console.log('Appointment status updated to COMPLETED:', statusResponse);
        // Only update local appointment status in the UI if API call succeeded
        if (this.selectedAppointment) {
          this.selectedAppointment.status = 'COMPLETED';
          const appointmentIndex = this.appointments.findIndex(app => app.id === this.selectedAppointment!.id);
          if (appointmentIndex !== -1) {
            this.appointments[appointmentIndex].status = 'COMPLETED';
          }
          this.processLocalCompletionData();
          alert('Appointment completed successfully! Status updated to COMPLETED ✅');
        }
      },
      error: (error) => {
        console.error('Error updating appointment status:', error);
        // Do NOT update status if API call failed
        alert('Failed to update appointment status in database. Please try again.');
      }
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
      billing: this.completionData.billing
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
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      paymentMethod: '',
      transactionId: '',
      consultationType: this.completionData.billing.consultationType || 'General Consultation',
      consultationFee: parseFloat(this.completionData.billing.consultationFee) || 0,
      labFee: parseFloat(this.completionData.billing.labFee) || 0,
      medicineFee: parseFloat(this.completionData.billing.medicineFee) || 0,
      otherCharges: 0,
      subtotal: totalAmount
    };
    this.doctorService.addInvoice(invoice);

    // Update patient history
    const patient = this.doctorService.getPatientById(this.selectedAppointment.id);
    if (patient) {
      const updatedPatient = { ...patient };
      if (this.completionData.diagnosis) {
        updatedPatient.diagnosis = this.completionData.diagnosis;
      }
      if (this.completionData.medications.length > 0) {
        const medicationList = this.completionData.medications
          .filter(med => med.drug)
          .map(med => `${med.drug} ${med.dose} ${med.route} ${med.frequency}`)
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

  startAddDiagnosis() {
    this.addingVitals = false;
    this.addingMedications = false;
    this.addingBilling = false;
    this.addingDiagnosis = true;
    this.activeSection = 'diagnosis';
  }

  startAddVitals() {
    this.addingVitals = true;
    this.addingMedications = false;
    this.addingBilling = false;
    this.addingDiagnosis = false;
    this.activeSection = 'vitals';
  }

  startAddMedications() {
    this.addingVitals = false;
    this.addingMedications = true;
    this.addingBilling = false;
    this.addingDiagnosis = false;
    this.activeSection = 'medications';
  }

  startAddBilling() {
    this.addingVitals = false;
    this.addingMedications = false;
    this.addingBilling = true;
    this.addingDiagnosis = false;
    this.activeSection = 'billing';
  }



  saveVitals() {
    // Check if vitals data exists and appointment is selected
    if (!this.selectedAppointment) {
      console.error('No appointment selected for vitals submission');
      return;
    }

    const vitalsData = this.completionData.vitals;
    
    // Validate at least one vital is provided
    if (!vitalsData.bloodPressure && !vitalsData.heartRate && !vitalsData.temperature && !vitalsData.spO2) {
      console.warn('No vitals data provided');
      this.addingVitals = false;
      return;
    }

    // Call API to save vitals
    console.log('Saving vitals for appointment:', this.selectedAppointment);
    
    this.doctorService.completeAppointmentWithVitals(this.selectedAppointment, vitalsData).subscribe({
      next: (response) => {
        console.log('Vitals saved successfully:', response);
        this.addingVitals = false;
        // Show success message (you can add a toast notification here)
        alert('Vitals saved successfully!');
      },
      error: (error) => {
        console.error('Error saving vitals:', error);
        // Show error message (you can add a toast notification here)
        alert('Failed to save vitals. Please try again.');
        // Don't close the vitals section on error to allow retry
      }
    });
  }

  cancelVitals() {
    this.addingVitals = false;
    // Optionally reset vitals data
    this.completionData.vitals = { bloodPressure: '', heartRate: '', temperature: '', spO2: '' };
  }

  saveMedications() {
    // Check if appointment is selected
    if (!this.selectedAppointment) {
      console.error('No appointment selected for medications submission');
      return;
    }

    const medicationsData = this.completionData.medications;
    
    // Validate at least one medication with a drug name is provided
    const validMedications = medicationsData.filter(med => med.drug && med.drug.trim());
    if (validMedications.length === 0) {
      console.warn('No valid medications data provided');
      this.addingMedications = false;
      return;
    }

    // Call API to save medications
    console.log('Saving medications for appointment:', this.selectedAppointment);
    
    this.doctorService.completeAppointmentWithMedications(this.selectedAppointment, medicationsData).subscribe({
      next: (responses) => {
        console.log('Medications saved successfully:', responses);
        this.addingMedications = false;
        // Show success message
        alert(`${responses.length} medication(s) saved successfully!`);
      },
      error: (error) => {
        console.error('Error saving medications:', error);
        // Show error message
        alert('Failed to save medications. Please try again.');
        // Don't close the medications section on error to allow retry
      }
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
    if (!billingData.consultationType && !billingData.consultationFee && !billingData.total) {
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
    
    this.doctorService.completeAppointmentWithInvoice(this.selectedAppointment, billingData).subscribe({
      next: (response) => {
        console.log('Invoice saved successfully:', response);
        this.addingBilling = false;
        // Show success message
        alert('Invoice saved successfully!');
      },
      error: (error) => {
        console.error('Error saving invoice:', error);
        // Show error message
        alert('Failed to save invoice. Please try again.');
        // Don't close the billing section on error to allow retry
      }
    });
  }

  cancelBilling() {
    this.addingBilling = false;
    // Optionally reset billing data
    this.completionData.billing = { consultationType: '', consultationFee: '', labFee: '', medicineFee: '', total: '' };
  }

  // EMR Navigation method
  openEMRModal(consultation: Consultation) {
    this.router.navigate(['/doctor/emr'], { queryParams: { consultationId: consultation.id } });
  }

  closeEMRModal() {
    this.showEMRModal = false;
    this.selectedConsultation = null;
    this.addingDiagnosis = false;
  }

  downloadAppointmentReport() {
    if (!this.selectedAppointment) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Appointment Completion Report', 20, 20);

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

    let yPos = 80;

    if (this.completionData.vitals.bloodPressure || this.completionData.vitals.heartRate || this.completionData.vitals.temperature || this.completionData.vitals.spO2) {
      doc.setFont('helvetica', 'normal');
      doc.text(`Vitals:`, 20, yPos);
      doc.setFont('helvetica', 'bold');
      if (this.completionData.vitals.bloodPressure) doc.text(`Blood Pressure: ${this.completionData.vitals.bloodPressure}`, 30, yPos + 10);
      if (this.completionData.vitals.heartRate) doc.text(`Heart Rate: ${this.completionData.vitals.heartRate}`, 30, yPos + 20);
      if (this.completionData.vitals.temperature) doc.text(`Temperature: ${this.completionData.vitals.temperature}`, 30, yPos + 30);
      if (this.completionData.vitals.spO2) doc.text(`SpO2: ${this.completionData.vitals.spO2}`, 30, yPos + 40);
      yPos += 60;
    }

    if (this.completionData.medications.length > 0 && this.completionData.medications.some(m => m.drug)) {
      doc.setFont('helvetica', 'normal');
      doc.text(`Medications:`, 20, yPos);
      doc.setFont('helvetica', 'bold');
      this.completionData.medications.filter(m => m.drug).forEach((med, i) => {
        doc.text(`- ${med.drug} (${med.dose}, ${med.route}, ${med.frequency}, ${med.activity})`, 30, yPos + 10 + i * 10);
      });
      yPos += 20 + this.completionData.medications.filter(m => m.drug).length * 10;
    }

    if (this.completionData.billing.consultationFee || this.completionData.billing.labFee || this.completionData.billing.medicineFee) {
      doc.setFont('helvetica', 'normal');
      doc.text(`Billing:`, 20, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(`Type: ${this.completionData.billing.consultationType || 'N/A'}`, 30, yPos + 10);
      doc.text(`Consultation Fee: $${this.completionData.billing.consultationFee}`, 30, yPos + 20);
      doc.text(`Lab Fee: $${this.completionData.billing.labFee}`, 30, yPos + 30);
      doc.text(`Medicine Fee: $${this.completionData.billing.medicineFee}`, 30, yPos + 40);
      doc.text(`Total: $${this.completionData.billing.total}`, 30, yPos + 50);
      
    }

    doc.save(`${this.selectedAppointment.patientName}_Appointment_Report.pdf`);
  }

  downloadEMRReport() {
    // Implement download logic here
    console.log('Downloading EMR Report for', this.selectedConsultation?.patientName);
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
    const consultation = parseFloat(this.completionData.billing.consultationFee) || 0;
    const lab = parseFloat(this.completionData.billing.labFee) || 0;
    const medicine = parseFloat(this.completionData.billing.medicineFee) || 0;
    this.completionData.billing.total = (consultation + lab + medicine).toString();
  }
}
