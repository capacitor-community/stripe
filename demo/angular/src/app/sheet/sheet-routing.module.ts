import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SheetPage } from './sheet.page';

const routes: Routes = [
  {
    path: '',
    component: SheetPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SheetPageRoutingModule {}
