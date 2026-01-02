import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const user = this.auth.currentUserValue;
    // If not logged in -> allow access to login/signup
    if (!user) return true;

    // If logged in -> redirect to appropriate dashboard based on role
    const role = (user.role || '').toString().toUpperCase();
    if (role === 'PATIENT') return this.router.createUrlTree(['/patient']);
    if (role === 'DOCTOR') return this.router.createUrlTree(['/doctor']);
    if (role === 'ADMIN') return this.router.createUrlTree(['/admin']);

    // fallback: go home
    return this.router.createUrlTree(['/']);
  }
}
