import { Routes } from '@angular/router';
import { UserprofileComponent } from './userprofile/userprofile.component';
import { LoginComponent } from './userlogin/userlogin.component';
import { AuthGuard } from './services/auth.guard';
import { UsersignupComponent } from './usersignup/usersignup.component';
import { AppointmentFormComponent } from './appointment-form/appointment-form.component';
import { PatientDashboardComponent } from './patient-dashboard/patient-dashboard.component';
export const routes: Routes = [
  // Doctor profile
  {
    path: '',
    component: PatientDashboardComponent,
    pathMatch: 'full',
  },
  {
    path: 'doctor/profile',
    loadComponent: () =>
      import('./doctor/doctor-profile/doctor-profile.component').then(
        (m) => m.DoctorProfileComponent
      ),
  },

  // Doctor dashboard
  {
    path: 'profile',
    component: UserprofileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'signup',
    component: UsersignupComponent,
  },
  {
    path: 'appointment',
    component: AppointmentFormComponent,
  },
  {
    path: 'doctor/dashboard',
    loadComponent: () =>
      import('./doctor/doctor-dashboard/doctor-dashboard.component').then(
        (m) => m.DoctorDashboardComponent
      ),
  },

  // Doctor tasks
  {
    path: 'doctor/tasks',
    loadComponent: () =>
      import('./doctor/task-management/task-management.component').then(
        (m) => m.TaskManagementComponent
      ),
  },

  // Doctor invoices
  {
    path: 'doctor/invoices',
    loadComponent: () =>
      import('./doctor/invoice-list/invoice-list.component').then(
        (m) => m.InvoiceListComponent
      ),
  },

  // Doctor appointment
  {
    path: 'doctor/appointment',
    loadComponent: () =>
      import('./doctor/appointment/appointment.component').then(
        (m) => m.AppointmentComponent
      ),
  },

  // Doctor EMR
  {
    path: 'doctor/emr',
    loadComponent: () =>
      import('./doctor/emr/emr.component').then((m) => m.EmrComponent),
  },

  // Doctor patients
  {
    path: 'doctor/patients',
    loadComponent: () =>
      import('./doctor/patient-list/patient-list.component').then(
        (m) => m.PatientListComponent
      ),
  },

  // Default redirect
  { path: '', redirectTo: 'doctor/profile', pathMatch: 'full' },

  // Wildcard fallback
  { path: '**', redirectTo: 'doctor/dashboard' },
];
