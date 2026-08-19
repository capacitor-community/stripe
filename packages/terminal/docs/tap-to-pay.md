---
title: 'Tap to Pay'
code: ['tap-to-pay/tap-to-pay.ts.md']
scrollActiveLine:
  [
    { id: '', activeLine: { ['tap-to-pay.ts']: [1, 1] } },
    { id: 'platform-prerequisites', activeLine: { ['tap-to-pay.ts']: [1, 1] } },
    { id: 'setup-sequence', activeLine: { ['tap-to-pay.ts']: [8, 11] } },
    { id: 'account-link-check', activeLine: { ['tap-to-pay.ts']: [11, 16] } },
    { id: 'ux-configuration', activeLine: { ['tap-to-pay.ts']: [16, 23] } },
    { id: 'discover-and-connect', activeLine: { ['tap-to-pay.ts']: [23, 36] } },
    { id: 'limitations', activeLine: { ['tap-to-pay.ts']: [1, 1] } },
  ]
---

Tap to Pay collects contactless payments on a compatible phone or tablet without a separate card reader. Use `TerminalConnectTypes.TapToPay` after [configuration](./configuration.md) and a working [connection token](./collect-a-payment.md).

The official demo exercises Tap to Pay, Internet, and Bluetooth in [demo/angular](https://github.com/capacitor-community/stripe/tree/main/demo/angular).

## Platform prerequisites

| Platform | Supported | Notes                                                                                                      |
| -------- | --------- | ---------------------------------------------------------------------------------------------------------- |
| Android  | Yes       | NFC-capable device, location permission, Stripe Tap to Pay on Android eligibility. `minSdkVersion` 26.     |
| iOS      | Yes       | Tap to Pay on iPhone, iOS 16.4+ for the account-link check. `setTapToPayUxConfiguration` is unimplemented. |
| Web      | No        | `discoverReaders({ type: TapToPay })` is unavailable.                                                      |

Complete Stripe Dashboard Terminal setup and create a [Location](https://docs.stripe.com/terminal/fleet/locations). Pass that `locationId` into `discoverReaders`; the plugin uses it when connecting the Tap to Pay reader.

Android `initialize` requests the location permission listed in [Configuration](./configuration.md). Bluetooth permissions are requested only when discovering `Bluetooth` or `Simulated` readers; Tap to Pay discovery itself does not request them.

## Setup sequence

1. Register application-level listeners.
2. Register an authenticated connection-token provider with `RequestedConnectionToken` + `setConnectionToken`, then call `initialize`.
3. On iOS, call `isTapToPayAccountLinked` (do not cache the result).
4. On Android, optionally call `setTapToPayUxConfiguration`.
5. `discoverReaders` with `type: TerminalConnectTypes.TapToPay` and `locationId`.
6. `connectReader` with the discovered reader.
7. Collect and confirm a `card_present` PaymentIntent as in [Collect a Payment](./collect-a-payment.md).

<!-- !::initialize:: -->

## Account-link check

`isTapToPayAccountLinked` is **iOS only** and requires iOS 16.4 or later. `initialize()` must have run so the SDK has a connection token provider. No reader connection is required and the call does not activate NFC.

The answer is read from Apple on every call. Do not cache `isLinked`. For Stripe Connect, pass `onBehalfOf` as the connected account ID; omit it to check the account that owns the API key.

Android and web reject the call (`unimplemented` / `unavailable`). Guard with a platform check or `.catch()` like the official demo does for Android-only UX configuration.

<!-- !::isTapToPayAccountLinked:: -->

<!-- !::IsTapToPayAccountLinkedOptions:: -->

## UX configuration

`setTapToPayUxConfiguration` is **Android only**. Call it after `initialize()` and before `connectReader()`. iOS returns unimplemented; web logs and returns.

The installed Android implementation applies `colors` (`primary`, `success`, `error` as `'default'` or a hex string such as `'#FF5733'`) and `darkMode` (`SYSTEM`, `DARK`, `LIGHT`). The TypeScript `tapZone` field is declared but not applied on the current Android Terminal SDK used by v8.2.1.

<!-- !::setTapToPayUxConfiguration:: -->

<!-- !::TapToPayUxConfiguration:: -->

<!-- !::TapToPayColorScheme:: -->

<!-- !::TapToPayColor:: -->

<!-- !::TapToPayTapZone:: -->

<!-- !::TapToPayDarkMode:: -->

## Discover and connect

Discover with `TerminalConnectTypes.TapToPay` and a `locationId`. Simulated Tap to Pay uses `isTest: true` on `initialize`, not `TerminalConnectTypes.Simulated`.

Connect the reader from the discovery result. `autoReconnectOnUnexpectedDisconnect` defaults to `false` and is supported for Tap to Pay. On iOS, `merchantDisplayName` and `onBehalfOf` are passed into the Tap to Pay connection configuration. On Android, set those values on the PaymentIntent instead.

<!-- !::discoverReaders:: -->

<!-- !::connectReader:: -->

After connect, use `collectPaymentMethod` and `confirmPaymentIntent` with a server-created `card_present` PaymentIntent.

## Limitations

- Web cannot discover or connect Tap to Pay.
- UX colors and dark mode are Android-only; iOS uses the system Tap to Pay on iPhone UI.
- Account-link status is iOS-only and must be re-fetched from Apple each time.
- `tapZone` is part of the TypeScript API but is not wired through on the installed Android SDK.
- Optional reader software updates still follow [Reader Lifecycle](./reader-lifecycle.md) rules: do not install during checkout.
- Keep Stripe secret keys and connection-token creation on the backend.
