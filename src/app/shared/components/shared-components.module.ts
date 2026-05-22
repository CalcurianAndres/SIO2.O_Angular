import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SectionHeaderComponent } from './section-header/section-header.component';
import { PageLayoutComponent } from './page-layout/page-layout.component';
import { AppModalComponent } from './app-modal/app-modal.component';
import { ToastComponent } from './toast/toast.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { SkeletonComponent } from './skeleton/skeleton.component';

@NgModule({
  declarations: [SectionHeaderComponent, PageLayoutComponent, AppModalComponent, ToastComponent, BreadcrumbComponent, SkeletonComponent],
  imports: [CommonModule, RouterModule],
  exports: [SectionHeaderComponent, PageLayoutComponent, AppModalComponent, ToastComponent, BreadcrumbComponent, SkeletonComponent],
})
export class SharedComponentsModule {}
