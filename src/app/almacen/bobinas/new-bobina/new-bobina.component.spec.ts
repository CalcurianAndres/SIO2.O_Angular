import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewBobinaComponent } from './new-bobina.component';

describe('NewBobinaComponent', () => {
  let component: NewBobinaComponent;
  let fixture: ComponentFixture<NewBobinaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewBobinaComponent]
    });
    fixture = TestBed.createComponent(NewBobinaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
