# Stripe Terminal Apps on Devices demo

This Android demo runs on a supported Stripe smart reader and uses `TerminalConnectTypes.HandOff`. It is separate from the phone-based [Angular Terminal demo](../angular/README.md); a browser or ordinary Android phone cannot exercise the device handoff integration.

## Build

Build the local plugin packages first, then install this demo's dependencies:

```sh
# From the repository root
npm ci
npm run build
cd demo/app-on-devices
npm ci
npm run cap
npx cap sync android
npx cap open android
```

`npm run cap` uses `src/environments/environment.prod.ts`, which points to the hosted [demo Worker](../server/README.md). Configure your own reachable backend when testing another account. The app uses the demo's public token endpoint; production integrations need authenticated token issuance and server-side order authorization as described in [Collect a Payment](../../packages/terminal/docs/collect-a-payment.md).

Configure release signing using the demo keystore below for test builds, then build a release APK and follow [Stripe's Apps on Devices build and deployment guide](https://docs.stripe.com/terminal/features/apps-on-devices/build?terminal-sdk-platform=android&lang-android=java#setup-app) for your registered reader and app. Installing the APK alone does not configure the reader/account integration.

## Demo Keystore

To simplify testing with Stripe Terminal DevKit, this repository includes a demo signing keystore.

This keystore is **public and for demonstration purposes only**.  
Do **not** use it for production builds or Play Store distribution.

Location: android/app-on-devices.jks

Credentials:

- storePassword: app-on-devices
- keyAlias: app-on-devices
- keyPassword: app-on-devices

It is used only to build a release APK required for `stripe terminal deploy`.
