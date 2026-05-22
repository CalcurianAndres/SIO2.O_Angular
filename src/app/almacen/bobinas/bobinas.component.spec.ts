import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BobinasComponent } from './bobinas.component';

describe('BobinasComponent', () => {
  let component: BobinasComponent;
  let fixture: ComponentFixture<BobinasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BobinasComponent],
    });
    fixture = TestBed.createComponent(BobinasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
