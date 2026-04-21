import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesRecepcionComponent } from './detalles-recepcion.component';

describe('DetallesRecepcionComponent', () => {
  let component: DetallesRecepcionComponent;
  let fixture: ComponentFixture<DetallesRecepcionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DetallesRecepcionComponent]
    });
    fixture = TestBed.createComponent(DetallesRecepcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
