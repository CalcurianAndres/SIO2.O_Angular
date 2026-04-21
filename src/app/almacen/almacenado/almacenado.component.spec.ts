import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlmacenadoComponent } from './almacenado.component';

describe('AlmacenadoComponent', () => {
  let component: AlmacenadoComponent;
  let fixture: ComponentFixture<AlmacenadoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AlmacenadoComponent]
    });
    fixture = TestBed.createComponent(AlmacenadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
