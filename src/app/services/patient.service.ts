import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Patient, PatientApiResponse } from '../models/patient.interface';
import { environment } from '../../environments/environment';
import {
  PATIENT_API_ENDPOINTS,
  USER_API_ENDPOINTS,
} from '../constants/api/api-endpoints';

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
    return of([...this.mockPatients]);
  }

  getPatientById(id: number): Observable<Patient | undefined> {
    const patient = this.mockPatients.find((p) => p.id === id);
    return of(patient);
  }

  addPatient(patient: Patient): Observable<Patient> {
    const newId = Math.max(...this.mockPatients.map((p) => p.id), 0) + 1;
    const newPatient: Patient = { ...patient, id: newId };
    this.mockPatients.push(newPatient);
    return of(newPatient);
  }

  updatePatient(id: number, patient: Patient): Observable<Patient> {
    const index = this.mockPatients.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.mockPatients[index] = { ...patient, id };
      return of(this.mockPatients[index]);
    }
    return of(patient);
  }

  deletePatient(id: number): Observable<boolean> {
    const index = this.mockPatients.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.mockPatients.splice(index, 1);
      return of(true);
    }
    return of(false);
  }
}
