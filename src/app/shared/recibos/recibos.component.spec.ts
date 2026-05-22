import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecibosComponent } from './recibos.component';

describe('RecibosComponent', () => {
  let component: RecibosComponent;
  let fixture: ComponentFixture<RecibosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RecibosComponent]
    });
    fixture = TestBed.createComponent(RecibosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
