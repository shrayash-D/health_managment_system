import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { DiagnosisFormComponent } from './diagnosis-form/diagnosis-form.component';
import { PrescriptionFormComponent } from './prescription-form/prescription-form.component';
import { PatientDashboardComponent } from './patient-dashboard/patient-dashboard.component';
import { LoginComponent } from './userlogin/userlogin.component';
import { UsersignupComponent } from './usersignup/usersignup.component';
import { UserprofileComponent } from './userprofile/userprofile.component';
import { AppointmentFormComponent } from './appointment-form/appointment-form.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ContactUsComponent,
    DiagnosisFormComponent,
    PrescriptionFormComponent,
    PatientDashboardComponent,
    AppointmentFormComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'hospital_project';
}
