import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { ComprasComponent } from './compras.component';
import { GruposComponent } from './grupos/grupos.component';
import { FabricantesComponent } from './fabricantes/fabricantes.component';
import { ProveedoresComponent } from './proveedores/proveedores.component';
import { OrdenesComponent } from './ordenes/ordenes.component';
import { NoConformidadesComponent } from './no-conformidades/no-conformidades.component';


const routes: Routes =[
  {
    path:'',
    component:ComprasComponent,
    children:[
      {
        path:'',
        component:MainComponent
      },
      {
        path:'grupos',
        component:GruposComponent
      },
      {
        path:'fabricantes',
        component:FabricantesComponent
      },
      {
        path:'proveedores',
        component:ProveedoresComponent
      },
      {
        path:'ordenes',
        component:OrdenesComponent
      },
      {
        path:'ncc',
        component:NoConformidadesComponent
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
export class ComprasRoutingModule { }
