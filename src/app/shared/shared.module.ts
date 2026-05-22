import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafePipe } from '../safe.pipe';
import { NumberFormatDirective } from '../number-format.directive';
import { SharedComponentsModule } from './components/shared-components.module';

@NgModule({
  declarations: [SafePipe, NumberFormatDirective],
  imports: [CommonModule, SharedComponentsModule],
  exports: [SafePipe, NumberFormatDirective, SharedComponentsModule],
})
export class SharedModule {}
