import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

type LayoutKey = 'admin' | 'doctor' | 'patient' | 'public';

interface NavItem {
  label: string;
  icon?: string;
  link: string;
}

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
  imports: [RouterLink, RouterOutlet, CommonModule],
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  layout: LayoutKey = 'public';
  headerTitle = 'Dashboard';
  badgeLabel = '';
  menu: NavItem[] = [];

  // keep simple notification placeholders (existing template expects these)
  unreadCount = 0;
  showNotifications = false;

  private sub = new Subscription();

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // set initial layout based on current url
    this.updateLayoutFromUrl(this.router.url);

    // update on navigation
    this.sub.add(
      this.router.events.subscribe((ev) => {
        if (ev instanceof NavigationEnd) {
          this.updateLayoutFromUrl(ev.urlAfterRedirects);
        }
      })
    );
  }

  private updateLayoutFromUrl(url: string): void {
    // normalize and pick first non-empty path segment
    const segment = (url || '').split('/').filter(Boolean)[0] || '';
    const key = (segment.toLowerCase() as LayoutKey) || 'public';
    this.layout =
      key === 'admin' || key === 'doctor' || key === 'patient' ? key : 'public';

    // configure header / badge / menu per layout
    switch (this.layout) {
      case 'admin':
        this.headerTitle = 'Admin Panel';
        this.badgeLabel = 'Admin';
        this.menu = [
          { label: 'Dashboard', icon: '📊', link: '/admin/dashboard' },
          { label: 'Patients', icon: '👥', link: '/admin/patients' },
          { label: 'Appointments', icon: '📅', link: '/admin/appointments' },
          { label: 'Billing', icon: '💰', link: '/admin/billing' },
          { label: 'Doctors', icon: '👨‍⚕️', link: '/admin/doctors' },
        ];
        break;

      case 'doctor':
        this.headerTitle = 'Doctor Panel';
        this.badgeLabel = 'Doctor';
        this.menu = [
          { label: 'Dashboard', icon: '📋', link: '/doctor/dashboard' },
          { label: 'Profile', icon: '👤', link: '/doctor/profile' },
          { label: 'Tasks', icon: '🗂️', link: '/doctor/tasks' },
          { label: 'Appointments', icon: '📅', link: '/doctor/appointment' },
          { label: 'Patients', icon: '👥', link: '/doctor/patients' },
        ];
        break;

      case 'patient':
        this.headerTitle = 'Patient Panel';
        this.badgeLabel = 'Patient';
        this.menu = [
          { label: 'Dashboard', icon: '🏠', link: '/patient/dashboard' },
          { label: 'Profile', icon: '👤', link: '/patient/profile' },
          { label: 'Appointments', icon: '📅', link: '/patient/appointments' },
        ];
        break;

      default:
        this.headerTitle = 'Dashboard';
        this.badgeLabel = '';
        this.menu = [];
    }
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }
  markAllAsRead(): void {
    this.unreadCount = 0;
  }
  markAsRead(_notification: any): void {
    /* placeholder */
  }
  deleteNotification(_id: number, _event?: Event): void {
    _event?.stopPropagation();
    /* placeholder */
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
