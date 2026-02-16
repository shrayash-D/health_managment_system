import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { USER_API_ENDPOINTS, DOCTOR_API_ENDPOINTS } from '../constants/api/api-endpoints';
import { AuthService } from './auth.service';

export interface Appointment {
  id: number;
  patientName: string;
  date: string;
  time: string;
  type: 'new' | 'followup';
  status: 'BOOKED' | 'COMPLETED' | 'CANCELLED' | '';
  // Optional API data for enhanced functionality
  apiData?: AppointmentFromAPI;
}


export interface Patient {
  id: number;
  name: string;
  dob: string;
  contact: string;
  medicalHistory: string;
  mrn: string;
  sex: 'Male' | 'Female' | 'Other';
  diagnosis: string;
  ongoingTreatment: string;
  lastAppointment: string;
  nextAppointment: string;
  assignedDoctor: string;
  department: string;
  avatar?: string;
}


export interface Consultation {
  id: number;
  patientId: number;
  patientName: string;
  date: string;
  diagnosis: string;
  previousDiagnosis?: string;
  labResults: string[];
  prescriptions?: string[];
  vitals?: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    spO2: string;
  };
  medications?: {
    drug: string;
    dose: string;
    route: string;
    frequency: string;
    activity: string;
  }[];
  labTests?: {
    cbc: string;
    lft: string;
    creatinine: string;
    hba1c: string;
  };
  billing?: {
    consultationType: string;
    consultationFee: string;
    labFee: string;
    medicineFee: string;
    total: string;
  };
}

export interface Invoice {
  id: string;
  patientId: number;
  patientName: string;
  amount: number;
  paymentStatus: 'PAID' | 'PENDING' | 'OVERDUE';

  // NEW fields
  issueDate?: string;
  dueDate?: string;
  paidDate?: string;
  paymentMethod: string;
  transactionId: string;
  consultationType: string;

  consultationFee: number;
  labFee: number;
  medicineFee: number;
  otherCharges: number;
  subtotal: number;
}

// 🔹 API Response Interfaces
export interface DoctorApiResponse {
  id: string;
  userId: string;
  specialization: string;
  yearsOfExperience: number;
  memberSince?: string;
  bio: string;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    dob: string;
  };
  patients: any[];
  appointments: any[];
}

export interface UpdateDoctorProfileDto {
  name: string;
  specialization: string;
  yearsOfExperience: number;
  bio: string;
  phoneNumber: string;
}

// 🔹 Appointments API Interfaces
export interface AppointmentApiResponse {
  doctorId: string;
  totalAppointments: number;
  appointments: AppointmentFromAPI[];
}

export interface AppointmentFromAPI {
  id: string;
  doctorId: string;
  patientId: string;
  slotId: string;
  appointmentDate: string; // "2026-02-13T00:00:00"
  startTime: string; // "09:00:00"
  endTime: string; // "10:00:00"
  status: number; // 0 = BOOKED, 1 = COMPLETED, 2 = CANCELLED
  reason: string;
  patientName: string; // Real patient name from API
}

// 🔹 Diagnosis API Interfaces
export interface DiagnosisRequest {
  appointmentId: string;
  patientId: string;
  diagnosisDetails: string;
}

export interface DiagnosisResponse {
  id: string;
  appointmentId: string;
  patientId: string;
  diagnosisDetails: string;
}

// 🔹 Doctor Slot API Interfaces
export interface DoctorSlotRequest {
  doctorId: string;
  startDate: string; // ISO format: "2026-02-15T12:15:04.269Z"
  endDate: string;   // ISO format: "2026-02-15T12:15:04.269Z"
}

export interface DoctorSlotResponse {
  id: string;
  doctorId: string;
  startDate: string;
  endDate: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface DoctorSlotFromAPI {
  id: string;
  doctorId: string;
  startDate: string;
  endDate: string;
  isAvailable: boolean;
  createdAt: string;
}

// 🔹 Available Slots Response Interface
export interface AvailableSlot {
  slotId: string;
  date: string;         // ISO date: "2026-02-15"
  startTime: string;    // Time format: "09:00"
  endTime: string;      // Time format: "10:00"
  timeDisplay: string;  // Display format: "09:00 - 10:00"
}

export interface AvailableSlotsResponse {
  doctorId: string;
  doctorName: string;
  totalAvailableSlots: number;
  slots: AvailableSlot[];
}

// 🔹 Doctor Patients Response Interfaces
export interface DoctorPatientUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  dob: string;
}

export interface DoctorPatient {
  id: string;
  userId: string;
  doctorId: string;
  bloodGroup: string;
  address: string | null;
  profileImage: string;
  user: DoctorPatientUser;
  doctor: any | null;
  appointments: any[]; // Array of appointments
}

export interface DoctorPatientsResponse {
  doctorId: string;
  totalPatients: number;
  patients: DoctorPatient[];
}

// 🔹 Today's Appointments API Interfaces
export interface TodayAppointment {
  id: string;
  doctorId: string;
  patientId: string;
  slotId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: number; // 0 = scheduled, 1 = completed
  reason: string;
  patientName: string;
  vitals: any | null;
  medications: any[];
  invoice: any | null;
  diagnosis: any | null;
}

