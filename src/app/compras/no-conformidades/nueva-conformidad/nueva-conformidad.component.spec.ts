import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaConformidadComponent } from './nueva-conformidad.component';

describe('NuevaConformidadComponent', () => {
  let component: NuevaConformidadComponent;
  let fixture: ComponentFixture<NuevaConformidadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NuevaConformidadComponent]
    });
    fixture = TestBed.createComponent(NuevaConformidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
