import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoGestionComponent } from './info-gestion.component';

describe('InfoGestionComponent', () => {
  let component: InfoGestionComponent;
  let fixture: ComponentFixture<InfoGestionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InfoGestionComponent]
    });
    fixture = TestBed.createComponent(InfoGestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