export interface TodayAppointmentsResponse {
  totalAppointments: number;
  appointments: TodayAppointment[];
}

// 🔹 Vitals API Interfaces
export interface VitalsRequest {
  appointmentId: string;
  patientId: string;
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  spO2: number;
}

export interface VitalsResponse {
  id: string;
  appointmentId: string;
  patientId: string;
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  spO2: number;
}

// 🔹 Medication API Interfaces
export interface MedicationRequest {
  appointmentId: string;
  patientId: string;
  drug: string;
  dose: string;
  route: string;
  frequency: string;
  activity: number;
}

export interface MedicationResponse {
  id: string;
  appointmentId: string;
  patientId: string;
  drug: string;
  dose: string;
  route: string;
  frequency: string;
  activity: number;
}

// 🔹 Invoice API Interfaces
export interface InvoiceRequest {
  appointmentId: string;
  patientId: string;
  consultationType: string;
  consulationFee: number; // Note: API has typo "consulationFee" instead of "consultationFee"
  labFee: number;
  medicineFee: number;
  total: number;
}

export interface InvoiceResponse {
  id: string;
  appointmentId: string;
  patientId: string;
  consultationType: string;
  consulationFee: number;
  labFee: number;
  medicineFee: number;
  total: number;
}

// 🔹 Appointment Status API Interfaces
export interface AppointmentStatusRequest {
  appointmentId: string;
  status: string;
}

export interface AppointmentStatusResponse {
  id: string;
  appointmentId: string;
  status: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorDataService {
  private apiUrl = environment.apiUrl || '';
  public authService = inject(AuthService);

  constructor(private http: HttpClient) {
    // Auto-load doctor data when user logs in with DOCTOR role
    this.authService.currentUser$.subscribe(user => {
      if (user && user.role === 'DOCTOR' && user.id) {
        console.log('Doctor user logged in, loading profile data for ID:', user.id);
        this.loadDoctorFromApi(user.id);
      } else if (!user) {
        // User logged out, reset to mock data
        this.resetToMockData();
      }
    });
    
    // Check if there's already a logged-in doctor user on service init
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.role === 'DOCTOR' && currentUser.id) {
      console.log('Doctor already logged in on service init, loading data...');
      this.loadDoctorFromApi(currentUser.id);
    }
  }

  // 🔹 Doctor profile data
  private doctorSubject = new BehaviorSubject<any>({
    id: 'p123',
    fullName: 'Dr. Sarah Johnson',
    email: 'dr.sarah@example.com',
    phone: '9876543210',
    countryCode: '+91',
    specialization: 'Cardiologist',
    bio: 'Experienced cardiologist with 10+ years in patient care.',
    role: 'Doctor',
    experience: '10+ years',
    photoUrl: localStorage.getItem('doctorPhoto') || null
  });

  doctor$ = this.doctorSubject.asObservable();

  // 🔹 Reset to mock data (when user logs out)
  private resetToMockData(): void {
    const mockData = {
      id: 'p123',
      fullName: 'Dr. Sarah Johnson',
      email: 'dr.sarah@example.com',
      phone: '9876543210',
      countryCode: '+91',
      specialization: 'Cardiologist',
      bio: 'Experienced cardiologist with 10+ years in patient care.',
      role: 'Doctor',
      experience: '10+ years',
      photoUrl: localStorage.getItem('doctorPhoto') || null
    };
    this.doctorSubject.next(mockData);
  }

  getDoctor() {
    return this.doctorSubject.value;
  }

  updateDoctor(updated: any): Observable<any> | void {
    // If only photoUrl is updated, handle locally (for photo upload)
    if (updated.photoUrl && Object.keys(updated).length === 1) {
      const newDoctor = { ...this.doctorSubject.value, ...updated };
      this.doctorSubject.next(newDoctor);
      localStorage.setItem('doctorPhoto', updated.photoUrl);
      return;
    }

    // For profile data updates, use API
    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !currentUser.id) {
      console.error('No authenticated user found for profile update');
      return;
    }

    // Map form data to API format
    const profileData: UpdateDoctorProfileDto = {
      name: updated.fullName || this.doctorSubject.value.fullName,
      specialization: updated.specialization || this.doctorSubject.value.specialization,
      yearsOfExperience: parseInt(updated.experience?.replace(/\D/g, '') || '0') || 0,
      bio: updated.bio || this.doctorSubject.value.bio || '',
      phoneNumber: `${updated.countryCode || this.doctorSubject.value.countryCode}${updated.phone || this.doctorSubject.value.phone}`
    };

    console.log('Updating profile with data:', profileData);
    console.log('Phone number being sent:', profileData.phoneNumber);
    console.log('Specialization being sent:', profileData.specialization);

