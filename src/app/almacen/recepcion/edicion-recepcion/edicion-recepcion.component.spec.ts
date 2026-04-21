import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdicionRecepcionComponent } from './edicion-recepcion.component';

describe('EdicionRecepcionComponent', () => {
  let component: EdicionRecepcionComponent;
  let fixture: ComponentFixture<EdicionRecepcionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EdicionRecepcionComponent]
    });
    fixture = TestBed.createComponent(EdicionRecepcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
