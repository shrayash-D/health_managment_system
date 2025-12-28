export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  contactInfo: string;
  email?: string;
  department?: string;
  availability?: DoctorAvailability[];
}

export interface DoctorAvailability {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}
