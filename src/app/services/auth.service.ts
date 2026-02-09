import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { User } from '../models/user.interface';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import {
  AuthUser,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
} from '../models/auth.interface';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly storageKey = 'currentUser';
  private readonly tokenKey = 'auth_token';
  private readonly refreshTokenKey = 'refresh_token';
  private currentUserSubject: BehaviorSubject<AuthUser | null>;
  public currentUser$: Observable<AuthUser | null>;
  private apiUrl = `${environment.apiUrl}/Auth`;

  constructor(private http: HttpClient) {
    const stored = localStorage.getItem(this.storageKey);
    this.currentUserSubject = new BehaviorSubject<AuthUser | null>(
      stored ? (JSON.parse(stored) as AuthUser) : null,
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /**
   * Login with API call
   * @param loginRequest - email, password, and role
   * @returns Observable<LoginResponse>
   */
  loginWithAPI(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        map((response: LoginResponse) => {
          // Store user data and token
          const user: AuthUser = {
            id: response.id,
            email: response.email,
            name: response.name,
            role: response.role,
            token: response.token,
            refreshToken: response.refreshToken,
            expiresAt: new Date(response.expiresAt),
          };

          // Save to localStorage
          localStorage.setItem(this.storageKey, JSON.stringify(user));
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem(this.refreshTokenKey, response.refreshToken);

          // Update BehaviorSubject
          this.currentUserSubject.next(user);

          return response;
        }),
        catchError(this.handleError),
      );
  }

  /**
   * Signup with API call
   * @param signupRequest - email, password, name, role, phoneNumber, and optional dob
   * @returns Observable<SignupResponse>
   */
  signupWithAPI(signupRequest: SignupRequest): Observable<SignupResponse> {
    return this.http
      .post<SignupResponse>(`${this.apiUrl}/signup`, signupRequest)
      .pipe(
        map((response: SignupResponse) => {
          console.log('Signup successful:', response);
          return response;
        }),
        catchError(this.handleError),
      );
  }

  signup(user: AuthUser): void {
    console.log('Signing up user:', user);
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // Call this after a successful login (legacy method for mock data)
  login(user: AuthUser): void {
    console.log('Logging in user:', user);
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // Clear login state
  logout(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.currentUserSubject.next(null);
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Get stored refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.currentUserValue;

    if (!token || !user) {
      return false;
    }

    // Check if token is expired
    if (user.expiresAt && new Date(user.expiresAt) < new Date()) {
      return false;
    }

    return true;
  }

  // Synchronous access to current value
  get currentUserValue(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  // Error handler
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;

      // Handle specific error cases
      if (error.status === 401) {
        errorMessage = 'Invalid credentials or role mismatch';
      } else if (error.status === 400) {
        errorMessage = 'Invalid request. Please check your input.';
      } else if (error.status === 0) {
        errorMessage =
          'Cannot connect to server. Please check if the backend is running.';
      }
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
