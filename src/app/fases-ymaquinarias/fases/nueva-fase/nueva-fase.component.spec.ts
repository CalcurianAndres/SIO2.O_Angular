import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaFaseComponent } from './nueva-fase.component';

describe('NuevaFaseComponent', () => {
  let component: NuevaFaseComponent;
  let fixture: ComponentFixture<NuevaFaseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NuevaFaseComponent]
    });
    fixture = TestBed.createComponent(NuevaFaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
