import { Component, OnInit } from '@angular/core';
import { DoctorDataService, Task } from '../../../services/doctor-data.service';
import { DoctorTaskFormComponent } from "../doctor-task-form/doctor-task-form.component";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-doctor-task-list',
  templateUrl: './doctor-task-list.component.html',
  styleUrls: ['./doctor-task-list.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, DoctorTaskFormComponent]
})
export class DoctorTaskListComponent implements OnInit {
  tasks: Task[] = [];

  constructor(private doctorService: DoctorDataService) {}

  ngOnInit(): void {
    this.doctorService.tasks$.subscribe(data => this.tasks = data);
  }

  markComplete(task: Task) {
    this.doctorService.updateTask({ ...task, status: 'Completed' });
  }

  deleteTask(id: number) {
    this.doctorService.deleteTask(id);
  }
}
