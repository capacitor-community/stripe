---
title: 'Collect a Payment'
code: ['collect-a-payment/collect-payment.ts.md', 'collect-a-payment/connection-token.ts.md']
scrollActiveLine:
  [
    { id: '', activeLine: { ['collect-payment.ts']: [1, 1] } },
    { id: 'register-application-level-listeners', activeLine: { ['collect-payment.ts']: [6, 19] } },
    { id: 'initialize', activeLine: { ['connection-token.ts']: [0, 34] } },
    { id: 'supply-a-connection-token-securely', activeLine: { ['connection-token.ts']: [0, 34] } },
    {
      id: 'create-a-paymentintent-on-your-backend',
      activeLine: { ['collect-payment.ts']: [34, 42] },
    },
    { id: 'discover-readers', activeLine: { ['collect-payment.ts']: [22, 30] } },
    { id: 'connect-a-reader', activeLine: { ['collect-payment.ts']: [27, 34] } },
    { id: 'collect-a-payment-method', activeLine: { ['collect-payment.ts']: [42, 44] } },
    { id: 'confirm-the-payment-intent', activeLine: { ['collect-payment.ts']: [43, 45] } },
    { id: 'handle-cancellation-and-errors', activeLine: { ['collect-payment.ts']: [14, 19] } },
    { id: 'disconnect-the-reader', activeLine: { ['collect-payment.ts']: [44, 48] } },
  ]
---

Collect an in-person payment with Stripe Terminal by registering listeners early, initializing the plugin, connecting a reader, and confirming a PaymentIntent.

## Register application-level listeners

Register Terminal event listeners once per JavaScript application startup, as early as possible during bootstrap—for example from `main.ts`, an application initializer, or a singleton service initialized at startup—and before initializing or starting an operation. Keep them registered for the lifetime of their application-level owner.

!::TerminalEventsEnum::

