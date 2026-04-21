import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaFormulaComponent } from './nueva-formula.component';

describe('NuevaFormulaComponent', () => {
  let component: NuevaFormulaComponent;
  let fixture: ComponentFixture<NuevaFormulaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NuevaFormulaComponent]
    });
    fixture = TestBed.createComponent(NuevaFormulaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
