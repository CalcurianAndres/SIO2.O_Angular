import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { EmpleadosComponent } from './empleados.component';
import { GestionComponent } from './gestion/gestion.component';
import { DepartamentosComponent } from './departamentos/departamentos.component';
import { TrabajadoresComponent } from './trabajadores/trabajadores.component';
import { HorariosComponent } from './horarios/horarios.component';

const routes: Routes =[
  {
    path:'',
    component:EmpleadosComponent,
    children:[
      {
        path:'cargos',
        component:GestionComponent
      },
      {
        path: 'departamentos',
        component:DepartamentosComponent
      },
      {
        path: 'empleados',
        component:TrabajadoresComponent
      },
      {
        path:'horarios',
        component:HorariosComponent
      }
    ]
}]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class EmpleadosRoutingModule { }
