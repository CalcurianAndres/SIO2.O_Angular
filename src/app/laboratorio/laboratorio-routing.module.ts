import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LaboratorioComponent } from './laboratorio.component';
import { LaboratorioIndexComponent } from './laboratorio-index/laboratorio-index.component';
import { AnalisisTintaComponent } from './analisis/analisis-tinta/analisis-tinta.component';
import { EspecificacionesComponent } from './especificaciones/especificaciones.component';
import { AnalisisComponent } from './analisis/analisis.component';
import { DefectosComponent } from './defectos/defectos.component';
import { CertificadoComponent } from './certificado/certificado.component';
import { AnalisisPendientesComponent } from './analisis-pendientes/analisis-pendientes.component';

const routes: Routes = [
  {
    path: '',
    component: LaboratorioComponent,
    children: [
      {
        path: '',
        component: LaboratorioIndexComponent,
      },
      {
        path: 'especificacion',
        component: EspecificacionesComponent,
      },
      {
        path: 'analisis',
        component: AnalisisComponent,
      },
      {
        path: 'defectos',
        component: DefectosComponent,
      },
      {
        path: 'certificado',
        component: CertificadoComponent,
      },
      {
        path: 'analisis-pendientes',
        component: AnalisisPendientesComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class LaboratorioRoutingModule {}
