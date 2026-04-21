import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FasesYMaquinariasComponent } from './fases-ymaquinarias.component';

describe('FasesYMaquinariasComponent', () => {
  let component: FasesYMaquinariasComponent;
  let fixture: ComponentFixture<FasesYMaquinariasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FasesYMaquinariasComponent]
    });
    fixture = TestBed.createComponent(FasesYMaquinariasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
