import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoMaquinasComponent } from './info-maquinas.component';

describe('InfoMaquinasComponent', () => {
  let component: InfoMaquinasComponent;
  let fixture: ComponentFixture<InfoMaquinasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InfoMaquinasComponent]
    });
    fixture = TestBed.createComponent(InfoMaquinasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
