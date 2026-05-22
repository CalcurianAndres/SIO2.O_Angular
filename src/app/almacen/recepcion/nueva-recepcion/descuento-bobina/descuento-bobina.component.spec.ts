import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescuentoBobinaComponent } from './descuento-bobina.component';

describe('DescuentoBobinaComponent', () => {
  let component: DescuentoBobinaComponent;
  let fixture: ComponentFixture<DescuentoBobinaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DescuentoBobinaComponent],
    });
    fixture = TestBed.createComponent(DescuentoBobinaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
