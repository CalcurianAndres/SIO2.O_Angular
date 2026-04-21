import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalisisCajasComponent } from './analisis-cajas.component';

describe('AnalisisCajasComponent', () => {
  let component: AnalisisCajasComponent;
  let fixture: ComponentFixture<AnalisisCajasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnalisisCajasComponent]
    });
    fixture = TestBed.createComponent(AnalisisCajasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
