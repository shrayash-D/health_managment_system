import { environment } from '../../../environments/environment';

const API_BASE_URL = environment.apiUrl;
const PATIENT_API_BASE_URL = 'https://localhost:7068/api';

export const AUTH_API_ENDPOINTS = {
  login: `${API_BASE_URL}/auth/login`,
  signup: `${API_BASE_URL}/auth/signup`,
  refresh: `${API_BASE_URL}/auth/Refresh`,
};

export const PATIENT_API_ENDPOINTS = {
  getPatientById: `${PATIENT_API_BASE_URL}/Patient`,
  updateProfile: `${PATIENT_API_BASE_URL}/Patient/update-profile`,
};

export const USER_API_ENDPOINTS = {
  updatePassword: `${PATIENT_API_BASE_URL}/User/update-password`,
  updateProfileImage: `${PATIENT_API_BASE_URL}/User/update-profile-image`,
  deleteProfileImage: `${PATIENT_API_BASE_URL}/User/delete-profile-image`,
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
  markInvoiceAsPaid: (invoiceId: string) =>
    `${PATIENT_API_BASE_URL}/Admin/invoices/mark-paid/${invoiceId}`,
};

export const DOCTOR_SLOT_API_ENDPOINTS = {
  getAvailableSlots: (doctorId: string) =>
    `${PATIENT_API_BASE_URL}/DoctorSlot/doctor/${doctorId}/available`,
};

export const APPOINTMENT_API_ENDPOINTS = {
  bookAppointment: `${PATIENT_API_BASE_URL}/Patient/appointments`,
  cancelAppointment: (appointmentId: string) =>
    `${PATIENT_API_BASE_URL}/Patient/appointments/${appointmentId}/cancel`,
};
