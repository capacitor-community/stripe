import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadChildren: () => import('../demo/demo.module').then(m => m.DemoPageModule)
      },
      {
        path: 'tab2',
        loadChildren: () => import('../sheet/sheet.module').then(m => m.SheetPageModule)
      },
      {
        path: 'tab3',
        loadChildren: () => import('../flow/flow.module').then(m => m.FlowPageModule)
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
    redirectTo: '/tabs/tab1',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
