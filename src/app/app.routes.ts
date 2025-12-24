import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: 'doctor',
    loadChildren: () =>
      import('./doctor/doctor.module').then(m => m.DoctorModule)
  },
  {
  path: 'doctor/:id',
  loadComponent: () =>
    import('./doctor/doctor-profile/doctor-profile.component')
      .then(m => m.DoctorProfileComponent)
}
,
  { path: '', redirectTo: 'doctor/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'doctor/dashboard' }
];
