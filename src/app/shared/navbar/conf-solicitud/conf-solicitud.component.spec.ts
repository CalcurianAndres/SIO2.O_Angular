import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfSolicitudComponent } from './conf-solicitud.component';

describe('ConfSolicitudComponent', () => {
  let component: ConfSolicitudComponent;
  let fixture: ComponentFixture<ConfSolicitudComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfSolicitudComponent]
    });
    fixture = TestBed.createComponent(ConfSolicitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
