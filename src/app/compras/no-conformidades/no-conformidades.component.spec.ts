import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoConformidadesComponent } from './no-conformidades.component';

describe('NoConformidadesComponent', () => {
  let component: NoConformidadesComponent;
  let fixture: ComponentFixture<NoConformidadesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NoConformidadesComponent]
    });
    fixture = TestBed.createComponent(NoConformidadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
