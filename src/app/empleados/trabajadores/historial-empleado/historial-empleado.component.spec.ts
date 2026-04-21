import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialEmpleadoComponent } from './historial-empleado.component';

describe('HistorialEmpleadoComponent', () => {
  let component: HistorialEmpleadoComponent;
  let fixture: ComponentFixture<HistorialEmpleadoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HistorialEmpleadoComponent]
    });
    fixture = TestBed.createComponent(HistorialEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
