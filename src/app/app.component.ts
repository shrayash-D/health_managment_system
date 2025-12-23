import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserloginComponent } from "./userlogin/userlogin.component";
import { UserSignupComponent } from "./usersignup/usersignup.component";
import { UserprofileComponent } from "./userprofile/userprofile.component";
import { AppointmentFormComponent } from "./appointment-form/appointment-form.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UserloginComponent, UserSignupComponent, UserprofileComponent, AppointmentFormComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Hospital';
}