    return this.updateDoctorProfile(currentUser.id, profileData);
  }

  // 🔹 Profile photo upload using backend API
  uploadProfilePhoto(file: File, description?: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('fileDescription', description);
    }
    
    const url = `${this.apiUrl}/user/update-profile-image`;
    console.log('Uploading to URL:', url);
    console.log('API URL from environment:', this.apiUrl);
    
    return this.http.post(url, formData);
  }

  // 🔹 Password update using backend API
  updatePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Observable<any> {
    return this.http.put(USER_API_ENDPOINTS.updatePassword, passwordData);
  }

  // 🔹 Update doctor profile using backend API
  updateDoctorProfile(userId: string, profileData: UpdateDoctorProfileDto): Observable<any> {
    return this.http.put(`${DOCTOR_API_ENDPOINTS.updateProfile}/${userId}`, profileData);
  }

  // 🔹 Get doctor by user ID from backend API
  getDoctorById(userId: string): Observable<DoctorApiResponse> {
    return this.http.get<DoctorApiResponse>(`${DOCTOR_API_ENDPOINTS.getDoctorById}/${userId}?isUserId=true`);
  }

  // 🔹 Get doctor appointments from backend API
  getDoctorAppointments(doctorId: string): Observable<AppointmentApiResponse> {
    return this.http.get<AppointmentApiResponse>(`${DOCTOR_API_ENDPOINTS.getAppointments}/${doctorId}`);
  }

  // 🔹 Add diagnosis for appointment
  addDiagnosis(appointmentId: string, diagnosisData: DiagnosisRequest): Observable<DiagnosisResponse> {
    return this.http.post<DiagnosisResponse>(`${DOCTOR_API_ENDPOINTS.addDiagnosis}/${appointmentId}`, diagnosisData);
  }

  // 🔹 Complete appointment with diagnosis using backend API
  completeAppointmentWithDiagnosis(appointment: any, diagnosisDetails: string): Observable<DiagnosisResponse> {
    const diagnosisData: DiagnosisRequest = {
      appointmentId: appointment.apiData?.id || appointment.id,
      patientId: appointment.apiData?.patientId || 'unknown',
      diagnosisDetails: diagnosisDetails
    };

    console.log('Completing appointment with diagnosis:', diagnosisData);
    console.log('API URL:', `${DOCTOR_API_ENDPOINTS.addDiagnosis}/${diagnosisData.appointmentId}`);
    
    return this.addDiagnosis(diagnosisData.appointmentId, diagnosisData);
  }

  // 🔹 Add vitals for appointment
  addVitals(appointmentId: string, vitalsData: VitalsRequest): Observable<VitalsResponse> {
    return this.http.post<VitalsResponse>(`${DOCTOR_API_ENDPOINTS.addVitals}/${appointmentId}`, vitalsData);
  }

  // 🔹 Complete appointment with vitals using backend API
  completeAppointmentWithVitals(appointment: any, vitalsData: any): Observable<VitalsResponse> {
    const vitalsRequest: VitalsRequest = {
      appointmentId: appointment.apiData?.id || appointment.id,
      patientId: appointment.apiData?.patientId || 'unknown',
      bloodPressure: vitalsData.bloodPressure || '',
      heartRate: parseInt(vitalsData.heartRate) || 0,
      temperature: parseFloat(vitalsData.temperature) || 0,
      spO2: parseInt(vitalsData.spO2) || 0
    };

    console.log('Completing appointment with vitals:', vitalsRequest);
    console.log('API URL:', `${DOCTOR_API_ENDPOINTS.addVitals}/${vitalsRequest.appointmentId}`);
    
    return this.addVitals(vitalsRequest.appointmentId, vitalsRequest);
  }

  // 🔹 Add medication for appointment
  addMedication(appointmentId: string, medicationData: MedicationRequest): Observable<MedicationResponse> {
    return this.http.post<MedicationResponse>(`${DOCTOR_API_ENDPOINTS.addMedications}/${appointmentId}`, medicationData);
  }

  // 🔹 Complete appointment with medications using backend API
  completeAppointmentWithMedications(appointment: any, medicationsData: any[]): Observable<MedicationResponse[]> {
    const medicationRequests: Observable<MedicationResponse>[] = [];

    medicationsData.forEach(medication => {
      if (medication.drug && medication.drug.trim()) { // Only process medications with a drug name
        const medicationRequest: MedicationRequest = {
          appointmentId: appointment.apiData?.id || appointment.id,
          patientId: appointment.apiData?.patientId || 'unknown',
          drug: medication.drug || '',
          dose: medication.dose || '',
          route: medication.route || '',
          frequency: medication.frequency || '',
          activity: parseInt(medication.activity) || 0
        };

        console.log('Adding medication:', medicationRequest);
        medicationRequests.push(this.addMedication(medicationRequest.appointmentId, medicationRequest));
      }
    });

    // Return all medication requests as a combined observable
    if (medicationRequests.length > 0) {
      return new Observable(observer => {
        Promise.all(medicationRequests.map(req => req.toPromise()))
          .then(results => {
            observer.next(results as MedicationResponse[]);
            observer.complete();
          })
          .catch(error => observer.error(error));
      });
    } else {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }
  }

  // 🔹 Add invoice for appointment (API call)
  addInvoiceToAppointment(appointmentId: string, invoiceData: InvoiceRequest): Observable<InvoiceResponse> {
    return this.http.post<InvoiceResponse>(`${DOCTOR_API_ENDPOINTS.addInvoice}/${appointmentId}`, invoiceData);
  }

  // 🔹 Complete appointment with invoice using backend API
  completeAppointmentWithInvoice(appointment: any, billingData: any): Observable<InvoiceResponse> {
    const invoiceRequest: InvoiceRequest = {
      appointmentId: appointment.apiData?.id || appointment.id,
      patientId: appointment.apiData?.patientId || 'unknown',
      consultationType: billingData.consultationType || 'general',
      consulationFee: parseFloat(billingData.consultationFee) || 0, // Note: API expects "consulationFee"
      labFee: parseFloat(billingData.labFee) || 0,
      medicineFee: parseFloat(billingData.medicineFee) || 0,
      total: parseFloat(billingData.total) || 0
    };

    console.log('Completing appointment with invoice:', invoiceRequest);
    console.log('API URL:', `${DOCTOR_API_ENDPOINTS.addInvoice}/${invoiceRequest.appointmentId}`);
    
    return this.addInvoiceToAppointment(invoiceRequest.appointmentId, invoiceRequest);
  }

  // 🔹 Update appointment status - Mark appointment as completed
  updateAppointmentStatus(appointmentId: string, status: string): Observable<any> {
    // Backend PUT endpoint: /api/Doctor/appointments/complete/{appointmentId}
    console.log('Updating appointment status to:', status);
    console.log('API URL:', `${DOCTOR_API_ENDPOINTS.completeAppointment}/${appointmentId}`);
    return this.http.put(
      `${DOCTOR_API_ENDPOINTS.completeAppointment}/${appointmentId}`,
      JSON.stringify(status),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 🔹 Mark appointment as completed
  markAppointmentCompleted(appointment: any): Observable<any> {
    const appointmentId = appointment.apiData?.id || appointment.id;
    return this.updateAppointmentStatus(appointmentId, 'COMPLETED');
  }

  // 🔹 Load appointments from API and update local state
  public loadAppointmentsFromApi(doctorId: string): void {
    console.log('Loading appointments for doctor:', doctorId);
    
    this.getDoctorAppointments(doctorId).subscribe({
      next: (apiResponse) => {
        console.log('Appointments API Response:', apiResponse);
        
        // Transform API appointments to local format
        const transformedAppointments: Appointment[] = apiResponse.appointments.map(apiAppointment => {
          // Convert status number to string
          const statusMap = {
            0: 'BOOKED' as const,
            1: 'COMPLETED' as const, 
            2: 'CANCELLED' as const
          };
          
          // Format date and time
          const appointmentDate = new Date(apiAppointment.appointmentDate);
          const formattedDate = appointmentDate.toISOString().split('T')[0]; // YYYY-MM-DD
          const formattedTime = `${apiAppointment.startTime.substring(0, 5)}-${apiAppointment.endTime.substring(0, 5)}`;
          
          // Use the real patient name from API response
          const patientName = apiAppointment.patientName || `Patient-${apiAppointment.patientId.substring(0, 8)}`;
          
          return {
            id: parseInt(apiAppointment.id.replace(/-/g, '').substring(0, 8), 16), // Convert UUID to number for compatibility
            patientName: patientName, // Use real patient name from API
            date: formattedDate,
            time: formattedTime,
            status: statusMap[apiAppointment.status as keyof typeof statusMap] || 'BOOKED',
            type: 'new' as const,
            // Store original API data for reference
            apiData: apiAppointment
          } as Appointment & { apiData: AppointmentFromAPI };
        });
        
        console.log('Transformed appointments:', transformedAppointments);
        
        // Update the BehaviorSubject with real data
        this.appointmentsSubject.next(transformedAppointments);
        
        // Update API stats
        this.appointmentStatsSubject.next({
          doctorId: apiResponse.doctorId,
          totalAppointments: apiResponse.totalAppointments
        });
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        // Keep empty array on error - no mock data
        this.appointmentsSubject.next([]);
        this.appointmentStatsSubject.next(null);
      }
    });
  }

  // 🔹 Generate readable patient names from patient IDs
  private generatePatientName(patientId: string): string {
    // Common first names and last names for generating readable patient names
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Robert', 'Lisa', 'James', 'Anna', 'William', 'Maria'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez'];
    
    // Use patient ID as seed for consistent name generation
    const seed = patientId.replace(/-/g, '').substring(0, 8);
    const numericSeed = parseInt(seed, 16);
    
    const firstName = firstNames[numericSeed % firstNames.length];
    const lastName = lastNames[Math.floor(numericSeed / firstNames.length) % lastNames.length];
    
    return `${firstName} ${lastName}`;
  }

  // 🔹 Load doctor data from API and update local state
  public loadDoctorFromApi(userId: string): void {
    this.getDoctorById(userId).subscribe({
      next: (apiResponse) => {
        console.log('Doctor API Response:', apiResponse);
        console.log('Raw phone number from API:', apiResponse.user.phoneNumber);
        
        // Helper function to parse phone number - ensuring 10-digit display
        const parsePhoneNumber = (phoneNumber: string) => {
          console.log('Parsing phone number:', phoneNumber);
          if (!phoneNumber) return { countryCode: '+91', phone: '' };
          
          // Remove all spaces and non-digit characters except +
          const cleanedPhone = phoneNumber.replace(/[^\d+]/g, '');
          console.log('Cleaned phone number:', cleanedPhone);
          
          // If phone starts with +91, extract it properly for Indian numbers
          if (cleanedPhone.startsWith('+91')) {
            const phoneWithoutCountryCode = cleanedPhone.substring(3); // Remove +91
            console.log('Indian number without country code:', phoneWithoutCountryCode);
            return { countryCode: '+91', phone: phoneWithoutCountryCode };
          }
          
          // If phone starts with other country codes like +1, +86, etc.
          if (cleanedPhone.startsWith('+')) {
            // Match country code patterns (+1, +86, +44, etc.)
            const match = cleanedPhone.match(/^(\+\d{1,3})(\d+)$/);
            if (match) {
              console.log('Matched with country code:', { countryCode: match[1], phone: match[2] });
              return { countryCode: match[1], phone: match[2] };
            }
          }
          
          // If it's just digits (like 9545820848), assume it's without country code
          if (/^\d{10,15}$/.test(cleanedPhone)) {
            console.log('Phone number without country code:', { countryCode: '+91', phone: cleanedPhone });
            return { countryCode: '+91', phone: cleanedPhone };
          }
          
          // Default fallback
          const result = { countryCode: '+91', phone: cleanedPhone.replace(/^\+/, '') };
          console.log('Default parsing result:', result);
          return result;
        };
        
        const { countryCode, phone } = parsePhoneNumber(apiResponse.user.phoneNumber || '');
        console.log('Final parsed phone data:', { countryCode, phone });
        
        // Map API response to local doctor structure
        const mappedDoctor = {
          id: apiResponse.id,
          userId: apiResponse.userId,
          fullName: apiResponse.user.name || 'Doctor',
          email: apiResponse.user.email || '',
          phone: phone,
          countryCode: countryCode,
          specialization: apiResponse.specialization || 'Not specified',
          bio: apiResponse.bio || '',
          role: 'Doctor',
          experience: `${apiResponse.yearsOfExperience || 0} years`,
          dob: apiResponse.user.dob || '',
          memberSince: apiResponse.memberSince || '',
          photoUrl: localStorage.getItem('doctorPhoto') || null // Keep existing photo logic
        };

        console.log('Mapped Doctor Data:', mappedDoctor);
        console.log('Final phone values - Country Code:', mappedDoctor.countryCode, 'Phone:', mappedDoctor.phone);
        
        // Update the BehaviorSubject with real data
        this.doctorSubject.next(mappedDoctor);
      },
      error: (error) => {
        console.error('Error loading doctor data:', error);
        // Keep mock data if API fails
      }
    });
  }

  // 🔹 Appointment management
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);

  // 🔹 Appointment API Stats
  private appointmentStatsSubject = new BehaviorSubject<{ doctorId: string; totalAppointments: number } | null>(null);
  
