import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EspecificacionesComponent } from './especificaciones.component';

describe('EspecificacionesComponent', () => {
  let component: EspecificacionesComponent;
  let fixture: ComponentFixture<EspecificacionesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EspecificacionesComponent]
    });
    fixture = TestBed.createComponent(EspecificacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
