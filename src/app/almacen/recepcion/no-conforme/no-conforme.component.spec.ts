import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoConformeComponent } from './no-conforme.component';

describe('NoConformeComponent', () => {
  let component: NoConformeComponent;
  let fixture: ComponentFixture<NoConformeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NoConformeComponent]
    });
    fixture = TestBed.createComponent(NoConformeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
