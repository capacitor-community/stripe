---
title: "Configuration platform"
code: []
scrollActiveLine: []
---

Install `@capacitor-community/stripe` and synchronize the native projects. Capacitor 8 registers the plugin automatically, so you do not edit `MainActivity` or add a manual `registerPlugin` call.

```bash
npm install @capacitor-community/stripe
npx cap sync
```

This guide targets plugin v8 with Capacitor 8. Web also needs the compatible `@stripe/stripe-js` and `stripe-pwa-elements` peer dependencies. Keep the Stripe secret key on your server only. See [Server Integration](https://docs.rdlabo.dev/projects/capacitor-stripe/docs/server-integration).

| Requirement             | Minimum |
| ----------------------- | ------- |
| Capacitor               | 8       |
| iOS                     | 15.0    |
| Android `minSdkVersion` | 24      |

## Android configuration

No extra Gradle or `MainActivity` registration is required for the plugin itself.

Google Pay on Android must be configured with application metadata before the plugin loads. Follow [Google Pay](https://docs.rdlabo.dev/projects/capacitor-stripe/docs/google-pay).

Optional Stripe Connect: if Android Google Pay should run against a connected account, add `com.getcapacitor.community.stripe.stripe_account` metadata. Native and web PaymentSheet, PaymentFlow, Apple Pay, and Google Pay also accept `stripeAccount` on `initialize`.

## iOS configuration

Add these entries inside the root `dict` in `Info.plist` so PaymentSheet can scan cards:

```xml plist:ios/App/App/Info.plist
<key>NSCameraUsageDescription</key>
<string>Camera access lets you scan your payment card.</string>
```

The plugin loads automatically on iOS. Apple Pay also needs an Apple Merchant ID and certificate. Follow [Apple Pay](https://docs.rdlabo.dev/projects/capacitor-stripe/docs/apple-pay).

For PayPal, 3D Secure, and other redirect-based payment methods, register a custom URL scheme, set `returnURL` when you create PaymentSheet or PaymentFlow, and call `handleURLCallback` from your app URL handler. Without a return URL, Stripe does not offer otherwise eligible redirect-based payment methods on iOS. See [Initialize](https://docs.rdlabo.dev/projects/capacitor-stripe/docs/initialize#redirect-based-payment-methods-on-ios).

## Web configuration

Install `@stripe/stripe-js@^9.17.0` and `stripe-pwa-elements@^4.1.0`, then call `defineCustomElements()` once during bootstrap. Serve the app over HTTPS in development and production.

- [Vanilla JS Quick start](https://docs.rdlabo.dev/projects/capacitor-stripe/docs/vanilla-js)
- [Angular Quick start](https://docs.rdlabo.dev/projects/capacitor-stripe/docs/angular)
- [React Quick start](https://docs.rdlabo.dev/projects/capacitor-stripe/docs/react)
