---
title: 'Configuration'
code: []
scrollActiveLine: []
---

Install Stripe Terminal and synchronize the native Capacitor projects.

```bash
npm install @capacitor-community/stripe-terminal
npx cap sync
```

This guide targets plugin v8 with Capacitor 8. Official demos:

- [Tap to Pay / Internet / Bluetooth](https://github.com/capacitor-community/stripe/tree/main/demo/angular)
- [Apps on Devices](https://github.com/capacitor-community/stripe/tree/main/demo/app-on-devices)

| Requirement             | Minimum |
| ----------------------- | ------- |
| Capacitor               | 8       |
| iOS                     | 15.0    |
| Android `minSdkVersion` | 26      |

## Platform and connection types

`discoverReaders` takes a `TerminalConnectTypes` value. Support is not the same on every platform.

| `TerminalConnectTypes` | Web                               | iOS                              | Android                        |
| ---------------------- | --------------------------------- | -------------------------------- | ------------------------------ |
| `Internet`             | Yes — **the only supported type** | Yes                              | Yes                            |
| `Bluetooth`            | No                                | Yes                              | Yes                            |
| `TapToPay`             | No                                | Yes                              | Yes                            |
| `Usb`                  | No                                | Unimplemented                    | Yes                            |
| `HandOff`              | No                                | Unimplemented                    | Yes (Apps on Devices)          |
| `Simulated`            | No                                | Unimplemented as a discover type | Treated as Bluetooth discovery |

On every platform, pass `isTest: true` to `initialize` when you want simulated readers for a **supported** connection type. Do not rely on `TerminalConnectTypes.Simulated` on iOS or web; use `Internet`, `Bluetooth`, or `TapToPay` with `isTest: true` instead.

Web `discoverReaders` rejects with an unavailable error for any type other than `Internet`.

### Platform-only APIs

| API                          | Web                  | iOS                                 | Android                                               |
| ---------------------------- | -------------------- | ----------------------------------- | ----------------------------------------------------- |
| `setTapToPayUxConfiguration` | No-op (logs only)    | Unimplemented                       | Yes — call after `initialize`, before `connectReader` |
| `isTapToPayAccountLinked`    | Unavailable (throws) | Yes — iOS 16.4+, after `initialize` | Unimplemented                                         |

See [Tap to Pay](https://docs.rdlabo.dev/projects/capacitor-stripe-terminal/docs/tap-to-pay) for the setup sequence and limitations.

### Web no-op and unsupported lifecycle methods

These methods exist on the plugin interface but do not drive the Stripe Terminal JS SDK on web:

- `cancelDiscoverReaders` — no-op
- `setSimulatorConfiguration` — no-op
- `installAvailableUpdate` — no-op
- `cancelInstallUpdate` — no-op
- `rebootReader` — no-op
- `cancelReaderReconnection` — no-op
- `setTapToPayUxConfiguration` — no-op

`isTapToPayAccountLinked` throws `unavailable` on web.

Internet readers on web still support `initialize`, `discoverReaders`, `connectReader`, `getConnectedReader`, `disconnectReader`, `collectPaymentMethod`, `cancelCollectPaymentMethod`, `confirmPaymentIntent`, `setReaderDisplay`, `clearReaderDisplay`, `setConnectionToken`, and the connection / payment status listeners.

## Web configuration

No additional steps are necessary. Only Internet readers are available.

## iOS configuration

Configure the host app as required by the [Stripe Terminal iOS SDK](https://github.com/stripe/stripe-terminal-ios/tree/5.8.0#configure-your-app):

- Add `NSLocationWhenInUseUsageDescription` to `Info.plist` and enable location access so payments can be processed.
- Add `NSBluetoothAlwaysUsageDescription` with an explanation of reader connectivity.
- If the app must keep a Bluetooth reader connected in the background, include `bluetooth-central` in the `UIBackgroundModes` array.

Tap to Pay additionally requires Apple's entitlement and a supported physical device, OS, country, and Stripe account. The package's iOS 15 minimum does not imply Tap to Pay availability. Follow the [Tap to Pay guide](https://docs.rdlabo.dev/projects/capacitor-stripe-terminal/docs/tap-to-pay) before using a real device.

USB, HandOff, and `setTapToPayUxConfiguration` are unimplemented on iOS.

## Android configuration

Add permissions to your `android/app/src/main/AndroidManifest.xml` file:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
```

`discoverReaders` rejects when `ACCESS_FINE_LOCATION` has not been granted at runtime.

And update `minSdkVersion` to `26` in your `android/variables.gradle` file:

```groovy
ext {
    minSdkVersion = 26
}
```

If you are developing apps for Stripe Android devices (for example Stripe Reader S700) and using `TerminalConnectTypes.HandOff`, follow [Stripe's client-side setup guide](https://docs.stripe.com/terminal/features/apps-on-devices/build?terminal-sdk-platform=android&lang-android=java#setup-app).
