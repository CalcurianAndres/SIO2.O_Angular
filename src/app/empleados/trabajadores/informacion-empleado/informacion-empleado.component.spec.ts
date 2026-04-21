import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacionEmpleadoComponent } from './informacion-empleado.component';

describe('InformacionEmpleadoComponent', () => {
  let component: InformacionEmpleadoComponent;
  let fixture: ComponentFixture<InformacionEmpleadoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InformacionEmpleadoComponent]
    });
    fixture = TestBed.createComponent(InformacionEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
