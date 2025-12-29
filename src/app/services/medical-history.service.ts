import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface MedicalEntry {
  id: number;
  date: string; // ISO string 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:mm:ss'
  title: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class MedicalHistoryService {
  // Single patient’s full history (no IDs)
  private readonly singlePatientHistory: MedicalEntry[] = [
    {
      id: 1,
      date: '2023-06-15',
      title: 'Flu vaccination',
      notes: 'No adverse reaction.',
    },
    {
      id: 2,
      date: '2024-03-02',
      title: 'ENT consult',
      notes: 'Allergic rhinitis; nasal spray prescribed.',
    },
    {
      id: 3,
      date: '2024-11-02',
      title: 'Annual checkup',
      notes: 'Vitals normal. BP: 118/76, HR: 78.',
    },
    {
      id: 4,
      date: '2025-01-05',
      title: 'Dermatology consult',
      notes: 'Mild eczema; emollients advised.',
    },
    {
      id: 5,
      date: '2025-02-14',
      title: 'General appointment',
      notes: 'Diet and activity counseling.',
    },
    {
      id: 6,
      date: '2025-03-10',
      title: 'Orthopedics follow-up',
      notes: 'Knee pain; physio plan updated.',
    },
    {
      id: 7,
      date: '2025-04-02',
      title: 'Physiotherapy session',
      notes: 'Stretching routine refined.',
    },
    {
      id: 8,
      date: '2025-06-05',
      title: 'Cardiology review',
      notes: 'Hypertension controlled; continue meds.',
    },
    {
      id: 9,
      date: '2025-08-20',
      title: 'Dental cleaning',
      notes: 'Routine cleaning; flossing advised.',
    },
    {
      id: 10,
      date: '2025-10-10',
      title: 'Influenza vaccination',
      notes: 'Mild soreness at injection site.',
    },
  ];

  getHistory(): Observable<MedicalEntry[]> {
    // Return a copy to keep data immutable outside
    return of(this.singlePatientHistory.map((e) => ({ ...e })));
  }
}
