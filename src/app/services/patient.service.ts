import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {
  Patient,
  PatientApiResponse,
  PatientListApiResponse,
} from '../models/patient.interface';
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

  private mockPatients: Patient[] = [
    {
      id: 1,
      name: 'John Doe',
      contactInfo: '+1 234-567-8900',
      dob: '1985-05-15',
      medicalHistory: 'Hypertension, Diabetes Type 2',
      bloodGroup: 'O+',
      allergies: ['Penicillin'],
      primaryPhysician: 'Dr. Sarah Johnson',
    },
    {
      id: 2,
      name: 'Jane Smith',
      contactInfo: '+1 234-567-8901',
      dob: '1990-08-22',
      medicalHistory: 'Asthma',
      bloodGroup: 'A+',
      allergies: [],
      primaryPhysician: 'Dr. Michael Chen',
    },
    {
      id: 3,
      name: 'Robert Williams',
      contactInfo: '+1 234-567-8902',
      dob: '1978-12-10',
      medicalHistory: 'None',
      bloodGroup: 'B+',
      allergies: ['Peanuts'],
      primaryPhysician: 'Dr. Sarah Johnson',
    },
    {
      id: 4,
      name: 'Emily Davis',
      contactInfo: '+1 234-567-8903',
      dob: '1995-03-25',
      medicalHistory: 'Migraine',
      bloodGroup: 'AB+',
      allergies: [],
      primaryPhysician: 'Dr. Michael Chen',
    },
    {
      id: 5,
      name: 'Michael Brown',
      contactInfo: '+1 234-567-8904',
      dob: '1982-07-18',
      medicalHistory: 'High Cholesterol',
      bloodGroup: 'O-',
      allergies: ['Shellfish'],
      primaryPhysician: 'Dr. Sarah Johnson',
    },
  ];

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

  getPatientById(id: number): Observable<Patient | undefined> {
    const patient = this.mockPatients.find((p) => p.id === id);
    return of(patient);
  }

  updatePatient(id: number, patient: Patient): Observable<Patient> {
    const index = this.mockPatients.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.mockPatients[index] = { ...patient, id };
      return of(this.mockPatients[index]);
    }
    return of(patient);
  }

  deletePatient(userId: string): Observable<boolean> {
    // The admin API expects userId (GUID string)
    return this.http
      .delete<void>(ADMIN_API_ENDPOINTS.deletePatient(userId))
      .pipe(map(() => true));
  }
}
