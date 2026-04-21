import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorMixComponent } from './color-mix.component';

describe('ColorMixComponent', () => {
  let component: ColorMixComponent;
  let fixture: ComponentFixture<ColorMixComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ColorMixComponent]
    });
    fixture = TestBed.createComponent(ColorMixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
