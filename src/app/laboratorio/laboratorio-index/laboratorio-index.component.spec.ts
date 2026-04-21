import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaboratorioIndexComponent } from './laboratorio-index.component';

describe('LaboratorioIndexComponent', () => {
  let component: LaboratorioIndexComponent;
  let fixture: ComponentFixture<LaboratorioIndexComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LaboratorioIndexComponent]
    });
    fixture = TestBed.createComponent(LaboratorioIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
