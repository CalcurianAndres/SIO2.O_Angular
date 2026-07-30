import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UiShowcaseComponent } from './ui-showcase.component';

const routes: Routes = [{ path: '', component: UiShowcaseComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UiShowcaseRoutingModule {}
