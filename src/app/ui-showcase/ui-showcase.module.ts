import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiShowcaseComponent } from './ui-showcase.component';
import { UiShowcaseRoutingModule } from './ui-showcase-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [UiShowcaseComponent],
  imports: [CommonModule, UiShowcaseRoutingModule, SharedModule],
})
export class UiShowcaseModule {}