// 🔹 Mock available slots (doctor-defined)

  appointments$ = this.appointmentsSubject.asObservable();
  appointmentStats$ = this.appointmentStatsSubject.asObservable();

  updateAppointment(updated: Appointment) {
    this.appointmentsSubject.next(
      this.appointmentsSubject.value.map(a => a.id === updated.id ? updated : a)
    );
  }

  cancelAppointment(id: number) {
    this.updateAppointment({ ...this.appointmentsSubject.value.find(a => a.id === id)!, status: 'CANCELLED' });
    alert('Appointment cancelled successfully ❌');
  }

  completeAppointment(id: number) {
    this.updateAppointment({ ...this.appointmentsSubject.value.find(a => a.id === id)!, status: 'COMPLETED' });
  }

  // 🔹 Patient management
  private patientsSubject = new BehaviorSubject<Patient[]>([
    {
      id: 1,
      name: 'Candice Wu',
      dob: '1975-03-15',
      contact: 'candice.wu@example.com',
      medicalHistory: 'Hypertension, Diabetes',
      mrn: 'MRN001',
      sex: 'Female',
      diagnosis: 'Hypertension & Diabetes',
      ongoingTreatment: 'Lisinopril 10mg daily, Metformin 500mg twice daily',
      lastAppointment: '2023-10-10',
      nextAppointment: '2023-11-10',
      assignedDoctor: 'Dr. Shrayash Desai',
      department: 'Cardiology',
      avatar: 'assets/images/OIP.jpg'
    },
    {
      id: 2,
      name: 'Liam Chen',
      dob: '1985-07-22',
      contact: 'liam.chen@example.com',
      medicalHistory: 'Asthma',
      mrn: 'MRN002',
      sex: 'Male',
      diagnosis: 'Asthma',
      ongoingTreatment: 'Albuterol inhaler as needed',
      lastAppointment: '2023-10-12',
      nextAppointment: '2023-11-12',
      assignedDoctor: 'Dr. Shrayash Desai',
      department: 'Pulmonology',
      avatar: 'assets/images/OIP (1).jpg'
    },
    {
      id: 3,
      name: 'Sophia Patel',
      dob: '1990-11-08',
      contact: 'sophia.patel@example.com',
      medicalHistory: 'Migraine',
      mrn: 'MRN003',
      sex: 'Female',
      diagnosis: 'Chronic Migraine',
      ongoingTreatment: 'Sumatriptan 50mg as needed',
      lastAppointment: '2023-10-14',
      nextAppointment: '2023-11-14',
      assignedDoctor: 'Dr. Shrayash Desai',
      department: 'Neurology',
      avatar: 'assets/images/OIP.jpg'
    },
    {
      id: 4,
      name: 'Noah Kim',
      dob: '1995-01-30',
      contact: 'noah.kim@example.com',
      medicalHistory: 'Allergies',
      mrn: 'MRN004',
      sex: 'Male',
      diagnosis: 'Allergic Rhinitis',
      ongoingTreatment: 'Loratadine 10mg daily',
      lastAppointment: '2023-10-16',
      nextAppointment: '2023-11-16',
      assignedDoctor: 'Dr. Shrayash Desai',
      department: 'Allergy & Immunology',
      avatar: 'assets/images/OIP (1).jpg'
    },
    {
      id: 5,
      name: 'Emma Johnson',
      dob: '1978-05-12',
      contact: 'emma.johnson@example.com',
      medicalHistory: 'Arthritis',
      mrn: 'MRN005',
      sex: 'Female',
      diagnosis: 'Rheumatoid Arthritis',
      ongoingTreatment: 'Methotrexate 15mg weekly',
      lastAppointment: '2023-10-18',
      nextAppointment: '2023-11-18',
      assignedDoctor: 'Dr. Shrayash Desai',
      department: 'Rheumatology',
      avatar: 'assets/images/OIP.jpg'
    },
    {
      id: 6,
      name: 'Alex Rodriguez',
      dob: '2000-09-25',
      contact: 'alex.rodriguez@example.com',
      medicalHistory: 'None',
      mrn: 'MRN006',
      sex: 'Male',
      diagnosis: 'Healthy',
      ongoingTreatment: 'None',
      lastAppointment: '2023-10-20',
      nextAppointment: '2024-04-20',
      assignedDoctor: 'Dr. Shrayash Desai',
      department: 'General Medicine',
      avatar: 'assets/images/OIP (1).jpg'
    }
  ]);

  patients$ = this.patientsSubject.asObservable();

  searchPatients(query: string): Patient[] {
    const lowerQuery = query.toLowerCase();
    return this.patientsSubject.value.filter(patient =>
      patient.name.toLowerCase().includes(lowerQuery) ||
      patient.id.toString().includes(lowerQuery)
    );
  }

  getPatientById(id: number): Patient | undefined {
    return this.patientsSubject.value.find(patient => patient.id === id);
  }

  updatePatient(updated: Patient) {
    this.patientsSubject.next(
      this.patientsSubject.value.map(p => p.id === updated.id ? updated : p)
    );
  }

  // 🔹 Consultation management
  private consultationsSubject = new BehaviorSubject<Consultation[]>([
    { id: 1, patientId: 1, patientName: 'Candice Wu', date: '2023-10-10', diagnosis: 'Hypertension', labResults: ['Blood Pressure: 140/90'], prescriptions: [] },
    { id: 2, patientId: 2, patientName: 'Liam Chen', date: '2023-10-12', diagnosis: 'Asthma exacerbation', labResults: ['Peak flow: 300 L/min'], prescriptions: [] },
    { id: 3, patientId: 3, patientName: 'Sophia Patel', date: '2023-10-14', diagnosis: 'Migraine', labResults: ['MRI: Normal'], prescriptions: [] },
    { id: 4, patientId: 4, patientName: 'Noah Kim', date: '2023-10-16', diagnosis: 'Allergic rhinitis', labResults: ['Allergy test: Positive for pollen'], prescriptions: [] }
  ]);

  consultations$ = this.consultationsSubject.asObservable();

  getConsultations(): Consultation[] {
    return this.consultationsSubject.value;
  }

  addConsultation(consultation: Consultation) {
    this.consultationsSubject.next([...this.consultationsSubject.value, consultation]);
  }

  updateConsultation(updated: Consultation) {
    this.consultationsSubject.next(
      this.consultationsSubject.value.map(c => c.id === updated.id ? updated : c)
    );
  }

  // 🔹 Billing management
  private invoicesSubject = new BehaviorSubject<Invoice[]>([
  {
    id: 'INV001',
    patientId: 1,
    patientName: 'Candice Wu',
    amount: 150.00,
    paymentStatus: 'PAID',
    paidDate: '2023-10-01',
    paymentMethod: 'Credit Card',
    transactionId: 'TXN12345',
    consultationType: 'Cardiology Consultation',
    consultationFee: 100,
    labFee: 30,
    medicineFee: 20,
    otherCharges: 0,
    subtotal: 150
  },
  {
    id: 'INV002',
    patientId: 2,
    patientName: 'Liam Chen',
    amount: 200.00,
    paymentStatus: 'PENDING',
    issueDate: '2023-10-05',
    dueDate: '2023-10-15',
    paymentMethod: 'Cash',
    transactionId: 'TXN67890',
    consultationType: 'Asthma Follow-up',
    consultationFee: 120,
    labFee: 50,
    medicineFee: 20,
    otherCharges: 10,
    subtotal: 200
  },
  {
    id: 'INV003',
    patientId: 3,
    patientName: 'Sophia Patel',
    amount: 120.00,
    paymentStatus: 'OVERDUE',
    issueDate: '2023-09-20',
    dueDate: '2023-09-30',
    paymentMethod: 'UPI',
    transactionId: 'TXN54321',
    consultationType: 'Neurology Consultation',
    consultationFee: 80,
    labFee: 20,
    medicineFee: 10,
    otherCharges: 10,
    subtotal: 120
  }
]);


  invoices$ = this.invoicesSubject.asObservable();

  getInvoices(): Invoice[] {
    return this.invoicesSubject.value;
  }
  getInvoiceById(id: string|number): Invoice | undefined {
    return this.invoicesSubject.value.find((inv: Invoice) => inv.id === id);
  }

  addInvoice(invoice: Invoice) {
    this.invoicesSubject.next([...this.invoicesSubject.value, invoice]);
  }

  updateInvoice(updated: Invoice) {
    this.invoicesSubject.next(
      this.invoicesSubject.value.map(inv => inv.id === updated.id ? updated : inv)
    );
  }

