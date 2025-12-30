import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const user = this.auth.currentUserValue;

    // not logged in -> go to login (preserve return url)
    if (!user) {
      return this.router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url },
      });
    }

    // route may specify allowed roles via data.roles (array of UserRole strings)
    const allowed = route.data?.['roles'] as string[] | undefined;

    console.log('AuthGuard: user role=', user.role, ' allowed=', allowed);
    if (
      allowed &&
      allowed.length > 0 &&
      !allowed.includes(user.role.toUpperCase())
    ) {
      // logged in but not authorized -> redirect to home (or show unauthorized page)
      return this.router.createUrlTree(['/']);
    }

    return true;
  }
}
