import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { DiagnosisFormComponent } from './diagnosis-form/diagnosis-form.component';
import { PrescriptionFormComponent } from './prescription-form/prescription-form.component';
import { PatientDashboardComponent } from './patient-dashboard/patient-dashboard.component';
import { LoginComponent } from './userlogin/userlogin.component';
import { UsersignupComponent } from './usersignup/usersignup.component';
import { UserprofileComponent } from './userprofile/userprofile.component';
import { AppointmentFormComponent } from './appointment-form/appointment-form.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'hospital_project';
  isLayout: boolean = false;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isLayout = ['/admin', '/patient', '/doctor'].some((prefix) =>
          event.url.startsWith(prefix)
        );
      });
  }
}
