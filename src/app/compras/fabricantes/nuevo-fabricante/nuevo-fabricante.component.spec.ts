import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoFabricanteComponent } from './nuevo-fabricante.component';

describe('NuevoFabricanteComponent', () => {
  let component: NuevoFabricanteComponent;
  let fixture: ComponentFixture<NuevoFabricanteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NuevoFabricanteComponent]
    });
    fixture = TestBed.createComponent(NuevoFabricanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
