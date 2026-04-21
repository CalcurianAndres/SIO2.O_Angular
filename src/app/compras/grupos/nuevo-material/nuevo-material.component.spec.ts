import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoMaterialComponent } from './nuevo-material.component';

describe('NuevoMaterialComponent', () => {
  let component: NuevoMaterialComponent;
  let fixture: ComponentFixture<NuevoMaterialComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NuevoMaterialComponent]
    });
    fixture = TestBed.createComponent(NuevoMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
