import { Routes } from '@angular/router';
import { UserprofileComponent } from './userprofile/userprofile.component';
import { LoginComponent } from './userlogin/userlogin.component';
import { AuthGuard } from './services/auth.guard';
import { UsersignupComponent } from './usersignup/usersignup.component';
import { AppointmentFormComponent } from './appointment-form/appointment-form.component';
import { PatientDashboardComponent } from './patient-dashboard/patient-dashboard.component';
export const routes: Routes = [
  {
    path: '',
    component: PatientDashboardComponent,
    pathMatch: 'full',
  },
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
];
