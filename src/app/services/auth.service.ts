import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  email: string;
  role: string;
  name?: string;
  token?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly storageKey = 'currentUser';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor() {
    const stored = localStorage.getItem(this.storageKey);
    this.currentUserSubject = new BehaviorSubject<User | null>(
      stored ? (JSON.parse(stored) as User) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  // Call this after a successful login
  login(user: User): void {
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
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
}
