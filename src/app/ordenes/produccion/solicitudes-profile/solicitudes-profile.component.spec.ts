import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudesProfileComponent } from './solicitudes-profile.component';

describe('SolicitudesProfileComponent', () => {
  let component: SolicitudesProfileComponent;
  let fixture: ComponentFixture<SolicitudesProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SolicitudesProfileComponent],
    });
    fixture = TestBed.createComponent(SolicitudesProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
