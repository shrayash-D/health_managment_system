import { Routes } from '@angular/router';
import { UserprofileComponent } from './patient/userprofile/userprofile.component';
import { LoginComponent } from '../app/shared/userlogin/userlogin.component';
import { UsersignupComponent } from './shared/usersignup/usersignup.component';
import { AppointmentFormComponent } from './patient/appointment-form/appointment-form.component';
import { PatientDashboardComponent } from './patient/patient-dashboard/patient-dashboard.component';
import { HeroSectionComponent } from './pages/hero-section/hero-section.component';
import { ContactUsComponent } from './pages/contact-us/contact-us.component';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { PatientManagementComponent } from './admin/patient-management/patient-management.component';
import { AppointmentManagementComponent } from './admin/appointment-management/appointment-management.component';
import { BillingManagementComponent } from './admin/billing-management/billing-management.component';
import { DoctorManagementComponent } from './admin/doctor-management/doctor-management.component';

import { DoctorProfileComponent } from './doctor/doctor-profile/doctor-profile.component';
import { DoctorDashboardComponent } from './doctor/doctor-dashboard/doctor-dashboard.component';

import { InvoiceListComponent } from './doctor/invoice-list/invoice-list.component';
import { AppointmentComponent } from './doctor/appointment/appointment.component';

import { PatientListComponent } from './doctor/patient-list/patient-list.component';

import { AuthGuard } from './services/auth.guard';
import { GuestGuard } from './services/guest.guard';
import { ErrorPageComponent } from './shared/error-page/error-page.component';
import { PatientHistoryComponent } from './patient/patient-history/patient-history.component';
import { DoctorListComponent } from './pages/doctor-list/doctor-list.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';

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
        component: UserprofileComponent,
      },
      {
        path: 'history',
        component: PatientHistoryComponent,
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
      { path: 'invoices', component: InvoiceListComponent },
      { path: 'appointment', component: AppointmentComponent },
      
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
  { path: 'login', component: LoginComponent, canActivate: [GuestGuard] },
  { path: 'signup', component: UsersignupComponent, canActivate: [GuestGuard] },

  // Default / public
  { path: '', component: HeroSectionComponent },
  { path: 'contact', component: ContactUsComponent },
  { path: 'All-doctors', component: DoctorListComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: '**', component: ErrorPageComponent },
];
