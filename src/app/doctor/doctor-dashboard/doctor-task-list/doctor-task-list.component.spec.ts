import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorTaskListComponent } from './doctor-task-list.component';

describe('DoctorTaskListComponent', () => {
  let component: DoctorTaskListComponent;
  let fixture: ComponentFixture<DoctorTaskListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorTaskListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorTaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
