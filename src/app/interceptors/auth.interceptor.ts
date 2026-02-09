import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Clone the request and add the authorization header if token exists
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If we get a 401 error and it's not a login or refresh request
      if (
        error.status === 401 &&
        !req.url.includes('/api/auth/login') &&
        !req.url.includes('/api/auth/Refresh')
      ) {
        // Try to refresh the token
        return authService.refreshToken().pipe(
          switchMap((response) => {
            // Clone the original request with the new token
            const clonedRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.token}`,
              },
            });
            // Retry the original request
            return next(clonedRequest);
          }),
          catchError((refreshError) => {
            // If refresh fails, logout and redirect to login
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          }),
        );
      }

      // For other errors, just pass them through
      return throwError(() => error);
    }),
  );
};
