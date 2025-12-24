import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DoctorRoutingModule } from './doctor-routing.module';
import { DoctorDashboardComponent } from './doctor-dashboard/doctor-dashboard.component';
import { DoctorProfileComponent } from './doctor-profile/doctor-profile.component';
import { DoctorTaskListComponent } from '../../../src/app/doctor/doctor-dashboard/doctor-task-list/doctor-task-list.component';
import { DoctorTaskFormComponent } from '../../../src/app/doctor/doctor-dashboard/doctor-task-form/doctor-task-form.component';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [ ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    DoctorRoutingModule,
    DoctorTaskFormComponent,
    DoctorTaskListComponent,
    DoctorDashboardComponent,
    DoctorProfileComponent
  ],
  exports: [
    DoctorDashboardComponent,
    DoctorProfileComponent,
    DoctorTaskListComponent,
    DoctorTaskFormComponent
  ]
})
export class DoctorModule {}
