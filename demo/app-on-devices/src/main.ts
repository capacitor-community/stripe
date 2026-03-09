import { provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { mdTransitionAnimation } from '@rdlabo/ionic-theme-md3';

import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';

addIcons({ ...allIcons });

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    provideHttpClient(),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({
      mode: 'md',
      navAnimation: mdTransitionAnimation,
    }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});
