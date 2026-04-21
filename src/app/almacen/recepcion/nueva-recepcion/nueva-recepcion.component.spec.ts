import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaRecepcionComponent } from './nueva-recepcion.component';

describe('NuevaRecepcionComponent', () => {
  let component: NuevaRecepcionComponent;
  let fixture: ComponentFixture<NuevaRecepcionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NuevaRecepcionComponent]
    });
    fixture = TestBed.createComponent(NuevaRecepcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
