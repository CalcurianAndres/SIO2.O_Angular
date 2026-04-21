import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalisisOtrosComponent } from './analisis-otros.component';

describe('AnalisisOtrosComponent', () => {
  let component: AnalisisOtrosComponent;
  let fixture: ComponentFixture<AnalisisOtrosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnalisisOtrosComponent]
    });
    fixture = TestBed.createComponent(AnalisisOtrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
