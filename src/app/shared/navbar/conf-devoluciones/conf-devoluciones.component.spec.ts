import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfDevolucionesComponent } from './conf-devoluciones.component';

describe('ConfDevolucionesComponent', () => {
  let component: ConfDevolucionesComponent;
  let fixture: ComponentFixture<ConfDevolucionesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfDevolucionesComponent]
    });
    fixture = TestBed.createComponent(ConfDevolucionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
