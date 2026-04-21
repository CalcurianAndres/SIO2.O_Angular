import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FasesRoutingModule } from './fases-routing.module';
import { NavbarModule } from '../shared/navbar/navbar.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FasesComponent } from './fases/fases.component';
import { MainComponent } from './main/main.component';
import { NuevaFaseComponent } from './fases/nueva-fase/nueva-fase.component';
import { FasesYMaquinariasComponent } from './fases-ymaquinarias.component';
import { InformacionComponent } from './fases/informacion/informacion.component';
import { MaquinasComponent } from './maquinas/maquinas.component';
import { NuevaMaquinaComponent } from './maquinas/nueva-maquina/nueva-maquina.component';
import { InfoMaquinasComponent } from './maquinas/info-maquinas/info-maquinas.component';
import { NuevoProductoComponent } from './productos/nuevo-producto/nuevo-producto.component';
import { ClientesComponent } from './productos/clientes/clientes.component';
import { NewProductoComponent } from './productos/new-producto/new-producto.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ServiceWorkerModule } from '@angular/service-worker';
import { CategoriasComponent } from './categorias/categorias.component';
import { NuevaCategoriaComponent } from './categorias/nueva-categoria/nueva-categoria.component';
import { PreparacionTintasComponent } from './preparacion-tintas/preparacion-tintas.component';
import { NuevaFormulaComponent } from './preparacion-tintas/nueva-formula/nueva-formula.component';
import { ProductosComponent } from './productos/productos.component';
import { CambiosComponent } from './productos/cambios/cambios.component';



@NgModule({
  declarations: [
    FasesComponent,
    MainComponent,
    NuevaFaseComponent,
    FasesYMaquinariasComponent,
    InformacionComponent,
    MaquinasComponent,
    NuevaMaquinaComponent,
    InfoMaquinasComponent,
    NuevoProductoComponent,
    ClientesComponent,
    NewProductoComponent,
    CategoriasComponent,
    NuevaCategoriaComponent,
    PreparacionTintasComponent,
    NuevaFormulaComponent,
    ProductosComponent,
    CambiosComponent
  ],
  imports: [
    CommonModule,
    FasesRoutingModule,
    NavbarModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    ServiceWorkerModule
  ]
})
export class FasesYmaquinariasModule { }
