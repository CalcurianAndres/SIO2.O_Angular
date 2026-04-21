import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaMaquinaComponent } from './nueva-maquina.component';

describe('NuevaMaquinaComponent', () => {
  let component: NuevaMaquinaComponent;
  let fixture: ComponentFixture<NuevaMaquinaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NuevaMaquinaComponent]
    });
    fixture = TestBed.createComponent(NuevaMaquinaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
