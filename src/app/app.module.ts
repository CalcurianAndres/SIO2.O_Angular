import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule, registerLocaleData } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarModule } from './shared/navbar/navbar.module';
import { SharedComponentsModule } from './shared/components/shared-components.module';
import { ComprasModule } from './compras/compras.module';
import { AlmacenModule } from './almacen/almacen.module';
import { LaboratorioModule } from './laboratorio/laboratorio.module';
import { FasesYmaquinariasModule } from './fases-ymaquinarias/fases-ymaquinarias.module';
import { OrdenesModule } from './ordenes/ordenes.module';
import { OrdenesComponent } from './ordenes/ordenes.component';
import { LoginModule } from './login/login.module';
import { HttpClientModule } from '@angular/common/http';
import { DashboardModule } from './Dashboard/dashboard.module';
import { LOCALE_ID } from '@angular/core';
import localeEs from '@angular/common/locales/es';
import { ServiceWorkerModule } from '@angular/service-worker';

registerLocaleData(localeEs);

@NgModule({
  declarations: [AppComponent, OrdenesComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AppRoutingModule,
    NavbarModule,
    SharedComponentsModule,
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
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'es-ES' }],
  bootstrap: [AppComponent],
})
export class AppModule {}
