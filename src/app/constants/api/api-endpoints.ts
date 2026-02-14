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
};

export const USER_API_ENDPOINTS = {
  updatePassword: `${API_BASE_URL}/User/update-password`,
  updateProfileImage: `${API_BASE_URL}/User/update-profile-image`,
  deleteProfileImage: `${API_BASE_URL}/User/delete-profile-image`,
};
