import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DOCTOR_SLOT_API_ENDPOINTS } from '../constants/api/api-endpoints';

@Injectable({ providedIn: 'root' })
export class DoctorSlotService {
  constructor(private http: HttpClient) {}

  generateDoctorSlots(data: any): Observable<any> {
    return this.http.post('/api/DoctorSlot/generate', data);
  }

  getDoctorSlots(doctorId: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/DoctorSlot/doctor/${doctorId}`);
  }

  getDoctorAvailableSlots(doctorId: string): Observable<any[]> {
    return this.http.get<any[]>(DOCTOR_SLOT_API_ENDPOINTS.getAvailableSlots(doctorId));
  }

  getDoctorAvailableDates(doctorId: string): Observable<string[]> {
    return this.http.get<string[]>(`/api/DoctorSlot/doctor/${doctorId}/available-dates`);
  }

  deleteDoctorSlot(slotId: string): Observable<any> {
    return this.http.delete(`/api/DoctorSlot/${slotId}`);
  }
}
