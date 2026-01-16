import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthUser } from '../models/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly storageKey = 'currentUser';
  private currentUserSubject: BehaviorSubject<AuthUser | null>;
  public currentUser$: Observable<AuthUser | null>;

  constructor() {
    const stored = localStorage.getItem(this.storageKey);
    this.currentUserSubject = new BehaviorSubject<AuthUser | null>(
      stored ? (JSON.parse(stored) as AuthUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  signup(user: AuthUser): void {
    console.log('Signing up user:', user);
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // Call this after a successful login
  login(user: AuthUser): void {
    console.log('Logging in user:', user);
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // Clear login state
  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.currentUserSubject.next(null);
  }

 

  // Synchronous access to current value
  get currentUserValue(): AuthUser | null {
    return this.currentUserSubject.value;
  }
}
