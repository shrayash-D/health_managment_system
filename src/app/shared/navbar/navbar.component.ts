import { Component, signal, OnDestroy, DestroyRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, NgIf],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  // writable signal that will be updated from the auth observable
  isLoggedInUser = signal<boolean>(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private destroyRef: DestroyRef
  ) {
    console.log('NavbarComponent initialized');

    // initialize and subscribe to changes
    this.isLoggedInUser.set(this.authService.currentUserValue !== null);

    console.log('Initial isLoggedInUser value:', this.isLoggedInUser());
    const subscription = this.authService.currentUser$.subscribe((u) =>
      this.isLoggedInUser.set(!!u)
    );

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToDashboard() {
    const role = this.authService.currentUserValue?.role;

    if (role == 'PATIENT') {
      this.router.navigate(['/patient']);
    }
    if (role == 'DOCTOR') {
      this.router.navigate(['/doctor']);
    }
    if (role == 'ADMIN') {
      this.router.navigate(['/admin']);
    }
  }
}
