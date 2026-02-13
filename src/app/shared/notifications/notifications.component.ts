import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationComponent {
  // inputs from the host
  @Input() unreadCount = 0;
  @Input() show = false;
  @Input() notifications: any[] = [];

  // outputs back to the host
  @Output() toggle = new EventEmitter<void>();
  @Output() markAll = new EventEmitter<void>();
  @Output() markRead = new EventEmitter<any>();
  @Output() delete = new EventEmitter<number>();

  onToggle(): void {
    this.toggle.emit();
  }

  onMarkAll(): void {
    this.markAll.emit();
  }

  onMarkRead(n: any): void {
    this.markRead.emit(n);
  }

  onDelete(id: number, event?: Event): void {
    event?.stopPropagation();
    this.delete.emit(id);
  }

  getNotificationIcon(type?: string): string {
    const icons: { [key: string]: string } = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      appointment: '📅',
      message: '💬',
      alert: '🔔',
    };
    return icons[type || 'info'] || '📢';
  }
}
