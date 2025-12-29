import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Notification } from '../models/notification.interface';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notifications: Notification[] = [
    {
      id: 1,
      title: 'New Patient Registered',
      message: 'Emily Davis has registered as a new patient',
      type: 'INFO',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: false,
      link: '/admin/patients',
    },
    {
      id: 2,
      title: 'Appointment Reminder',
      message: '3 appointments scheduled for today need attention',
      type: 'WARNING',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      link: '/admin/appointments',
    },
    {
      id: 3,
      title: 'Payment Received',
      message: 'Payment of ₹2,050 received for invoice INV-10018',
      type: 'SUCCESS',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      read: false,
      link: '/admin/billing',
    },
    {
      id: 4,
      title: 'Appointment Cancelled',
      message: 'Appointment #5 for Michael Brown has been cancelled',
      type: 'WARNING',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      read: true,
      link: '/admin/appointments',
    },
    {
      id: 5,
      title: 'New Invoice Generated',
      message: 'Invoice INV-10020 generated for Emily Davis - ₹3,200',
      type: 'INFO',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      read: true,
      link: '/admin/billing',
    },
    {
      id: 6,
      title: 'Pending Payments Alert',
      message: '5 invoices with total ₹4,400 are pending payment',
      type: 'ERROR',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: false,
      link: '/admin/billing',
    },
    {
      id: 7,
      title: 'Doctor Availability Updated',
      message: 'Dr. Sarah Johnson has updated her availability schedule',
      type: 'INFO',
      timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      read: true,
      link: '/admin/doctors',
    },
  ];

  private notificationsSubject = new BehaviorSubject<Notification[]>(
    this.notifications
  );
  public notifications$ = this.notificationsSubject.asObservable();

  getAllNotifications(): Observable<Notification[]> {
    return of([...this.notifications]);
  }

  getUnreadCount(): Observable<number> {
    return of(this.notifications.filter((n) => !n.read).length);
  }

  markAsRead(id: number): Observable<boolean> {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
      this.notificationsSubject.next([...this.notifications]);
      return of(true);
    }
    return of(false);
  }

  markAllAsRead(): Observable<boolean> {
    this.notifications.forEach((n) => (n.read = true));
    this.notificationsSubject.next([...this.notifications]);
    return of(true);
  }

  deleteNotification(id: number): Observable<boolean> {
    const index = this.notifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.notificationsSubject.next([...this.notifications]);
      return of(true);
    }
    return of(false);
  }
}
