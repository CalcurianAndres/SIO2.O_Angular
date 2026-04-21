import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesEspecificacionComponent } from './detalles-especificacion.component';

describe('DetallesEspecificacionComponent', () => {
  let component: DetallesEspecificacionComponent;
  let fixture: ComponentFixture<DetallesEspecificacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DetallesEspecificacionComponent]
    });
    fixture = TestBed.createComponent(DetallesEspecificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
