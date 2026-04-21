import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreparacionTintasComponent } from './preparacion-tintas.component';

describe('PreparacionTintasComponent', () => {
  let component: PreparacionTintasComponent;
  let fixture: ComponentFixture<PreparacionTintasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PreparacionTintasComponent]
    });
    fixture = TestBed.createComponent(PreparacionTintasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
