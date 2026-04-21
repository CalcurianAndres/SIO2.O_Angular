import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoHorarioComponent } from './nuevo-horario.component';

describe('NuevoHorarioComponent', () => {
  let component: NuevoHorarioComponent;
  let fixture: ComponentFixture<NuevoHorarioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NuevoHorarioComponent]
    });
    fixture = TestBed.createComponent(NuevoHorarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
