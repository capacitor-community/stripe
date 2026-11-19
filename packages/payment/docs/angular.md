---
title: "Angular Quick start"
code: []
scrollActiveLine: []
---

Initialize the plugin once at application startup. Standalone Angular applications can use `provideAppInitializer` so initialization runs before Stripe UI is presented.

```ts:src/app/app.config.ts
import { ApplicationConfig, provideAppInitializer } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { Stripe } from '@capacitor-community/stripe';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideAppInitializer(() =>
      Stripe.initialize({
        publishableKey: 'Your Publishable Key',
      }),
    ),
  ],
};
```

Register result listeners in the same startup path. See [Event Listeners](https://docs.rdlabo.dev/projects/capacitor-stripe/docs/learn/event-listeners).

## Web

Install `@stripe/stripe-js@^9.17.0` and `stripe-pwa-elements@^4.1.0`, then call `defineCustomElements()` once after Angular bootstraps.

```bash
npm install @stripe/stripe-js@^9.17.0 stripe-pwa-elements@^4.1.0
```

```ts:src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { defineCustomElements } from 'stripe-pwa-elements/loader';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .then(() => defineCustomElements(window))
  .catch((err) => console.log(err));
```

Inject `HttpClient` into your service or component as `http`; `provideHttpClient()` above registers it. When you fetch PaymentIntent or SetupIntent secrets from Angular `HttpClient`, use `firstValueFrom`. Attach your application authentication through an interceptor or request options. The `environment.api` URL below refers to the demo response contract; use your own authenticated backend in production. Do not use the removed `toPromise()` helper.

```ts
import { firstValueFrom } from 'rxjs';

const { paymentIntent, ephemeralKey, customer } = await firstValueFrom(
  this.http.post<{
    paymentIntent: string;
    ephemeralKey: string;
    customer: string;
  }>(environment.api + 'intent', {}),
);
```
