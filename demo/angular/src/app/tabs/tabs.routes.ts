import {Routes} from '@angular/router';
import {TabsPage} from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'demo',
        loadChildren: () => import('../demo/demo.routes').then(m => m.routes)
      },
      {
        path: 'sheet',
        loadChildren: () => import('../sheet/sheet.routes').then(m => m.routes)
      },
      {
        path: 'flow',
        loadChildren: () => import('../flow/flow.routes').then(m => m.routes)
      },
      {
        path: 'identify',
        loadChildren: () => import('../identity/identity.routes').then(m => m.routes)
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
