export interface Patient {
  id: number;
  name: string;
  contactInfo: string;
  dob: string; // Date of Birth
  medicalHistory?: string;
  bloodGroup?: string;
  allergies?: string[];
  primaryPhysician?: string;
}
