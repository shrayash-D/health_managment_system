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
  getDoctors: `${PATIENT_API_BASE_URL}/Admin/doctors`,
};

export const DOCTOR_SLOT_API_ENDPOINTS = {
  getAvailableSlots: (doctorId: string) =>
    `${PATIENT_API_BASE_URL}/DoctorSlot/doctor/${doctorId}/available`,
};

export const APPOINTMENT_API_ENDPOINTS = {
  bookAppointment: `${PATIENT_API_BASE_URL}/Patient/appointments`,
};