// 🔹 Doctor available slots management
private generateMockSlots(): string[] {
  // Generate slots for the next 30 days
  const slots: string[] = [];
  const today = new Date(2026, 1, 14); // Feb 14, 2026
  
  for (let i = 1; i <= 10; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    slots.push(dateString);
  }
  
  return slots;
}

private slotsSubject = new BehaviorSubject<string[]>([]);

slots$ = this.slotsSubject.asObservable();

// 🔹 Available Slots Subject (for time-based slots from API)
private availableSlotsSubject = new BehaviorSubject<AvailableSlot[]>([]);

availableSlots$ = this.availableSlotsSubject.asObservable();

getSlots() {
  return this.slotsSubject.value;
}

getAvailableSlots() {
  return this.availableSlotsSubject.value;
}

addSlot(date: string) {
  const slots = [...this.slotsSubject.value];
  if (!slots.includes(date)) {
    slots.push(date);
  }
  this.slotsSubject.next(slots);
}

removeSlot(date: string) {
  const slots = this.slotsSubject.value.filter(s => s !== date);
  this.slotsSubject.next(slots);
}

// 🔹 Doctor Slot API Methods
/**
 * Generate doctor slots via API
 * @param startDate ISO format: "2026-02-15T12:15:04.269Z"
 * @param endDate ISO format: "2026-02-15T12:15:04.269Z"
 * @returns Observable of DoctorSlotResponse
 */
