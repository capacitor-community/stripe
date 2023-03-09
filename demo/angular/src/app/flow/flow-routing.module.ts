import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FlowPage } from './flow.page';

const routes: Routes = [
  {
    path: '',
    component: FlowPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FlowPageRoutingModule {}
