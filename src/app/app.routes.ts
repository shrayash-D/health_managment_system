import { Routes } from '@angular/router';
import { UserprofileComponent } from './userprofile/userprofile.component';
import { LoginComponent } from './userlogin/userlogin.component';
// import { AuthGuard } from './services/auth.guard';
import { UsersignupComponent } from './usersignup/usersignup.component';
import { AppointmentFormComponent } from './appointment-form/appointment-form.component';
import { PatientDashboardComponent } from './patient-dashboard/patient-dashboard.component';
import { PatientHistoryComponent } from './patient-history/patient-history.component';
import { HeroSectionComponent } from './hero-section/hero-section.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { PatientManagementComponent } from './admin/patient-management/patient-management.component';
import { AppointmentManagementComponent } from './admin/appointment-management/appointment-management.component';
import { BillingManagementComponent } from './admin/billing-management/billing-management.component';
import { DoctorManagementComponent } from './admin/doctor-management/doctor-management.component';

/* Direct (non-lazy) doctor imports */
import { DoctorProfileComponent } from './doctor/doctor-profile/doctor-profile.component';
import { DoctorDashboardComponent } from './doctor/doctor-dashboard/doctor-dashboard.component';
import { TaskManagementComponent } from './doctor/task-management/task-management.component';
import { InvoiceListComponent } from './doctor/invoice-list/invoice-list.component';
import { AppointmentComponent } from './doctor/appointment/appointment.component';
import { EmrComponent } from './doctor/emr/emr.component';
import { PatientListComponent } from './doctor/patient-list/patient-list.component';

export const routes: Routes = [
  // Patient
  {
    path: 'patient',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: PatientDashboardComponent },
      {
        path: 'profile',
        component: UserprofileComponent /*, canActivate: [AuthGuard] */,
      },
      { path: 'history', component: PatientHistoryComponent },
      { path: 'appointments', component: AppointmentFormComponent },
    ],
  },

  // Doctor
  {
    path: 'doctor',
    component: AdminLayoutComponent,
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

  // Admin (nested)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'patients', component: PatientManagementComponent },
      { path: 'appointments', component: AppointmentManagementComponent },
      { path: 'billing', component: BillingManagementComponent },
      { path: 'doctors', component: DoctorManagementComponent },
    ],
  },

  // Auth
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: UsersignupComponent },

  // Default / public
  { path: '', component: HeroSectionComponent },
  { path: 'contact', component: ContactUsComponent },
];
