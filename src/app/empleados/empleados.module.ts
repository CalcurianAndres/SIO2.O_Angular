import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpleadosComponent } from './empleados.component';
import { NavbarModule } from '../shared/navbar/navbar.module';
import { RouterModule } from '@angular/router';
import { EmpleadosRoutingModule } from './empleados-routing.module';
import { GestionComponent } from './gestion/gestion.component';
import { DepartamentosComponent } from './departamentos/departamentos.component';
import { NuevoDepartamentoComponent } from './departamentos/nuevo-departamento/nuevo-departamento.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NuevoCargoComponent } from './departamentos/nuevo-cargo/nuevo-cargo.component';
import { AreasComponent } from './departamentos/areas/areas.component';
import { SubAreasComponent } from './departamentos/areas/sub-areas/sub-areas.component';
import { NuevaGestionComponent } from './gestion/nueva-gestion/nueva-gestion.component';
import { InfoGestionComponent } from './gestion/info-gestion/info-gestion.component';
import { TrabajadoresComponent } from './trabajadores/trabajadores.component';
import { NuevoTrabajadorComponent } from './trabajadores/nuevo-trabajador/nuevo-trabajador.component';
import { HttpClientModule } from '@angular/common/http';
import { InformacionEmpleadoComponent } from './trabajadores/informacion-empleado/informacion-empleado.component';
import { HistorialEmpleadoComponent } from './trabajadores/historial-empleado/historial-empleado.component';
import { HorariosComponent } from './horarios/horarios.component';
import { NuevoHorarioComponent } from './horarios/nuevo-horario/nuevo-horario.component';




@NgModule({
  declarations: [
    EmpleadosComponent,
    GestionComponent,
    DepartamentosComponent,
    NuevoDepartamentoComponent,
    NuevoCargoComponent,
    AreasComponent,
    SubAreasComponent,
    NuevaGestionComponent,
    InfoGestionComponent,
    TrabajadoresComponent,
    NuevoTrabajadorComponent,
    InformacionEmpleadoComponent,
    HistorialEmpleadoComponent,
    HorariosComponent,
    NuevoHorarioComponent
  ],
  imports: [
    CommonModule,
    EmpleadosRoutingModule,
    NavbarModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ]
})
export class EmpleadosModule { }
