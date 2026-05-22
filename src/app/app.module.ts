import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NavbarModule } from './shared/navbar/navbar.module';
import { ComprasModule } from './compras/compras.module';
import { AlmacenModule } from './almacen/almacen.module';
import { LaboratorioModule } from './laboratorio/laboratorio.module';
import { FasesYMaquinariasComponent } from './fases-ymaquinarias/fases-ymaquinarias.component';
import { MainComponent } from './fases-ymaquinarias/main/main.component';
import { FasesYmaquinariasModule } from './fases-ymaquinarias/fases-ymaquinarias.module';
import { SolicitudMaterialComponent } from './shared/navbar/solicitud-material/solicitud-material.component';
import { OrdenesComponent } from './ordenes/ordenes.component';
import { OrdenesModule } from './ordenes/ordenes.module';
import { LoginComponent } from './login/login.component';
import { LoginModule } from './login/login.module';
import { HttpClientModule } from '@angular/common/http';
import { DashboardModule } from './Dashboard/dashboard.module';

import { LOCALE_ID, isDevMode } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { ServiceWorkerModule } from '@angular/service-worker';
import { RecibosComponent } from './shared/recibos/recibos.component';

registerLocaleData(localeEs);

@NgModule({
  declarations: [AppComponent, OrdenesComponent],
  imports: [
    BrowserModule,
    CommonModule,
    RouterModule,
    AppRoutingModule,
    NavbarModule,
    ComprasModule,
    AlmacenModule,
    LaboratorioModule,
    FasesYmaquinariasModule,
    OrdenesModule,
    LoginModule,
    DashboardModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: true,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'es-ES' }],
  bootstrap: [AppComponent],
})
export class AppModule {}
