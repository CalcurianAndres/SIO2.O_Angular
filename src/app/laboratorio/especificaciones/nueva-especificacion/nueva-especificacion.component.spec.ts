import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaEspecificacionComponent } from './nueva-especificacion.component';

describe('NuevaEspecificacionComponent', () => {
  let component: NuevaEspecificacionComponent;
  let fixture: ComponentFixture<NuevaEspecificacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NuevaEspecificacionComponent]
    });
    fixture = TestBed.createComponent(NuevaEspecificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
