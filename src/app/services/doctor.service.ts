import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Doctor } from '../models/doctor.interface';

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  private mockDoctors: Doctor[] = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialization: 'Cardiology',
      contactInfo: '+1 234-567-8001',
      email: 'sarah.johnson@healthconnect.com',
      department: 'Cardiology',
      availability: [
        { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 'Friday', startTime: '09:00', endTime: '13:00' },
      ],
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialization: 'Pediatrics',
      contactInfo: '+1 234-567-8002',
      email: 'michael.chen@healthconnect.com',
      department: 'Pediatrics',
      availability: [
        { dayOfWeek: 'Tuesday', startTime: '10:00', endTime: '18:00' },
        { dayOfWeek: 'Thursday', startTime: '10:00', endTime: '18:00' },
        { dayOfWeek: 'Saturday', startTime: '09:00', endTime: '14:00' },
      ],
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      specialization: 'Neurology',
      contactInfo: '+1 234-567-8003',
      email: 'emily.rodriguez@healthconnect.com',
      department: 'Neurology',
      availability: [
        { dayOfWeek: 'Monday', startTime: '08:00', endTime: '16:00' },
        { dayOfWeek: 'Wednesday', startTime: '08:00', endTime: '16:00' },
        { dayOfWeek: 'Friday', startTime: '08:00', endTime: '12:00' },
      ],
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      specialization: 'Orthopedics',
      contactInfo: '+1 234-567-8004',
      email: 'james.wilson@healthconnect.com',
      department: 'Orthopedics',
      availability: [
        { dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 'Thursday', startTime: '09:00', endTime: '17:00' },
      ],
    },
    // ✅ Add new doctors below
    {
      id: 5,
      name: 'Dr. Olivia Brown',
      specialization: 'Dermatology',
      contactInfo: '+1 234-567-8005',
      email: 'olivia.brown@healthconnect.com',
      department: 'Dermatology',
      availability: [
        { dayOfWeek: 'Monday', startTime: '10:00', endTime: '16:00' },
        { dayOfWeek: 'Thursday', startTime: '12:00', endTime: '18:00' },
      ],
    },
    {
      id: 6,
      name: 'Dr. Robert Smith',
      specialization: 'General Surgery',
      contactInfo: '+1 234-567-8006',
      email: 'robert.smith@healthconnect.com',
      department: 'Surgery',
      availability: [
        { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '15:00' },
        { dayOfWeek: 'Friday', startTime: '09:00', endTime: '15:00' },
      ],
    },
  ];

  getAllDoctors(): Observable<Doctor[]> {
    return of([...this.mockDoctors]);
  }

  getDoctorById(id: number): Observable<Doctor | undefined> {
    const doctor = this.mockDoctors.find((d) => d.id === id);
    return of(doctor);
  }

  updateDoctor(id: number, doctor: Doctor): Observable<Doctor> {
    const index = this.mockDoctors.findIndex((d) => d.id === id);
    if (index !== -1) {
      this.mockDoctors[index] = { ...doctor, id };
      return of(this.mockDoctors[index]);
    }
    return of(doctor);
  }

  deleteDoctor(id: number): Observable<boolean> {
    const index = this.mockDoctors.findIndex((d) => d.id === id);
    if (index !== -1) {
      this.mockDoctors.splice(index, 1);
      return of(true);
    }
    return of(false);
  }
}
