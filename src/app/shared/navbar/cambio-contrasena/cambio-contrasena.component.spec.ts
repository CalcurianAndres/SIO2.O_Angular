import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CambioContrasenaComponent } from './cambio-contrasena.component';

describe('CambioContrasenaComponent', () => {
  let component: CambioContrasenaComponent;
  let fixture: ComponentFixture<CambioContrasenaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CambioContrasenaComponent]
    });
    fixture = TestBed.createComponent(CambioContrasenaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
