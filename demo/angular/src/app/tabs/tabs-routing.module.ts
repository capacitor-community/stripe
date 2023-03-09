import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'demo',
        loadChildren: () => import('../demo/demo.module').then(m => m.DemoPageModule)
      },
      {
        path: 'sheet',
        loadChildren: () => import('../sheet/sheet.module').then(m => m.SheetPageModule)
      },
      {
        path: 'flow',
        loadChildren: () => import('../flow/flow.module').then(m => m.FlowPageModule)
      },
      {
        path: 'identify',
        loadChildren: () => import('../identity/identity.module').then(m => m.IdentityPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/demo',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
