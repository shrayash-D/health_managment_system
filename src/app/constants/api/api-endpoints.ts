import { environment } from '../../../environments/environment';

const API_BASE_URL = environment.apiUrl;

export const AUTH_API_ENDPOINTS = {
  login: `${API_BASE_URL}/auth/login`,
  signup: `${API_BASE_URL}/auth/signup`,
  refresh: `${API_BASE_URL}/auth/Refresh`,
};

export const PATIENT_API_ENDPOINTS = {
  getPatientById: `${API_BASE_URL}/Patient`,
  updateProfile: `${API_BASE_URL}/Patient/update-profile`,
};

export const DOCTOR_API_ENDPOINTS = {
  getDoctorById: `${API_BASE_URL}/Doctor`,
  updateProfile: `${API_BASE_URL}/Doctor/update-profile`,
  getAppointments: `${API_BASE_URL}/Doctor/appointments`,
  addDiagnosis: `${API_BASE_URL}/Doctor/appointments/diagnosis`,
  addVitals: `${API_BASE_URL}/Doctor/appointments/vitals`,
  addMedications: `${API_BASE_URL}/Doctor/appointments/medications`,
  addInvoice: `${API_BASE_URL}/Doctor/appointments/invoice`,
  updateAppointmentStatus: `${API_BASE_URL}/Doctor/appointments/status`,
};

export const USER_API_ENDPOINTS = {
  updatePassword: `${API_BASE_URL}/User/update-password`,
  updateProfileImage: `${API_BASE_URL}/User/update-profile-image`,
  deleteProfileImage: `${API_BASE_URL}/User/delete-profile-image`,
};

export const ADMIN_API_ENDPOINTS = {
  // Dashboard Metrics
  getTotalPatients: `${PATIENT_API_BASE_URL}/Admin/patients/total`,
  getTotalDoctors: `${PATIENT_API_BASE_URL}/Admin/doctors/total`,
  getTotalAppointments: `${PATIENT_API_BASE_URL}/Admin/appointments/total`,
  getTotalRevenue: `${PATIENT_API_BASE_URL}/Admin/invoices/paid/total-amount`,

  // Data Lists
  getAllPatients: `${PATIENT_API_BASE_URL}/Admin/patients`,
  getAllDoctors: `${PATIENT_API_BASE_URL}/Admin/doctors`,
  getAllAppointments: `${PATIENT_API_BASE_URL}/Admin/appointments`,
  getPendingAppointments: `${PATIENT_API_BASE_URL}/Admin/appointments/pending`,
  getAllInvoices: `${PATIENT_API_BASE_URL}/Admin/invoices`,
  getPendingInvoices: `${PATIENT_API_BASE_URL}/Admin/invoices/pending`,

  // Operations
  deletePatient: (userId: string) =>
    `${PATIENT_API_BASE_URL}/Admin/patients/${userId}`,
  deleteDoctor: (userId: string) =>
    `${PATIENT_API_BASE_URL}/Admin/doctors/${userId}`,
  updateUserPassword: (userId: string) =>
    `${PATIENT_API_BASE_URL}/Admin/users/password/${userId}`,
};

export const DOCTOR_SLOT_API_ENDPOINTS = {
  getAvailableSlots: (doctorId: string) =>
    `${PATIENT_API_BASE_URL}/DoctorSlot/doctor/${doctorId}/available`,
};

export const APPOINTMENT_API_ENDPOINTS = {
  bookAppointment: `${PATIENT_API_BASE_URL}/Patient/appointments`,
};
