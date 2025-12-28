import { Routes } from '@angular/router';

export const routes: Routes = [
  // Doctor profile
  {
    path: 'doctor/profile',
    loadComponent: () =>
      import('./doctor/doctor-profile/doctor-profile.component').then(
        m => m.DoctorProfileComponent
      ),
  },

  // Doctor dashboard
  {
    path: 'doctor/dashboard',
    loadComponent: () =>
      import('./doctor/doctor-dashboard/doctor-dashboard.component').then(
        m => m.DoctorDashboardComponent
      ),
  },

  // Doctor tasks
  {
    path: 'doctor/tasks',
    loadComponent: () =>
      import('./doctor/task-management/task-management.component').then(
        m => m.TaskManagementComponent
      ),
  },

  // Doctor invoices
  {
    path: 'doctor/invoices',
    loadComponent: () =>
      import('./doctor/invoice-list/invoice-list.component').then(
        m => m.InvoiceListComponent
      ),
  },

  // Doctor appointment
  {
    path: 'doctor/appointment',
    loadComponent: () =>
      import('./doctor/appointment/appointment.component').then(
        m => m.AppointmentComponent
      ),
  },

  // Doctor EMR
  {
    path: 'doctor/emr',
    loadComponent: () =>
      import('./doctor/emr/emr.component').then(m => m.EmrComponent),
  },

  // Doctor patients
  {
    path: 'doctor/patients',
    loadComponent: () =>
      import('./doctor/patient-list/patient-list.component').then(
        m => m.PatientListComponent
      ),
  },

  // Default redirect
  { path: '', redirectTo: 'doctor/profile', pathMatch: 'full' },

  // Wildcard fallback
  { path: '**', redirectTo: 'doctor/dashboard' },
];
