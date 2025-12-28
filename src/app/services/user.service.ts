import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User, UserRole } from '../models/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private mockUsers: User[] = [
    {
      id: 1,
      username: 'john.doe',
      password: 'hashed_password',
      role: 'PATIENT',
      email: 'john.doe@example.com',
      name: 'John Doe',
    },
    {
      id: 2,
      username: 'jane.smith',
      password: 'hashed_password',
      role: 'PATIENT',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
    },
    {
      id: 3,
      username: 'sarah.johnson',
      password: 'hashed_password',
      role: 'DOCTOR',
      email: 'sarah.johnson@healthconnect.com',
      name: 'Dr. Sarah Johnson',
    },
    {
      id: 4,
      username: 'michael.chen',
      password: 'hashed_password',
      role: 'DOCTOR',
      email: 'michael.chen@healthconnect.com',
      name: 'Dr. Michael Chen',
    },
    {
      id: 5,
      username: 'admin',
      password: 'hashed_password',
      role: 'ADMIN',
      email: 'admin@healthconnect.com',
      name: 'System Admin',
    },
  ];

  getAllUsers(): Observable<User[]> {
    return of([...this.mockUsers]);
  }

  getUserById(id: number): Observable<User | undefined> {
    const user = this.mockUsers.find((u) => u.id === id);
    return of(user);
  }

  getUsersByRole(role: UserRole): Observable<User[]> {
    const users = this.mockUsers.filter((u) => u.role === role);
    return of(users);
  }

  getUserByEntityId(
    entityId: number,
    role: UserRole
  ): Observable<User | undefined> {
    // In real app, this would link user to patient/doctor by entityId
    const user = this.mockUsers.find(
      (u) => u.role === role && u.id === entityId
    );
    return of(user);
  }

  createUser(user: User): Observable<User> {
    const newId = Math.max(...this.mockUsers.map((u) => u.id), 0) + 1;
    const newUser: User = { ...user, id: newId };
    this.mockUsers.push(newUser);
    return of(newUser);
  }

  updateUser(id: number, user: User): Observable<User> {
    const index = this.mockUsers.findIndex((u) => u.id === id);
    if (index !== -1) {
      this.mockUsers[index] = { ...user, id };
      return of(this.mockUsers[index]);
    }
    return of(user);
  }

  deleteUser(id: number): Observable<boolean> {
    const index = this.mockUsers.findIndex((u) => u.id === id);
    if (index !== -1) {
      this.mockUsers.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  resetPassword(id: number, newPassword: string): Observable<boolean> {
    const index = this.mockUsers.findIndex((u) => u.id === id);
    if (index !== -1) {
      this.mockUsers[index].password = newPassword;
      return of(true);
    }
    return of(false);
  }
}
