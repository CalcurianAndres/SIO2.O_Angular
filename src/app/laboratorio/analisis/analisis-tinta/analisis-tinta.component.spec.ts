import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalisisTintaComponent } from './analisis-tinta.component';

describe('AnalisisTintaComponent', () => {
  let component: AnalisisTintaComponent;
  let fixture: ComponentFixture<AnalisisTintaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnalisisTintaComponent]
    });
    fixture = TestBed.createComponent(AnalisisTintaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
