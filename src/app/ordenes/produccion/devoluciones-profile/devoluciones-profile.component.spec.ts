import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevolucionesProfileComponent } from './devoluciones-profile.component';

describe('DevolucionesProfileComponent', () => {
  let component: DevolucionesProfileComponent;
  let fixture: ComponentFixture<DevolucionesProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DevolucionesProfileComponent]
    });
    fixture = TestBed.createComponent(DevolucionesProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
