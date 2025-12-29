
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { MedicalHistoryService, MedicalEntry } from '../services/medical-history.service';

@Component({
  selector: 'app-patient-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-history.component.html',
  styleUrls: ['./patient-history.component.css'],
})
export class PatientHistoryComponent implements OnInit {
  // Declare, then assign later (after DI is ready)
  history$!: Observable<MedicalEntry[]>;

  constructor(private readonly svc: MedicalHistoryService) {}

  ngOnInit(): void {
    // Safe to use here; DI has constructed the instance
    this.history$ = this.svc.getHistory();
  }
}
