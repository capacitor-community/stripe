import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'input',
    loadComponent: () => import('./input/input.page').then((m) => m.InputPage),
  },
  {
    path: 'receipt',
    loadComponent: () =>
      import('./receipt/receipt.page').then((m) => m.ReceiptPage),
  },
  {
    path: 'email',
    loadComponent: () => import('./email/email.page').then((m) => m.EmailPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
