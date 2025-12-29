import { Component } from '@angular/core';
import { DoctorDataService } from '../../../services/doctor-data.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-doctor-task-form',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterOutlet],
  templateUrl: './doctor-task-form.component.html',
  styleUrls: ['./doctor-task-form.component.css']
})
export class DoctorTaskFormComponent {
  description = '';
  staff = '';
   sidebarCollapsed = false;

  constructor(private doctorService: DoctorDataService) {}

  addTask() {
    if (!this.description.trim() || !this.staff.trim()) return;

    const newTask = {
      id: Date.now(),
      description: this.description.trim(),
      staff: this.staff.trim(),
      status: 'Pending' as const
    };

    this.doctorService.addTask(newTask);
    this.description = '';
    this.staff = '';
  }

   onSidebarCollapse(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
  }
}
