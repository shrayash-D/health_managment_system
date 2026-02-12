import { environment } from '../../../environments/environment';

const API_BASE_URL = environment.apiUrl;

export const AUTH_API_ENDPOINTS = {
  login: `${API_BASE_URL}/auth/login`,
  signup: `${API_BASE_URL}/auth/signup`,
  refresh: `${API_BASE_URL}/auth/Refresh`,
};

export const PATIENT_API_ENDPOINTS = {
  getPatientById : `${API_BASE_URL}/patient`,
}
