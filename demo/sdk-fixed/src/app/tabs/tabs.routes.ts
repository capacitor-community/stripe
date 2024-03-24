import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { DemoPage } from '../demo/demo.page';
import { SheetPage } from '../sheet/sheet.page';
import { FlowPage } from '../flow/flow.page';
import { IdentityPage } from '../identity/identity.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'demo',
        component: DemoPage,
      },
      {
        path: 'sheet',
        component: SheetPage,
      },
      {
        path: 'flow',
        component: FlowPage,
      },
      {
        path: 'identify',
        component: IdentityPage,
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/demo',
    pathMatch: 'full',
  },
];
