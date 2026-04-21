import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoDepartamentoComponent } from './nuevo-departamento.component';

describe('NuevoDepartamentoComponent', () => {
  let component: NuevoDepartamentoComponent;
  let fixture: ComponentFixture<NuevoDepartamentoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NuevoDepartamentoComponent]
    });
    fixture = TestBed.createComponent(NuevoDepartamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
