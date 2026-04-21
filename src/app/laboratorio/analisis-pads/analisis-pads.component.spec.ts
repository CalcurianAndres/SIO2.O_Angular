import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalisisPadsComponent } from './analisis-pads.component';

describe('AnalisisPadsComponent', () => {
  let component: AnalisisPadsComponent;
  let fixture: ComponentFixture<AnalisisPadsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnalisisPadsComponent]
    });
    fixture = TestBed.createComponent(AnalisisPadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
