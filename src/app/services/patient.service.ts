import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {
  Patient,
  PatientApiResponse,
  PatientListApiResponse,
} from '../models/patient.interface';
import { AppointmentHistoryResponse } from '../models/appointment-history.interface';
import { environment } from '../../environments/environment';
import {
  PATIENT_API_ENDPOINTS,
  USER_API_ENDPOINTS,
  ADMIN_API_ENDPOINTS,
} from '../constants/api/api-endpoints';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  constructor(private http: HttpClient) {}

  getPatientByUserId(userId: string): Observable<PatientApiResponse> {
    var data = this.http.get<PatientApiResponse>(
      `${PATIENT_API_ENDPOINTS.getPatientById}/${userId}?isUserId=true`,
    );

    return data;
  }

  updatePatientProfile(userId: string, profileData: any): Observable<any> {
    console.log(profileData);
    return this.http.put(
      `${PATIENT_API_ENDPOINTS.updateProfile}/${userId}`,
      profileData,
    );
  }

  updatePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Observable<any> {
    var data = this.http.put(
      `${USER_API_ENDPOINTS.updatePassword}`,
      passwordData,
    );
    return data;
  }

  uploadProfileImage(file: File, description?: string): Observable<any> {
    const formData = new FormData();
    formData.append('File', file);
    if (description) {
      formData.append('FileDescription', description);
    }

    return this.http.post(`${USER_API_ENDPOINTS.updateProfileImage}`, formData);
  }

  deleteProfileImage(): Observable<any> {
    return this.http.delete(`${USER_API_ENDPOINTS.deleteProfileImage}`);
  }

  /**
   * Get all appointments for a patient by userId
   */
  getPatientAppointments(
    userId: string,
  ): Observable<AppointmentHistoryResponse[]> {
    return this.http.get<AppointmentHistoryResponse[]>(
      `${environment.apiUrl}/Patient/${userId}/appointments`,
    );
  }

  // ==========================================
  // ADMIN API METHODS
  // ==========================================

  getAllPatients(): Observable<Patient[]> {
    return this.http
      .get<PatientListApiResponse[]>(ADMIN_API_ENDPOINTS.getAllPatients)
      .pipe(
        map((apiPatients) =>
          apiPatients.map((apiPatient) => ({
            id: parseInt(apiPatient.id) || 0,
            userId: apiPatient.userId, // Keep the original userId for delete operations
            name: apiPatient.user?.name || 'Unknown',
            contactInfo: apiPatient.user?.phoneNumber || 'N/A',
            dob: apiPatient.user?.dob
              ? new Date(apiPatient.user.dob).toISOString().split('T')[0]
              : 'N/A',
            bloodGroup: apiPatient.bloodGroup || 'Unknown',
            allergies: [], // Not provided by API
            primaryPhysician: apiPatient.doctor?.user?.name || 'Not Assigned',
            medicalHistory: apiPatient.address || undefined,
          })),
        ),
      );
  }

  deletePatient(userId: string): Observable<boolean> {
    // The admin API expects userId (GUID string)
    return this.http
      .delete<void>(ADMIN_API_ENDPOINTS.deletePatient(userId))
      .pipe(map(() => true));
  }
}
