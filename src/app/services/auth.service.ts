import { Injectable } from '@angular/core';
import { User } from '../models/user.interface';
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

  // Update parts of the current user object and persist
  // updateUser(partial: Partial<User>): void {
  //   const current = this.currentUserSubject.value;
  //   if (!current) return;
  //   const updated: User = { ...current, ...partial };
  //   localStorage.setItem(this.storageKey, JSON.stringify(updated));
  //   this.currentUserSubject.next(updated);
  // }

  // Synchronous access to current value
  get currentUserValue(): AuthUser | null {
    return this.currentUserSubject.value;
  }
}
