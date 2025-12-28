import { Routes } from '@angular/router';
import { HeroSectionComponent } from './hero-section/hero-section.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { PatientManagementComponent } from './admin/patient-management/patient-management.component';
import { AppointmentManagementComponent } from './admin/appointment-management/appointment-management.component';
import { BillingManagementComponent } from './admin/billing-management/billing-management.component';
import { DoctorManagementComponent } from './admin/doctor-management/doctor-management.component';

export const routes: Routes = [
  {
    path: '',
    component: HeroSectionComponent,
  },
  {
    path: 'contact',
    component: ContactUsComponent,
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
      },
      {
        path: 'patients',
        component: PatientManagementComponent,
      },
      {
        path: 'appointments',
        component: AppointmentManagementComponent,
      },
      {
        path: 'billing',
        component: BillingManagementComponent,
      },
      {
        path: 'doctors',
        component: DoctorManagementComponent,
      },
    ],
  },
];
