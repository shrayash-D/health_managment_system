import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
title = 'hospitakl_project';
  isLayout: boolean = false;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      // Without this filter, your code would try to update the isLayout variable 5 or 6 times for every single page click. By using NavigationEnd, you ensure the logic only runs once the URL has officially changed.
      .subscribe((event: any) => {
        this.isLayout = ['/admin', '/patient', '/doctor'].some((prefix) =>
          event.url.startsWith(prefix)
        );
      });
  }
}
