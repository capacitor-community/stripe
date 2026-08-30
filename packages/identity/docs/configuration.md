---
title: 'Configuration'
code: []
scrollActiveLine: []
---

Install Stripe Identity and synchronize the native Capacitor projects.

```bash
npm install @capacitor-community/stripe-identity
npx cap sync
```

`@capacitor-community/stripe-identity` v8.2.1 presents Stripe Identity Verification Sheet on iOS, Android, and Web.

| Requirement | Minimum |
| --- | --- |
| Capacitor | 8 |
| iOS | 15.0 |
| Android `minSdkVersion` | 24 |

## Web configuration

No additional native project steps are necessary. Call `initialize` with a publishable key before `create` and `present` when running on the web. Native platforms resolve `initialize` without using that key.

## iOS configuration

Add `NSCameraUsageDescription` to `Info.plist` with a message explaining why your app needs camera access. See [Stripe's iOS camera authorization guide](https://stripe.com/docs/identity/verify-identity-documents?platform=ios&type=new-integration#set-up-camera-authorization).

The iOS implementation reads the primary app icon from `Info.plist` (`CFBundleIcons` → `CFBundlePrimaryIcon` → `CFBundleIconFiles`) and passes the first file name to Stripe Identity as `brandLogo`. `create` rejects and emits `FailedToLoad` when those keys are missing, with the message `CFBundleIcons or CFBundlePrimaryIcon or CFBundleIconFiles is not found. You should check ios image assets`.

Keep a primary App Icon in the iOS asset catalog so Xcode writes `CFBundleIconFiles`. An app without that icon catalog cannot create the sheet.

## Android configuration

Use a Material Components theme in `android/app/src/main/res/values/styles.xml`:

```diff xml:android/app/src/main/res/values/styles.xml
- <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
+ <style name="AppTheme" parent="Theme.MaterialComponents.DayNight">
```

Any Material Components parent theme can be used. See [Material Components theming](https://m2.material.io/develop/android/theming/dark/) and [Stripe's Android Material theme guide](https://stripe.com/docs/identity/verify-identity-documents?platform=android&type=new-integration#set-up-material-theme).

The Android implementation uses the application `ic_launcher` mipmap as the Identity Verification Sheet icon. No extra icon configuration is required beyond a standard launcher icon.
