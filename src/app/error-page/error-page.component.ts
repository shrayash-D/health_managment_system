import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.css'],
})
export class ErrorPageComponent {
  goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      location.href = '/';
    }
  }
}
