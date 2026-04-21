import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketsRComponent } from './tickets-r.component';

describe('TicketsRComponent', () => {
  let component: TicketsRComponent;
  let fixture: ComponentFixture<TicketsRComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TicketsRComponent]
    });
    fixture = TestBed.createComponent(TicketsRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