Typed `addListener` overloads cover most of these members. `DiscoveringReaders` and `CancelDiscoveredReaders` are emitted by native discovery start and cancel but do not have dedicated overloads; see the [API](../README.md#api) page.

## Initialize

Prefer an authenticated app-side request through `RequestedConnectionToken` and `setConnectionToken`. This lets your app attach its normal authorization credentials and validate failures. Register the listener before `initialize`; the Terminal SDK asks for a new, single-use connection token whenever it needs one. Set `isTest` while developing.

!::initialize::

### `tokenProviderEndpoint` compatibility mode

`tokenProviderEndpoint` is available for simple deployments, but the v8.2.1 native clients send a bare HTTP **POST**: callers cannot add an authorization header or request body. Use it only when your server can authenticate and protect that request by other means. Never expose an unrestricted public token-creation endpoint.

When `tokenProviderEndpoint` is set, the plugin sends an HTTP **POST** with an empty body. The response **must** be JSON with a `secret` string:

```json
{ "secret": "pst_..." }
```

That value is a Stripe Terminal [connection token](https://docs.stripe.com/terminal/fleet/connect-reader?terminal-sdk-platform=js#connection-token). Create it on the server with your **secret** API key (`stripe.terminal.connectionTokens.create()`). Never put the secret key, restricted keys that can create tokens, or raw connection tokens in the app binary, logs, or a public client config.

The official demo exposes `POST /connection/token` and returns `{ secret }`; adapt its authentication and authorization to your application.

:::message
In v8.2.1, Android logs the `secret` returned through `tokenProviderEndpoint`, and web logs the options passed to `setConnectionToken`. Avoid endpoint mode on Android until the upstream logging is removed, avoid production web console retention, and update to a fixed plugin release when available.
:::

Web `initialize` requires a fresh plugin instance: calling it again after a successful init throws `Stripe Terminal has already been initialized`.

## Supply a connection token securely

Omit `tokenProviderEndpoint` and register `RequestedConnectionToken` **before** `initialize`. When the SDK needs a token, the plugin emits that event and waits for `setConnectionToken({ token })`.

Fetch with your normal authorization mechanism, require a successful response, validate `secret`, and pass it as `token`. Call `setConnectionToken` only while a fetch is pending; Android and iOS reject extra calls with `Stripe Terminal do not pending fetchConnectionToken`. Never log the response or token.

!::setConnectionToken::

## Create a PaymentIntent on your backend

Create the PaymentIntent on your server. The official demo uses `POST /connection/intent` and returns `{ paymentIntent }` as the **client secret**.

Requirements that match the plugin and demo:

- `payment_method_types` must include `card_present`
- Keep the Stripe secret key on the server
- Pass only the client secret into `collectPaymentMethod({ paymentIntent })`
- Do not create or confirm card-present PaymentIntents with a publishable key in the app

Example server shape from the demo:

```ts
await stripe.paymentIntents.create({
  amount: 1000,
  currency: 'usd',
  payment_method_types: ['card_present'],
  capture_method: 'automatic',
});
```

## Discover readers

Discover nearby or simulated readers. Provide a `TerminalConnectTypes` value and a Stripe Terminal `locationId` when the connection type needs it.

`locationId` is used during Internet discovery and is required when connecting Tap to Pay, Bluetooth, and Android USB readers. Internet discovery can filter by location; Tap to Pay and Bluetooth pass the location into the connection configuration.

Nuances:

- **Web** supports `Internet` only. Any other `type` is unavailable.
- **iOS Bluetooth** reports readers through `DiscoveredReaders` **multiple times** as the scan updates. See [Stripe: connect a Bluetooth reader (iOS)](https://docs.stripe.com/terminal/payments/connect-reader?terminal-sdk-platform=ios&reader-type=bluetooth). Set `bluetoothScanWaitTime` (milliseconds) so `discoverReaders` waits before resolving with the current list. `0` or omitted returns the first scan result.
- **iOS** also emits `DiscoveringReaders` when the scan starts. USB, HandOff, and `Simulated` as a `type` are unimplemented.
- **Android** requires `ACCESS_FINE_LOCATION` at runtime or `discoverReaders` rejects. `Simulated` is treated as Bluetooth discovery. `HandOff` is Apps on Devices.
- Call `cancelDiscoverReaders` if the user leaves the scan UI. Web is a no-op for cancel. Always give the user a way to stop a long Bluetooth scan.

Listen for `DiscoveredReaders` in addition to awaiting the promise. On iOS Bluetooth the listener is the live list; the promise may resolve earlier than the last event.

!::discoverReaders::

!::DiscoverReadersOptions::

!::TerminalConnectTypes::

## Connect a reader

Connect to one of the discovered readers before collecting payment details. The `reader` object must come from the current discovery result (`serialNumber` is the plugin's primary identifier).

`autoReconnectOnUnexpectedDisconnect` defaults to `false` and is applied for Tap to Pay and Bluetooth. Android USB currently enables auto-reconnect in the native connection config. Internet connections do not take this flag.

`merchantDisplayName` and `onBehalfOf` apply to iOS Tap to Pay (`LocalMobileReader`). On Android, set connected-account and display values on the PaymentIntent instead.

!::connectReader::

## Collect a payment method

Pass the PaymentIntent **client secret** from your backend to `collectPaymentMethod`. The plugin retrieves that PaymentIntent, then collects on the connected reader.

!::collectPaymentMethod::

## Confirm the payment intent

Process and confirm the collected PaymentIntent. `confirmPaymentIntent` rejects if you have not successfully collected first (`PaymentIntent not found for confirmPaymentIntent`).

!::confirmPaymentIntent::

`ConfirmedPaymentIntent` is a client UI signal, not fulfillment authority. Fulfill the order only after your backend verifies a Stripe webhook such as `payment_intent.succeeded`.

## Handle cancellation and errors

- `cancelCollectPaymentMethod` cancels an in-flight collect. On success the promise resolves and `Canceled` is emitted.
- `Failed` is emitted when `collectPaymentMethod` or `confirmPaymentIntent` fails. The same call's promise also rejects. The payload may include `message`, `code`, and `declineCode`.
- Do not use `ConnectionStatusChange` to detect unexpected disconnects. Use `UnexpectedReaderDisconnect`, and for Bluetooth/USB also `DisconnectedReader`. See [Reader Lifecycle](./reader-lifecycle.md).

!::cancelCollectPaymentMethod::

## Disconnect the reader

Disconnect when the payment flow is finished or the reader is no longer needed.

!::disconnectReader::
