import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DoctorService } from '../../services/doctor.service';
import { Doctor } from '../../models/doctor.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-doctor-list',
  templateUrl: './doctor-list.component.html',
  styleUrls: ['./doctor-list.component.css'],
  imports: [CommonModule, FormsModule],
})
export class DoctorListComponent implements OnInit {
  doctors$!: Observable<Doctor[]>;

  // Simple client-side filters (optional UI controls in template)
  search = '';
  specialization = '';

  constructor(private doctorService: DoctorService) {}

  ngOnInit(): void {
    this.doctors$ = this.doctorService.getAllDoctors();
  }

  /** Basic filter: matches name, specialization, department, email */
  matches(d: Doctor): boolean {
    const q = this.search.trim().toLowerCase();
    const spec = this.specialization.trim().toLowerCase();

    const haystack = (
      d.name +
      ' ' +
      d.specialization +
      ' ' +
      d.department +
      ' ' +
      d.email
    ).toLowerCase();

    const okQ = q ? haystack.includes(q) : true;
    const okS = spec ? d.specialization.toLowerCase().includes(spec) : true;
    return okQ && okS;
  }
}