generateDoctorSlot(startDate: string, endDate: string): Observable<DoctorSlotResponse> {
  // Get doctorId from the doctor profile (not the user ID)
  const currentDoctor = this.getDoctor();
  if (!currentDoctor || !currentDoctor.id) {
    throw new Error('Doctor profile not loaded');
  }

  const request: DoctorSlotRequest = {
    doctorId: currentDoctor.id,
    startDate: startDate,
    endDate: endDate
  };

  const endpoint = `${this.apiUrl}/DoctorSlot/generate`;
  
  console.log('Generating slot with request:', request);
  
  return this.http.post<DoctorSlotResponse>(endpoint, request).pipe(
    tap((response) => {
      console.log('Slot generated successfully:', response);
      // Also add to local slots subject for UI update
      this.addSlotFromAPI(response);
    }),
    catchError((error) => {
      console.error('Error generating slot:', error);
      throw error;
    })
  );
}

/**
 * Fetch available slots for current doctor from API
 * @returns Observable of DoctorSlotFromAPI[]
 */
fetchDoctorSlotsFromAPI(): Observable<DoctorSlotFromAPI[]> {
  // Get doctorId from the doctor profile (not the user ID)
  const currentDoctor = this.getDoctor();
  if (!currentDoctor || !currentDoctor.id) {
    throw new Error('Doctor profile not loaded');
  }

  const endpoint = `${this.apiUrl}/DoctorSlot/doctor/${currentDoctor.id}`;
  
  return this.http.get<DoctorSlotFromAPI[]>(endpoint).pipe(
    tap((slots) => {
      console.log('Slots fetched from API:', slots);
      // Convert API slots to local format
      this.convertAndUpdateSlots(slots);
    }),
    catchError((error) => {
      console.error('Error fetching slots:', error);
      throw error;
    })
  );
}

