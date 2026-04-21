import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudMaterialComponent } from './solicitud-material.component';

describe('SolicitudMaterialComponent', () => {
  let component: SolicitudMaterialComponent;
  let fixture: ComponentFixture<SolicitudMaterialComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SolicitudMaterialComponent]
    });
    fixture = TestBed.createComponent(SolicitudMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
