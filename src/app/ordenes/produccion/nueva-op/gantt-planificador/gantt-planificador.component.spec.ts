import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GanttPlanificadorComponent } from './gantt-planificador.component';

describe('GanttPlanificadorComponent', () => {
  let component: GanttPlanificadorComponent;
  let fixture: ComponentFixture<GanttPlanificadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GanttPlanificadorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GanttPlanificadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});