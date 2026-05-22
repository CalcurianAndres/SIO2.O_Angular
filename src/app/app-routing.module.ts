import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './Auth/auth.guard';
import { AsignacionComponent } from './shared/navbar/asignacion/asignacion.component';
import { RecibosComponent } from './shared/recibos/recibos.component';

// canActivate: [AuthGuard],

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'asignacion/:id',
    component: AsignacionComponent
  },
  {
    path: 'compras',
    canActivate: [AuthGuard],
    loadChildren: () => import('./compras/compras.module').then(m => m.ComprasModule)
  },
  {
    path: 'almacen',
    canActivate: [AuthGuard],
    loadChildren: () => import('./almacen/almacen.module').then(m => m.AlmacenModule)
  },
  {
    path: 'laboratorio',
    canActivate: [AuthGuard],
    loadChildren: () => import('./laboratorio/laboratorio.module').then(m => m.LaboratorioModule)
  },
  {
    path: 'maquinas',
    canActivate: [AuthGuard],
    loadChildren: () => import('./fases-ymaquinarias/fases-routing.module').then(m => m.FasesRoutingModule)
  },
  {
    path: 'ventas',
    canActivate: [AuthGuard],
    loadChildren: () => import('./ordenes/ordenes-routing.module').then(m => m.OrdenesRoutingModule)
  },
  {
    path: 'empresa',
    canActivate: [AuthGuard],
    loadChildren: () => import('./empleados/empleados.module').then(m => m.EmpleadosModule)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () => import('./Dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'recibos',
    component: RecibosComponent
  }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
