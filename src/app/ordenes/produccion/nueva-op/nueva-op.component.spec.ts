import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaOPComponent } from './nueva-op.component';

describe('NuevaOPComponent', () => {
  let component: NuevaOPComponent;
  let fixture: ComponentFixture<NuevaOPComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NuevaOPComponent]
    });
    fixture = TestBed.createComponent(NuevaOPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
