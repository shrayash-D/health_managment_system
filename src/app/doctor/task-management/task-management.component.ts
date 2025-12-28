import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileSidebarComponent } from '../profile-sidebar/profile-sidebar.component';
import { DoctorDataService, Task } from '../../services/doctor-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-task-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfileSidebarComponent],
  templateUrl: './task-management.component.html',
  styleUrls: ['./task-management.component.css'],
})
export class TaskManagementComponent implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  private subscriptions: Subscription = new Subscription();

  tasks: Task[] = [];

  // Form fields
  newTaskTitle = '';
  newTaskDescription = '';
  newTaskDate = '';
  newTaskPriority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';

  constructor(private doctorService: DoctorDataService) {}

  ngOnInit() {
    this.subscriptions.add(
      this.doctorService.tasks$.subscribe(tasks => {
        this.tasks = tasks;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  onSidebarCollapse(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
  }

  addTask() {
    if (!this.newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now(),
      description: this.newTaskTitle.trim() + (this.newTaskDescription ? ' - ' + this.newTaskDescription.trim() : ''),
      staff: 'Doctor', // Default staff
      status: 'Pending'
    };

    this.doctorService.addTask(newTask);

    // Reset form
    this.newTaskTitle = '';
    this.newTaskDescription = '';
    this.newTaskDate = '';
    this.newTaskPriority = 'MEDIUM';
  }

  toggleTask(task: Task) {
    const updatedTask = { ...task, status: task.status === 'Completed' ? 'Pending' as const : 'Completed' as const };
    this.doctorService.updateTask(updatedTask);
  }

  deleteTask(taskId: number) {
    this.doctorService.deleteTask(taskId);
  }
}
