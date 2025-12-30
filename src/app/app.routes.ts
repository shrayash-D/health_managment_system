import { Routes } from '@angular/router';
import { UserprofileComponent } from './userprofile/userprofile.component';
import { LoginComponent } from './userlogin/userlogin.component';
import { UsersignupComponent } from './usersignup/usersignup.component';
import { AppointmentFormComponent } from './appointment-form/appointment-form.component';
import { PatientDashboardComponent } from './patient-dashboard/patient-dashboard.component';
import { HeroSectionComponent } from './hero-section/hero-section.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { PatientManagementComponent } from './admin/patient-management/patient-management.component';
import { AppointmentManagementComponent } from './admin/appointment-management/appointment-management.component';
import { BillingManagementComponent } from './admin/billing-management/billing-management.component';
import { DoctorManagementComponent } from './admin/doctor-management/doctor-management.component';

import { DoctorProfileComponent } from './doctor/doctor-profile/doctor-profile.component';
import { DoctorDashboardComponent } from './doctor/doctor-dashboard/doctor-dashboard.component';
import { TaskManagementComponent } from './doctor/task-management/task-management.component';
import { InvoiceListComponent } from './doctor/invoice-list/invoice-list.component';
import { AppointmentComponent } from './doctor/appointment/appointment.component';
import { EmrComponent } from './doctor/emr/emr.component';
import { PatientListComponent } from './doctor/patient-list/patient-list.component';

import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  // Patient (nested) - only PATIENT role allowed
  {
    path: 'patient',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PATIENT'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: PatientDashboardComponent },
      {
        path: 'profile',
        component: UserprofileComponent /*, canActivate: [AuthGuard] */,
      },
      {
        path: 'history',
        component: /* PatientHistoryComponent */ PatientDashboardComponent, // adjust if separate component exists
      },
      { path: 'appointments', component: AppointmentFormComponent },
    ],
  },

  // Doctor (nested) - only DOCTOR role allowed
  {
    path: 'doctor',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    data: { roles: ['DOCTOR'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DoctorDashboardComponent },
      { path: 'profile', component: DoctorProfileComponent },
      { path: 'tasks', component: TaskManagementComponent },
      { path: 'invoices', component: InvoiceListComponent },
      { path: 'appointment', component: AppointmentComponent },
      { path: 'emr', component: EmrComponent },
      { path: 'patients', component: PatientListComponent },
    ],
  },

  // Admin (nested) - only ADMIN role allowed
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'patients', component: PatientManagementComponent },
      { path: 'appointments', component: AppointmentManagementComponent },
      { path: 'billing', component: BillingManagementComponent },
      { path: 'doctors', component: DoctorManagementComponent },
    ],
  },

  // Public / Auth
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: UsersignupComponent },
  { path: 'appointment', component: AppointmentFormComponent },

  // Default / public
  { path: '', component: HeroSectionComponent },
  { path: 'contact', component: ContactUsComponent },
];
