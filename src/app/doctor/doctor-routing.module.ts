import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./doctor-dashboard/doctor-dashboard.component').then(
        (m) => m.DoctorDashboardComponent
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./doctor-profile/doctor-profile.component').then(
        (m) => m.DoctorProfileComponent
      ),
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./task-management/task-management.component').then(
        (m) => m.TaskManagementComponent
      ),
  },
  {
    path: 'appointment',
    loadComponent: () =>
      import('./appointment/appointment.component').then(
        (m) => m.AppointmentComponent
      ),
  },
  { path: '', redirectTo: 'profile', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DoctorRoutingModule {}
