import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoOrdenComponent } from './nuevo-orden.component';

describe('NuevoOrdenComponent', () => {
  let component: NuevoOrdenComponent;
  let fixture: ComponentFixture<NuevoOrdenComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NuevoOrdenComponent]
    });
    fixture = TestBed.createComponent(NuevoOrdenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
