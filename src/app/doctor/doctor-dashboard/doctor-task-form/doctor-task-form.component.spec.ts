import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorTaskFormComponent } from './doctor-task-form.component';

describe('DoctorTaskFormComponent', () => {
  let component: DoctorTaskFormComponent;
  let fixture: ComponentFixture<DoctorTaskFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorTaskFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorTaskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
