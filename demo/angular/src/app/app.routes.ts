import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'checkout',
    loadComponent: () => import('./embedded/embedded.page').then(m => m.EmbeddedPage),
  },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
];
