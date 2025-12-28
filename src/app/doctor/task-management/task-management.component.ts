import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileSidebarComponent } from '../profile-sidebar/profile-sidebar.component';

interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  completed: boolean;
}

@Component({
  selector: 'app-task-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfileSidebarComponent],
  templateUrl: './task-management.component.html',
  styleUrls: ['./task-management.component.css'],
})
export class TaskManagementComponent {
  sidebarCollapsed = false;

  tasks: Task[] = [
    { id: 1, title: 'Review patient reports', description: 'Check lab results', dueDate: '2025-12-28', priority: 'HIGH', completed: false },
    { id: 2, title: 'Approve prescriptions', description: 'Pending approvals', dueDate: '2025-12-29', priority: 'MEDIUM', completed: true },
    { id: 3, title: 'Schedule follow-up calls', description: 'Call patients for updates', dueDate: '2025-12-30', priority: 'LOW', completed: false },
  ];

  // Form fields
  newTaskTitle = '';
  newTaskDescription = '';
  newTaskDate = '';
  newTaskPriority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';

  onSidebarCollapse(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
  }

  addTask() {
    if (!this.newTaskTitle.trim()) return;

    const newTask: Task = {
      id: this.tasks.length + 1,
      title: this.newTaskTitle,
      description: this.newTaskDescription,
      dueDate: this.newTaskDate,
      priority: this.newTaskPriority,
      completed: false,
    };

    this.tasks.push(newTask);

    // Reset form
    this.newTaskTitle = '';
    this.newTaskDescription = '';
    this.newTaskDate = '';
    this.newTaskPriority = 'MEDIUM';
  }

  toggleTask(task: Task) {
    task.completed = !task.completed;
  }

  deleteTask(taskId: number) {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
  }
}