/**
 * Convert API slot response to local format and update subject (just dates)
 */
private addSlotFromAPI(apiSlot: DoctorSlotResponse): void {
  const slots = [...this.slotsSubject.value];
  
  // Extract date from ISO format - check if startDate exists first
  if (!apiSlot || !apiSlot.startDate) {
    console.warn('Invalid API slot response:', apiSlot);
    return;
  }
  
  const startDate = apiSlot.startDate.split('T')[0];
  
  if (!slots.includes(startDate)) {
    slots.push(startDate);
  }
  
  this.slotsSubject.next(slots);
}

/**
 * Convert API slots to local format (just dates, no times)
 */
private convertAndUpdateSlots(apiSlots: DoctorSlotFromAPI[]): void {
  const localSlots: string[] = [];
  
  apiSlots.forEach(apiSlot => {
    // Check if slot and startDate exist before processing
    if (!apiSlot || !apiSlot.startDate) {
      console.warn('Invalid API slot in response:', apiSlot);
      return;
    }
    
    if (!apiSlot.isAvailable) return; // Skip unavailable slots
    
    const startDate = apiSlot.startDate.split('T')[0];
    
    if (!localSlots.includes(startDate)) {
      localSlots.push(startDate);
    }
  });
  
  this.slotsSubject.next(localSlots);
}

