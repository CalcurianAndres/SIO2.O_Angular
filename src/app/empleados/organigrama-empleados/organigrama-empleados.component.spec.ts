import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrganigramaEmpleadosComponent } from './organigrama-empleados.component';

describe('OrganigramaEmpleadosComponent', () => {
  let component: OrganigramaEmpleadosComponent;
  let fixture: ComponentFixture<OrganigramaEmpleadosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrganigramaEmpleadosComponent],
    });
    fixture = TestBed.createComponent(OrganigramaEmpleadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
