import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketsAComponent } from './tickets-a.component';

describe('TicketsAComponent', () => {
  let component: TicketsAComponent;
  let fixture: ComponentFixture<TicketsAComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TicketsAComponent],
    });
    fixture = TestBed.createComponent(TicketsAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
