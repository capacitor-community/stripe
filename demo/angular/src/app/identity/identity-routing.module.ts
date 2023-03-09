import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IdentityPage } from './identity.page';

const routes: Routes = [
  {
    path: '',
    component: IdentityPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IdentityPageRoutingModule {}