/**
 * Fetch available appointment slots for the doctor from the API
 * API: GET /api/DoctorSlot/doctor/{doctorId}/available?date=...
 * @param date Optional date parameter (ISO format: YYYY-MM-DD)
 * @returns Observable<AvailableSlotsResponse> with array of available time slots
 */
fetchAvailableSlots(date?: string): Observable<AvailableSlotsResponse> {
  // Get doctorId from the doctor profile (not the user ID)
  const currentDoctor = this.getDoctor();
  if (!currentDoctor || !currentDoctor.id) {
    throw new Error('Doctor profile not loaded');
  }

  let endpoint = `${this.apiUrl}/DoctorSlot/doctor/${currentDoctor.id}/available`;
  
  // Add date parameter if provided
  if (date) {
    endpoint += `?date=${encodeURIComponent(date)}`;
  }
  
  return this.http.get<AvailableSlotsResponse>(endpoint).pipe(
    tap((response) => {
      console.log('Available slots fetched from API:', response);
      // Update available slots subject with the response
      if (response && response.slots) {
        this.availableSlotsSubject.next(response.slots);
      }
    }),
    catchError((error) => {
      console.error('Error fetching available slots:', error);
      // Log full error details for debugging
      if (error.error) {
        console.error('Error response:', error.error);
      }
      throw error;
    })
  );
}

/**
 * Get all patients assigned to the current doctor
 * API: GET /api/Doctor/patients/{doctorId}
 * Returns all patients who have appointments with this doctor (completed or ongoing)
 * @returns Observable<DoctorPatientsResponse> with list of patients and their appointment data
 */
getPatientsByDoctor(): Observable<DoctorPatientsResponse> {
  // Get doctorId from the doctor profile (not the user ID)
  const currentDoctor = this.getDoctor();
  if (!currentDoctor || !currentDoctor.id) {
    throw new Error('Doctor profile not loaded');
  }

  const endpoint = `${this.apiUrl}/Doctor/patients/${currentDoctor.id}`;
  
  return this.http.get<DoctorPatientsResponse>(endpoint).pipe(
    tap((response) => {
      console.log('Patients fetched from API:', response);
      console.log(`Total patients: ${response.totalPatients}`);
      if (response.patients && response.patients.length > 0) {
        response.patients.forEach(patient => {
          console.log(`Patient: ${patient.user?.name}, Appointments: ${patient.appointments?.length || 0}`);
        });
      }
    }),
    catchError((error) => {
      console.error('Error fetching patients:', error);
      // Log full error details for debugging
      if (error.error) {
        console.error('Error response:', error.error);
      }
      throw error;
    })
  );
}

/**
 * Get today's appointments for the current doctor
 * API: GET /api/Doctor/appointments/today
 * Returns all appointments scheduled for today
 * @returns Observable<TodayAppointmentsResponse> with list of today's appointments
 */
getTodayAppointments(): Observable<TodayAppointmentsResponse> {
  const endpoint = `${this.apiUrl}/Doctor/appointments/today`;
  
  return this.http.get<TodayAppointmentsResponse>(endpoint).pipe(
    tap((response) => {
      console.log('Today appointments fetched from API:', response);
      console.log(`Total appointments today: ${response.totalAppointments}`);
      if (response.appointments && response.appointments.length > 0) {
        response.appointments.forEach(appointment => {
          console.log(`Appointment: ${appointment.patientName} at ${appointment.startTime} - ${appointment.endTime}`);
        });
      }
    }),
    catchError((error) => {
      console.error('Error fetching today appointments:', error);
      if (error.error) {
        console.error('Error response:', error.error);
      }
      throw error;
    })
  );
}




}
