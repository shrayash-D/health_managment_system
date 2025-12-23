import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
 
@Component({
  selector: 'app-user-signup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usersignup.component.html',
  styleUrls: ['./usersignup.component.css'],
})
export class UserSignupComponent {
  passVisible = false;
  confirmVisible = false;
  toggle(field: 'pass' | 'confirm') {
    if (field === 'pass') this.passVisible = !this.passVisible;
    else this.confirmVisible = !this.confirmVisible;
  }
  get passType() { return this.passVisible ? 'text' : 'password'; }
  get confirmType() { return this.confirmVisible ? 'text' : 'password'; }
}
