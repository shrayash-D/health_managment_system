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
  getPatients: (doctorId: string) =>
    `${API_BASE_URL}/Doctor/patients/${doctorId}`,
  addDiagnosis: `${API_BASE_URL}/Doctor/appointments/diagnosis`,
  addVitals: `${API_BASE_URL}/Doctor/appointments/vitals`,
  addMedications: `${API_BASE_URL}/Doctor/appointments/medications`,
  addInvoice: `${API_BASE_URL}/Doctor/appointments/invoice`,
  completeAppointment: `${API_BASE_URL}/Doctor/appointments/complete`,
};

export const USER_API_ENDPOINTS = {
  updatePassword: `${API_BASE_URL}/User/update-password`,
  updateProfileImage: `${API_BASE_URL}/User/update-profile-image`,
  deleteProfileImage: `${API_BASE_URL}/User/delete-profile-image`,
};

export const ADMIN_API_ENDPOINTS = {
  // Dashboard Metrics

  getTotalPatients: `${API_BASE_URL}/Admin/patients/total`,
  getTotalDoctors: `${API_BASE_URL}/Admin/doctors/total`,
  getTotalAppointments: `${API_BASE_URL}/Admin/appointments/total`,
  getTotalRevenue: `${API_BASE_URL}/Admin/invoices/paid/total-amount`,
    getDoctorWorkload: `${API_BASE_URL}/Admin/doctors/workload`,


  // Data Lists
  getAllPatients: `${API_BASE_URL}/Admin/patients`,
  getAllDoctors: `${API_BASE_URL}/Admin/doctors`,
  getAllAppointments: `${API_BASE_URL}/Admin/appointments`,
  getPendingAppointments: `${API_BASE_URL}/Admin/appointments/pending`,
  getAllInvoices: `${API_BASE_URL}/Admin/invoices`,
  getPendingInvoices: `${API_BASE_URL}/Admin/invoices/pending`,

  // Operations
  deletePatient: (userId: string) =>
  `${API_BASE_URL}/Admin/patients/${userId}`,
  deleteDoctor: (userId: string) =>
  `${API_BASE_URL}/Admin/doctors/${userId}`,
  updateUserPassword: (userId: string) =>
    `${API_BASE_URL}/Admin/users/password/${userId}`,
  markInvoiceAsPaid: (invoiceId: string) =>
    `${API_BASE_URL}/Admin/invoices/mark-paid/${invoiceId}`,

};

export const DOCTOR_SLOT_API_ENDPOINTS = {
  getAvailableSlots: (doctorId: string) =>
  `${API_BASE_URL}/DoctorSlot/doctor/${doctorId}/available`,
  generateSlots: `${API_BASE_URL}/DoctorSlot/generate`,
  getSlots: (doctorId: string) =>
  `${API_BASE_URL}/DoctorSlot/doctor/${doctorId}`,
};

export const APPOINTMENT_API_ENDPOINTS = {
  bookAppointment: `${API_BASE_URL}/Patient/appointments`,
  cancelAppointment: (appointmentId: string) =>
  `${API_BASE_URL}/Patient/appointments/${appointmentId}/cancel`,
};
