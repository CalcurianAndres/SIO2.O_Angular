import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubAreasComponent } from './sub-areas.component';

describe('SubAreasComponent', () => {
  let component: SubAreasComponent;
  let fixture: ComponentFixture<SubAreasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubAreasComponent]
    });
    fixture = TestBed.createComponent(SubAreasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
