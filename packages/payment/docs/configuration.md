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

The plugin depends on Capacitor 8 or later. Web also needs the `stripe-pwa-elements` peer dependency. Keep the Stripe secret key on your server only. See [Server Integration](./server-integration.md).

| Requirement | Minimum |
| --- | --- |
| Capacitor | 8 |
| iOS | 15.0 |
| Android `minSdkVersion` | 24 |

## Android configuration

No extra Gradle or `MainActivity` registration is required for the plugin itself.

Google Pay on Android must be configured with application metadata before the plugin loads. Follow [Google Pay](./google-pay.md).

Optional Stripe Connect: if Android Google Pay should run against a connected account, add `com.getcapacitor.community.stripe.stripe_account` metadata. Native and web PaymentSheet, PaymentFlow, Apple Pay, and Google Pay also accept `stripeAccount` on `initialize`.

## iOS configuration

Add `NSCameraUsageDescription` so PaymentSheet can scan cards:

```diff plist:ios/App/App/Info.plist
  	<key>UIViewControllerBasedStatusBarAppearance</key>
	  <true/>

+   <key>NSCameraUsageDescription</key>
+   <string>Need camera access for read credit card.</string>
  </dict>
```

The plugin loads automatically on iOS. Apple Pay also needs an Apple Merchant ID and certificate. Follow [Apple Pay](./apple-pay.md).

For PayPal, 3D Secure, and other redirect-based payment methods, register a custom URL scheme, set `returnURL` when you create PaymentSheet or PaymentFlow, and call `handleURLCallback` from your app URL handler. Without a return URL, Stripe may omit redirect-based payment methods on iOS. See [Initialize](./initialize.md#redirect-based-payment-methods-on-ios).

## Web configuration

Install `stripe-pwa-elements` and call `defineCustomElements()` once during bootstrap. Serve the app over HTTPS in development and production.

- [Vanilla JS Quick start](./vanilla-js.md)
- [Angular Quick start](./angular.md)
- [React Quick start](./react.md)
