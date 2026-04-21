import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComprasComponent } from './compras.component';
import { MainComponent } from './main/main.component';
import { ComprasRoutingModule } from './compras-routing.module';
import { NavbarModule } from '../shared/navbar/navbar.module';
import { RouterModule } from '@angular/router';
import { GruposComponent } from './grupos/grupos.component';
import { NuevoGrupoComponent } from './grupos/nuevo-grupo/nuevo-grupo.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialesComponent } from './grupos/materiales/materiales.component';
import { FabricantesComponent } from './fabricantes/fabricantes.component';
import { DetallesComponent } from './fabricantes/detalles/detalles.component';
import { NuevoFabricanteComponent } from './fabricantes/nuevo-fabricante/nuevo-fabricante.component';
import { ProveedoresComponent } from './proveedores/proveedores.component';
import { NuevoProveedorComponent } from './proveedores/nuevo-proveedor/nuevo-proveedor.component';
import { NuevoMaterialComponent } from './grupos/nuevo-material/nuevo-material.component';
import { DetallesProveedoresComponent } from './proveedores/detalles-proveedores/detalles-proveedores.component';
import { OrdenesComponent } from './ordenes/ordenes.component';
import { NuevoOrdenComponent } from './ordenes/nuevo-orden/nuevo-orden.component';
import { NoConformidadesComponent } from './no-conformidades/no-conformidades.component';
import { NuevaConformidadComponent } from './no-conformidades/nueva-conformidad/nueva-conformidad.component';



@NgModule({
  declarations: [
    ComprasComponent,
    MainComponent,
    GruposComponent,
    NuevoGrupoComponent,
    MaterialesComponent,
    FabricantesComponent,
    DetallesComponent,
    NuevoFabricanteComponent,
    ProveedoresComponent,
    NuevoProveedorComponent,
    NuevoMaterialComponent,
    DetallesProveedoresComponent,
    OrdenesComponent,
    NuevoOrdenComponent,
    NoConformidadesComponent,
    NuevaConformidadComponent
  ],
  imports: [
    CommonModule,
    ComprasRoutingModule,
    NavbarModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ComprasModule { }
