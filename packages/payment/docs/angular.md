---
title: "Angular Quick start"
code: []
scrollActiveLine: []
---

Initialize the plugin once at application startup. Angular 22 applications should use `provideAppInitializer` so initialization runs before Stripe UI is presented.

```ts:src/app/app.config.ts
import { ApplicationConfig, provideAppInitializer } from '@angular/core';
import { Stripe } from '@capacitor-community/stripe';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() =>
      Stripe.initialize({
        publishableKey: 'Your Publishable Key',
      }),
    ),
  ],
};
```

Register result listeners in the same startup path. See [Event Listeners](./learn/event-listeners.md).

## Web

Install `stripe-pwa-elements` and call `defineCustomElements()` once after Angular bootstraps.

```bash
npm install stripe-pwa-elements
```

```ts:src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { defineCustomElements } from 'stripe-pwa-elements/loader';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent)
  .then(() => defineCustomElements(window))
  .catch((err) => console.log(err));
```

When you fetch PaymentIntent or SetupIntent secrets from Angular `HttpClient`, use `firstValueFrom`. Do not use the removed `toPromise()` helper.

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
