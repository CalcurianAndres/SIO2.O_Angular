import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewConvertidoraComponent } from './new-convertidora.component';

describe('NewConvertidoraComponent', () => {
  let component: NewConvertidoraComponent;
  let fixture: ComponentFixture<NewConvertidoraComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewConvertidoraComponent],
    });
    fixture = TestBed.createComponent(NewConvertidoraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
