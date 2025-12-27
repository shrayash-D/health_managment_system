import { Component } from '@angular/core';

@Component({
  selector: 'app-userprofile',
  imports: [],
  templateUrl: './userprofile.component.html',
  styleUrl: './userprofile.component.css'
})
export class UserprofileComponent {
passwordVisible: any;
togglePassword() {
throw new Error('Method not implemented.');
}
passwordType: any;
// Flag to control popup visibility
  isPopupVisible: boolean = false;

togglePopup() {
    this.isPopupVisible = !this.isPopupVisible;
}

}
