import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SectionHeaderComponent } from './section-header/section-header.component';
import { PageLayoutComponent } from './page-layout/page-layout.component';
import { AppModalComponent } from './app-modal/app-modal.component';
import { ToastComponent } from './toast/toast.component';
import { SkeletonComponent } from './skeleton/skeleton.component';
import { StepWizardComponent } from './step-wizard/step-wizard.component';
import { ImgFallbackComponent } from './img-fallback/img-fallback.component';
import { BadgeListComponent } from './badge-list/badge-list.component';

@NgModule({
  declarations: [SectionHeaderComponent, PageLayoutComponent, AppModalComponent, ToastComponent, SkeletonComponent, StepWizardComponent, ImgFallbackComponent, BadgeListComponent],
  imports: [CommonModule, RouterModule],
  exports: [SectionHeaderComponent, PageLayoutComponent, AppModalComponent, ToastComponent, SkeletonComponent, StepWizardComponent, ImgFallbackComponent, BadgeListComponent],
})
export class SharedComponentsModule {}
