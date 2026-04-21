import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaGestionComponent } from './nueva-gestion.component';

describe('NuevaGestionComponent', () => {
  let component: NuevaGestionComponent;
  let fixture: ComponentFixture<NuevaGestionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NuevaGestionComponent]
    });
    fixture = TestBed.createComponent(NuevaGestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
