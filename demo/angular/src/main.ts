import {enableProdMode, importProvidersFrom} from '@angular/core';


import {environment} from './environments/environment';

import {defineCustomElements} from '@stripe-elements/stripe-elements/loader';
import {AppComponent} from './app/app.component';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {routes} from './app/app.routes';
import {bootstrapApplication, BrowserModule} from '@angular/platform-browser';
import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {provideRouter, RouteReuseStrategy} from '@angular/router';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
      provideRouter(routes),
        importProvidersFrom(BrowserModule, IonicModule.forRoot()),
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        provideHttpClient(withInterceptorsFromDi())
    ]
})
  .then(() => defineCustomElements(window))
  .catch(err => console.log(err));
