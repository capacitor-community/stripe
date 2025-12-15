import {
  enableProdMode,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';

import { environment } from './environments/environment';

import { defineCustomElements } from 'stripe-pwa-elements/loader';
import { AppComponent } from './app/app.component';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { routes } from './app/app.routes';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';
import { provideRouter, RouteReuseStrategy } from '@angular/router';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    provideRouter(routes),
    importProvidersFrom(BrowserModule),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideHttpClient(withInterceptorsFromDi()),
    provideIonicAngular({}),
  ],
})
  .then(() => defineCustomElements(window))
  .catch((err) => console.log(err));
