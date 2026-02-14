import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Doctor } from '../models/doctor.interface';
import { HttpClient } from '@angular/common/http';
import { ADMIN_API_ENDPOINTS } from '../constants/api/api-endpoints';
import { map, catchError } from 'rxjs/operators';

// API Response interface for doctors - API returns array directly
interface DoctorApiItem {
  id: string;
  userId: string;
  specialization: string;
  yearsOfExperience: number;
  memberSince: number | null;
  bio: string;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    dob?: string;
  };
  patients?: any[];
  appointments?: any[];
}

type DoctorApiResponse = DoctorApiItem[];

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  constructor(private http: HttpClient) {}

  // ==========================================
  // ADMIN API METHODS
  // ==========================================

  /**
   * Get all doctors from the API
   */
  getAllDoctors(): Observable<Doctor[]> {
    return this.http
      .get<DoctorApiResponse>(ADMIN_API_ENDPOINTS.getAllDoctors)
      .pipe(
        map((response) => {
          // API returns an array directly
          return response.map((apiDoctor: DoctorApiItem) => ({
            id: apiDoctor.id,
            userId: apiDoctor.userId,
            specialization: apiDoctor.specialization || 'Not specified',
            yearsOfExperience: apiDoctor.yearsOfExperience || 0,
            memberSince: apiDoctor.memberSince || undefined,
            bio: apiDoctor.bio || '',
            user: {
              id: apiDoctor.user.id,
              name: apiDoctor.user.name,
              email: apiDoctor.user.email,
              phoneNumber: apiDoctor.user.phoneNumber,
            },
          }));
        }),
        catchError((error) => {
          console.error('Error fetching doctors:', error);
          return of([]); // Return empty array on error
        }),
      );
  }

  /**
   * Get doctor by ID
   */
  getDoctorById(id: number | string): Observable<Doctor | undefined> {
    return this.getAllDoctors().pipe(
      map((doctors) => doctors.find((d) => d.id == id)),
    );
  }

  /**
   * Delete doctor by user ID
   * @param userId The user ID (GUID) of the doctor to delete
   */
  deleteDoctor(userId: string): Observable<any> {
    return this.http.delete(ADMIN_API_ENDPOINTS.deleteDoctor(userId));
  }

  /**
   * Update doctor information (placeholder for future implementation)
   */
  updateDoctor(id: number | string, doctor: Doctor): Observable<Doctor> {
    // TODO: Implement with actual API when backend provides update doctor endpoint
    return of(doctor);
  }
}
