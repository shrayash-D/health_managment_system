import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DoctorRoutingModule } from './doctor-routing.module';
import { DoctorDashboardComponent } from './doctor-dashboard/doctor-dashboard.component';
import { DoctorProfileComponent } from './doctor-profile/doctor-profile.component';
import { DoctorTaskListComponent } from './doctor-dashboard/doctor-task-list/doctor-task-list.component';
import { DoctorTaskFormComponent } from './doctor-dashboard/doctor-task-form/doctor-task-form.component';
import { TaskManagementComponent } from './task-management/task-management.component';
import { RouterModule } from '@angular/router';
import { AppointmentComponent } from './appointment/appointment.component';


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
    //TaskManagementComponent,
    DoctorDashboardComponent,
    DoctorProfileComponent,
    AppointmentComponent,

    
  ],
  exports: [
    DoctorDashboardComponent,
    DoctorProfileComponent,
    DoctorTaskListComponent,
    DoctorTaskFormComponent
  ]
})
export class DoctorModule {}
