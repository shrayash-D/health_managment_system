import { Injectable } from '@angular/core';
import { CanActivate, CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })

export class AuthGuard implements CanActivate {
constructor(private authService: AuthService, private router: Router) {} 

canActivate(): boolean { 
  if (this.authService.isLoggedIn()) { 
    return true;  // allow navigation 
  } 
    else { 
      this.router.navigate(['']); // redirect if not logged in 
      return false;
    } 
  } 
}
