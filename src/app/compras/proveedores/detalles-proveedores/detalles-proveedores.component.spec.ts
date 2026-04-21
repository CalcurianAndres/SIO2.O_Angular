import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesProveedoresComponent } from './detalles-proveedores.component';

describe('DetallesProveedoresComponent', () => {
  let component: DetallesProveedoresComponent;
  let fixture: ComponentFixture<DetallesProveedoresComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DetallesProveedoresComponent]
    });
    fixture = TestBed.createComponent(DetallesProveedoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
