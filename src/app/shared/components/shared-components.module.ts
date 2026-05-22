import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHeaderComponent } from './section-header/section-header.component';
import { PageLayoutComponent } from './page-layout/page-layout.component';
import { AppModalComponent } from './app-modal/app-modal.component';

@NgModule({
  declarations: [
    SectionHeaderComponent,
    PageLayoutComponent,
    AppModalComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SectionHeaderComponent,
    PageLayoutComponent,
    AppModalComponent
  ]
})
export class SharedComponentsModule { }
