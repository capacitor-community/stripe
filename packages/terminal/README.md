# @capacitor-community/stripe-terminal

Stripe SDK bindings for Capacitor Applications.
We have confirmed that it works well in the demo project. Refer to:

- Tap to Pay / Internet / Bluetooth demo: https://github.com/capacitor-community/stripe/tree/main/demo/angular
- App on Devices demo: https://github.com/capacitor-community/stripe/tree/main/demo/app-on-devices

## Install

```bash
npm install @capacitor-community/stripe-terminal
npx cap sync
```

### Web

No additional steps are necessary.

### iOS

No additional steps are necessary.

### Android

Add permissions to your `android/app/src/main/AndroidManifest.xml` file:

```diff
+ <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
+ <uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
+ <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
+ <uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
+ <uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
+ <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
```

And update `minSdkVersion` to 26 in your `android/variables.gradle` file:

```diff
ext {
-   minSdkVersion = 24
+   minSdkVersion = 26
```

If you are developing apps for Stripe Android devices (e.g. Stripe Reader S700), follow the Stripe's documentation for the client-side setup.
- [Stripe - Android configure your app](https://docs.stripe.com/terminal/features/apps-on-devices/build?terminal-sdk-platform=android&lang-android=java#setup-app)


## Usage

### Simple collect payment

Register application-level Terminal event listeners once per JavaScript application startup, as early as possible during bootstrap—for example, from `main.ts`, an application initializer, or a singleton service initialized at startup—and before initializing or starting an operation. Keep them registered for the lifetime of their application-level owner:

```typescript
const paymentStatusListener = await StripeTerminal.addListener(
  TerminalEventsEnum.PaymentStatusChange,
  ({ status }) => console.log(status),
);

// Keep paymentStatusListener and remove it only when its application-level owner is destroyed.
```

#### Use plugin client

```typescript
(async () => {
  /**
   * tokenProviderEndpoint: The URL of your backend to provide a token. Use Post request to get a token.
   */
  await StripeTerminal.initialize({ tokenProviderEndpoint: 'https://example.com/token', isTest: true });
  const { readers } = await StripeTerminal.discoverReaders({
    type: TerminalConnectTypes.TapToPay,
    locationId: "**************",
  });
  await StripeTerminal.connectReader({
    reader: readers[0],
  });
  // Collect payment intent
  await StripeTerminal.collectPaymentMethod({ paymentIntent: "**************" });
  // Process and confirm payment intent
  await StripeTerminal.confirmPaymentIntent();
  // disconnect reader
  await StripeTerminal.disconnectReader();
})();
```

#### set string token

```typescript
(async () => {
  // run before StripeTerminal.initialize
  await StripeTerminal.addListener(TerminalEventsEnum.RequestedConnectionToken, async () => {
    const response = await fetch("https://example.com/token", { method: "POST" });
    const { secret } = await response.json();
    await StripeTerminal.setConnectionToken({ token: secret });
  });
  await StripeTerminal.initialize({ isTest: true });
  const { readers } = await StripeTerminal.discoverReaders({
    type: TerminalConnectTypes.TapToPay,
    locationId: "**************",
  });
  await StripeTerminal.connectReader({
    reader: readers[0],
  });
  // Collect payment intent
  await StripeTerminal.collectPaymentMethod({ paymentIntent: "**************" });
  // Process and confirm payment intent
  await StripeTerminal.confirmPaymentIntent();
  // disconnect reader
  await StripeTerminal.disconnectReader();
})();
```

### Listen device update

The device will **if necessary** automatically start updating itself. It is important to handle them as needed so as not to disrupt business operations.

```ts
(async () => {
  StripeTerminal.addListener(TerminalEventsEnum.ReportAvailableUpdate, async ({ update }) => {
    if (window.confirm("Will you update the device?")) {
      await StripeTerminal.installAvailableUpdate();
    }
  });
  StripeTerminal.addListener(TerminalEventsEnum.StartInstallingUpdate, async ({ update }) => {
    console.log(update);
    if (window.confirm("Will you interrupt the update?")) {
      StripeTerminal.cancelInstallUpdate();
    }
  });
  StripeTerminal.addListener(TerminalEventsEnum.ReaderSoftwareUpdateProgress, async ({ progress }) => {
    // be able to use this value to create a progress bar.
  });
  StripeTerminal.addListener(TerminalEventsEnum.FinishInstallingUpdate, async ({ update }) => {
    console.log(update);
  });
})();
```

### Get terminal processing information

For devices without leader screen, processing information must be retrieved and displayed on the mobile device. Get it with a listener.

```ts
/**
 * Listen battery level. If the battery level is low, you can notify the user to charge the device.
 */
StripeTerminal.addListener(TerminalEventsEnum.BatteryLevel, async ({ level, charging, status }) => {
  console.log(level, charging, status);
});

/**
 * Listen reader event. You can get the reader's status and display it on the mobile device.
 */
StripeTerminal.addListener(TerminalEventsEnum.ReaderEvent, async ({ event }) => {
  console.log(event);
});

/**
 * Listen display message. You can get the message to be displayed on the mobile device.
 */
StripeTerminal.addListener(TerminalEventsEnum.RequestDisplayMessage, async ({ messageType, message }) => {
  console.log(messageType, message);
});

/**
 * Listen reader input. You can get the message what can be used for payment.
 */
StripeTerminal.addListener(TerminalEventsEnum.RequestReaderInput, async ({ options, message }) => {
  console.log(options, message);
});
```

### More details on the leader screen

The contents of the payment can be shown on the display. This requires a leader screen on the device.
This should be run before `collectPaymentMethod`.

```ts
await StripeTerminal.setReaderDisplay({
  currency: 'usd',
  tax: 0,
  total: 1000,
  lineItems: [{
    displayName: 'winecode',
    quantity: 2,
    amount: 500
  }] as CartLineItem[],
})

// Of course, erasure is also possible.
await StripeTerminal.clearReaderDisplay();
```

### Simulate reader status changes for testing

To implement updates, etc., we are facilitating an API to change the state of the simulator. This should be done before discoverReaders.

```ts
await StripeTerminal.setSimulatorConfiguration({ update: SimulateReaderUpdate.UpdateAvailable })
```

## API

<docgen-index>

* [`initialize(...)`](#initialize)
* [`discoverReaders(...)`](#discoverreaders)
* [`setConnectionToken(...)`](#setconnectiontoken)
* [`setSimulatorConfiguration(...)`](#setsimulatorconfiguration)
* [`connectReader(...)`](#connectreader)
* [`getConnectedReader()`](#getconnectedreader)
* [`disconnectReader()`](#disconnectreader)
* [`cancelDiscoverReaders()`](#canceldiscoverreaders)
* [`collectPaymentMethod(...)`](#collectpaymentmethod)
* [`cancelCollectPaymentMethod()`](#cancelcollectpaymentmethod)
* [`confirmPaymentIntent()`](#confirmpaymentintent)
* [`installAvailableUpdate()`](#installavailableupdate)
* [`cancelInstallUpdate()`](#cancelinstallupdate)
* [`setReaderDisplay(...)`](#setreaderdisplay)
* [`clearReaderDisplay()`](#clearreaderdisplay)
* [`rebootReader()`](#rebootreader)
* [`cancelReaderReconnection()`](#cancelreaderreconnection)
* [`setTapToPayUxConfiguration(...)`](#settaptopayuxconfiguration)
* [`isTapToPayAccountLinked(...)`](#istaptopayaccountlinked)
* [`addListener(TerminalEventsEnum.Loaded, ...)`](#addlistenerterminaleventsenumloaded-)
* [`addListener(TerminalEventsEnum.RequestedConnectionToken, ...)`](#addlistenerterminaleventsenumrequestedconnectiontoken-)
* [`addListener(TerminalEventsEnum.DiscoveredReaders, ...)`](#addlistenerterminaleventsenumdiscoveredreaders-)
* [`addListener(TerminalEventsEnum.ConnectedReader, ...)`](#addlistenerterminaleventsenumconnectedreader-)
* [`addListener(TerminalEventsEnum.DisconnectedReader, ...)`](#addlistenerterminaleventsenumdisconnectedreader-)
* [`addListener(TerminalEventsEnum.ConnectionStatusChange, ...)`](#addlistenerterminaleventsenumconnectionstatuschange-)
* [`addListener(TerminalEventsEnum.UnexpectedReaderDisconnect, ...)`](#addlistenerterminaleventsenumunexpectedreaderdisconnect-)
* [`addListener(TerminalEventsEnum.ConfirmedPaymentIntent, ...)`](#addlistenerterminaleventsenumconfirmedpaymentintent-)
* [`addListener(TerminalEventsEnum.CollectedPaymentIntent, ...)`](#addlistenerterminaleventsenumcollectedpaymentintent-)
* [`addListener(TerminalEventsEnum.Canceled, ...)`](#addlistenerterminaleventsenumcanceled-)
* [`addListener(TerminalEventsEnum.Failed, ...)`](#addlistenerterminaleventsenumfailed-)
* [`addListener(TerminalEventsEnum.ReportAvailableUpdate, ...)`](#addlistenerterminaleventsenumreportavailableupdate-)
* [`addListener(TerminalEventsEnum.StartInstallingUpdate, ...)`](#addlistenerterminaleventsenumstartinstallingupdate-)
* [`addListener(TerminalEventsEnum.ReaderSoftwareUpdateProgress, ...)`](#addlistenerterminaleventsenumreadersoftwareupdateprogress-)
* [`addListener(TerminalEventsEnum.FinishInstallingUpdate, ...)`](#addlistenerterminaleventsenumfinishinstallingupdate-)
* [`addListener(TerminalEventsEnum.BatteryLevel, ...)`](#addlistenerterminaleventsenumbatterylevel-)
* [`addListener(TerminalEventsEnum.ReaderEvent, ...)`](#addlistenerterminaleventsenumreaderevent-)
* [`addListener(TerminalEventsEnum.RequestDisplayMessage, ...)`](#addlistenerterminaleventsenumrequestdisplaymessage-)
* [`addListener(TerminalEventsEnum.RequestReaderInput, ...)`](#addlistenerterminaleventsenumrequestreaderinput-)
* [`addListener(TerminalEventsEnum.PaymentStatusChange, ...)`](#addlistenerterminaleventsenumpaymentstatuschange-)
* [`addListener(TerminalEventsEnum.ReaderReconnectStarted, ...)`](#addlistenerterminaleventsenumreaderreconnectstarted-)
* [`addListener(TerminalEventsEnum.ReaderReconnectSucceeded, ...)`](#addlistenerterminaleventsenumreaderreconnectsucceeded-)
* [`addListener(TerminalEventsEnum.ReaderReconnectFailed, ...)`](#addlistenerterminaleventsenumreaderreconnectfailed-)
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)
* [Enums](#enums)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### initialize(...)

```typescript
initialize(options: StripeTerminalInitializationOptions) => Promise<void>
```

Initializes the Stripe Terminal SDK and its connection-token provider.
Call this once before discovering readers.

When `tokenProviderEndpoint` is provided, the plugin sends a POST request
and expects `{ secret: string }`. When it is omitted, handle
`RequestedConnectionToken` and call `setConnectionToken()` instead.

| Param         | Type                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#stripeterminalinitializationoptions">StripeTerminalInitializationOptions</a></code> |

**Since:** 5.1.0

--------------------


### discoverReaders(...)

```typescript
discoverReaders(options: DiscoverReadersOptions) => Promise<{ readers: ReaderInterface[]; }>
```

Discovers readers using the requested transport. The returned readers are
snapshots; listen for `DiscoveredReaders` when continuous discovery can
produce additional results.

| Param         | Type                                                                      |
| ------------- | ------------------------------------------------------------------------- |
| **`options`** | <code><a href="#discoverreadersoptions">DiscoverReadersOptions</a></code> |

**Returns:** <code>Promise&lt;{ readers: ReaderInterface[]; }&gt;</code>

**Since:** 5.1.0

--------------------


### setConnectionToken(...)

```typescript
setConnectionToken(options: SetConnectionTokenOptions) => Promise<void>
```

Supplies a connection-token secret after `RequestedConnectionToken` is
emitted. Create each token on your server and use it only once.

| Param         | Type                                                                            |
| ------------- | ------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#setconnectiontokenoptions">SetConnectionTokenOptions</a></code> |

**Since:** 5.4.5

--------------------


### setSimulatorConfiguration(...)

```typescript
setSimulatorConfiguration(options: SimulatorConfigurationOptions) => Promise<void>
```

Configures the simulated reader used in test mode. Call before the
operation whose behavior you want to simulate.

[*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.models/-simulator-configuration/index.html)

| Param         | Type                                                                                    |
| ------------- | --------------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#simulatorconfigurationoptions">SimulatorConfigurationOptions</a></code> |

**Since:** 6.1.0

--------------------


### connectReader(...)

```typescript
connectReader(options: ConnectReaderOptions) => Promise<void>
```

Connects to a reader returned by `discoverReaders()`.

| Param         | Type                                                                  |
| ------------- | --------------------------------------------------------------------- |
| **`options`** | <code><a href="#connectreaderoptions">ConnectReaderOptions</a></code> |

**Since:** 5.1.0

--------------------


### getConnectedReader()

```typescript
getConnectedReader() => Promise<{ reader: ReaderInterface | null; }>
```

Returns the currently connected reader, or `null` when disconnected.

**Returns:** <code>Promise&lt;{ reader: <a href="#readerinterface">ReaderInterface</a> | null; }&gt;</code>

**Since:** 5.1.1

--------------------


### disconnectReader()

```typescript
disconnectReader() => Promise<void>
```

Disconnects the active reader. Resolves immediately if none is connected.

**Since:** 5.1.1

--------------------


### cancelDiscoverReaders()

```typescript
cancelDiscoverReaders() => Promise<void>
```

Cancels the active reader-discovery operation.

**Since:** 5.1.1

--------------------


### collectPaymentMethod(...)

```typescript
collectPaymentMethod(options: CollectPaymentMethodOptions) => Promise<void>
```

Collects a payment method for a server-created PaymentIntent. Confirm the
collected intent with `confirmPaymentIntent()`.

| Param         | Type                                                                                |
| ------------- | ----------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#collectpaymentmethodoptions">CollectPaymentMethodOptions</a></code> |

**Since:** 5.5.0

--------------------


### cancelCollectPaymentMethod()

```typescript
cancelCollectPaymentMethod() => Promise<void>
```

Cancels an in-progress `collectPaymentMethod()` call.

**Since:** 5.5.0

--------------------


### confirmPaymentIntent()

```typescript
confirmPaymentIntent() => Promise<void>
```

Confirms the PaymentIntent most recently collected by the reader.

**Since:** 5.5.0

--------------------


### installAvailableUpdate()

```typescript
installAvailableUpdate() => Promise<void>
```

Installs the software update reported by `ReportAvailableUpdate`.

**Since:** 6.2.0

--------------------


### cancelInstallUpdate()

```typescript
cancelInstallUpdate() => Promise<void>
```

Cancels an in-progress optional reader software update.

**Since:** 6.2.0

--------------------


### setReaderDisplay(...)

```typescript
setReaderDisplay(options: Cart) => Promise<void>
```

Displays cart details on a reader with a customer-facing display.

| Param         | Type                                  |
| ------------- | ------------------------------------- |
| **`options`** | <code><a href="#cart">Cart</a></code> |

**Since:** 6.2.0

--------------------


### clearReaderDisplay()

```typescript
clearReaderDisplay() => Promise<void>
```

Clears cart details from the reader's customer-facing display.

**Since:** 6.2.0

--------------------


### rebootReader()

```typescript
rebootReader() => Promise<void>
```

Reboots the connected reader. Supported reader types are platform dependent.

**Since:** 6.2.0

--------------------


### cancelReaderReconnection()

```typescript
cancelReaderReconnection() => Promise<void>
```

Cancels an automatic reader reconnection attempt.

**Since:** 6.2.0

--------------------


### setTapToPayUxConfiguration(...)

```typescript
setTapToPayUxConfiguration(options: TapToPayUxConfiguration) => Promise<void>
```

Configure the Tap to Pay UX appearance (Android only).
Call this after initialize() but before connectReader().
Has no effect on iOS or web platforms.

| Param         | Type                                                                        |
| ------------- | --------------------------------------------------------------------------- |
| **`options`** | <code><a href="#taptopayuxconfiguration">TapToPayUxConfiguration</a></code> |

**Since:** 8.1.0

--------------------


### isTapToPayAccountLinked(...)

```typescript
isTapToPayAccountLinked(options?: IsTapToPayAccountLinkedOptions | undefined) => Promise<{ isLinked: boolean; }>
```

Check whether the merchant has accepted Apple's Tap to Pay on iPhone
Terms and Conditions.

iOS only, and requires iOS 16.4 or later. `initialize()` must have been
called first because the SDK needs a connection token provider, but no
reader connection is required and the call does not activate the device.

The answer is read from Apple on every call. Apple's Tap to Pay on iPhone
requirements state that acceptance state must be retrieved from Apple
rather than from a local variable, so do not cache the result.

[*Stripe docs reference*](https://stripe.dev/stripe-terminal-ios/docs/Classes/SCPTerminal.html#/c:objc(cs)SCPTerminal(im)isTapToPayAccountLinked:completion:)

| Param         | Type                                                                                      |
| ------------- | ----------------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#istaptopayaccountlinkedoptions">IsTapToPayAccountLinkedOptions</a></code> |

**Returns:** <code>Promise&lt;{ isLinked: boolean; }&gt;</code>

**Since:** 8.2.0

--------------------


### addListener(TerminalEventsEnum.Loaded, ...)

```typescript
addListener(eventName: TerminalEventsEnum.Loaded, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Emitted after the Terminal SDK has initialized.

| Param              | Type                                                                     |
| ------------------ | ------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.Loaded</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                               |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 5.1.0

--------------------


### addListener(TerminalEventsEnum.RequestedConnectionToken, ...)

```typescript
addListener(eventName: TerminalEventsEnum.RequestedConnectionToken, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Emitted when the SDK needs a connection token and no token endpoint was
configured. Respond by calling `setConnectionToken()`.

| Param              | Type                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.RequestedConnectionToken</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                                 |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 5.1.0

--------------------


### addListener(TerminalEventsEnum.DiscoveredReaders, ...)

```typescript
addListener(eventName: TerminalEventsEnum.DiscoveredReaders, listenerFunc: ({ readers }: { readers: ReaderInterface[]; }) => void) => Promise<PluginListenerHandle>
```

Emitted whenever discovery produces an updated reader list. During iOS
Bluetooth discovery this event can be emitted multiple times.

https://docs.stripe.com/terminal/payments/connect-reader?terminal-sdk-platform=ios&reader-type=bluetooth

| Param              | Type                                                                                |
| ------------------ | ----------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.DiscoveredReaders</a></code> |
| **`listenerFunc`** | <code>({ readers }: { readers: ReaderInterface[]; }) =&gt; void</code>              |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 5.1.0

--------------------


### addListener(TerminalEventsEnum.ConnectedReader, ...)

```typescript
addListener(eventName: TerminalEventsEnum.ConnectedReader, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Emitted after a reader connects successfully.

| Param              | Type                                                                              |
| ------------------ | --------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.ConnectedReader</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                        |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 5.1.0

--------------------


### addListener(TerminalEventsEnum.DisconnectedReader, ...)

```typescript
addListener(eventName: TerminalEventsEnum.DisconnectedReader, listenerFunc: ({ reason }: { reason?: DisconnectReason | undefined; }) => void) => Promise<PluginListenerHandle>
```

Emitted when the reader is disconnected, either in response to [`disconnectReader()`](#disconnectreader)
or some connection error.

For all reader types, this is emitted in response to [`disconnectReader()`](#disconnectreader)
without a `reason` property.

For Bluetooth and USB readers, this is emitted with a `reason` property when the reader disconnects.

**Note:** For Bluetooth and USB readers, when you call [`disconnectReader()`](#disconnectreader), this event
will be emitted twice: one without a `reason` in acknowledgement of your call, and again with a `reason` when the reader
finishes disconnecting.

| Param              | Type                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.DisconnectedReader</a></code>                 |
| **`listenerFunc`** | <code>({ reason }: { reason?: <a href="#disconnectreason">DisconnectReason</a>; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 6.2.0

--------------------


### addListener(TerminalEventsEnum.ConnectionStatusChange, ...)

```typescript
addListener(eventName: TerminalEventsEnum.ConnectionStatusChange, listenerFunc: ({ status }: { status: ConnectionStatus; }) => void) => Promise<PluginListenerHandle>
```

Emitted when the Terminal's connection status changed.

Note: You should *not* use this method to detect when a reader unexpectedly disconnects from your app,
as it cannot be used to accurately distinguish between expected and unexpected disconnect events.

To detect unexpected disconnects (e.g. to automatically notify your user), you should instead use
the UnexpectedReaderDisconnect event.

[*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-terminal-listener/on-connection-status-change.html)

| Param              | Type                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.ConnectionStatusChange</a></code>            |
| **`listenerFunc`** | <code>({ status }: { status: <a href="#connectionstatus">ConnectionStatus</a>; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 6.1.0

--------------------


### addListener(TerminalEventsEnum.UnexpectedReaderDisconnect, ...)

```typescript
addListener(eventName: TerminalEventsEnum.UnexpectedReaderDisconnect, listenerFunc: ({ reader }: { reader: ReaderInterface; }) => void) => Promise<PluginListenerHandle>
```

The Terminal disconnected unexpectedly from the reader.

In your implementation of this method, you may want to notify your user that the reader disconnected.
You may also call [`discoverReaders()`](#discoverreaders) to begin scanning for readers, and attempt
to automatically reconnect to the disconnected reader. Be sure to either set a timeout or make it
possible to cancel calls to `discoverReaders()`

When connected to a Bluetooth or USB reader, you can get more information about the disconnect by
implementing the DisconnectedReader event.

[*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-terminal-listener/on-unexpected-reader-disconnect.html)

| Param              | Type                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.UnexpectedReaderDisconnect</a></code>      |
| **`listenerFunc`** | <code>({ reader }: { reader: <a href="#readerinterface">ReaderInterface</a>; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 6.1.0

--------------------


### addListener(TerminalEventsEnum.ConfirmedPaymentIntent, ...)

```typescript
addListener(eventName: TerminalEventsEnum.ConfirmedPaymentIntent, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Emitted after `confirmPaymentIntent()` succeeds.

| Param              | Type                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.ConfirmedPaymentIntent</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                               |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 5.5.0

--------------------


### addListener(TerminalEventsEnum.CollectedPaymentIntent, ...)

```typescript
addListener(eventName: TerminalEventsEnum.CollectedPaymentIntent, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Emitted after `collectPaymentMethod()` succeeds.

| Param              | Type                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.CollectedPaymentIntent</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                               |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 5.5.0

--------------------


### addListener(TerminalEventsEnum.Canceled, ...)

```typescript
addListener(eventName: TerminalEventsEnum.Canceled, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Emitted when [`cancelCollectPaymentMethod()`](#cancelcollectpaymentmethod) is called and succeeds.
The Promise returned by `cancelCollectPaymentMethod()` will also be resolved.

| Param              | Type                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.Canceled</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                 |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 5.5.0

--------------------


### addListener(TerminalEventsEnum.Failed, ...)

```typescript
addListener(eventName: TerminalEventsEnum.Failed, listenerFunc: (info: { message: string; code?: string; declineCode?: string; }) => void) => Promise<PluginListenerHandle>
```

Emitted when either [`collectPaymentMethod()`](#collectpaymentmethod) or [`confirmPaymentIntent()`](#confirmpaymentintent)
fails. The Promise returned by the relevant call will also be rejected.

| Param              | Type                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.Failed</a></code>                  |
| **`listenerFunc`** | <code>(info: { message: string; code?: string; declineCode?: string; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 5.5.0

--------------------


### addListener(TerminalEventsEnum.ReportAvailableUpdate, ...)

```typescript
addListener(eventName: TerminalEventsEnum.ReportAvailableUpdate, listenerFunc: ({ update }: { update: ReaderSoftwareUpdateInterface; }) => void) => Promise<PluginListenerHandle>
```

Emitted when a software update is available for the connected reader.

| Param              | Type                                                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.ReportAvailableUpdate</a></code>                                       |
| **`listenerFunc`** | <code>({ update }: { update: <a href="#readersoftwareupdateinterface">ReaderSoftwareUpdateInterface</a>; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 6.1.0

--------------------


### addListener(TerminalEventsEnum.StartInstallingUpdate, ...)

```typescript
addListener(eventName: TerminalEventsEnum.StartInstallingUpdate, listenerFunc: ({ update }: { update: ReaderSoftwareUpdateInterface; }) => void) => Promise<PluginListenerHandle>
```

**Only applicable to Bluetooth and USB readers.**

Emitted when the connected reader begins installing a software update.
If a mandatory software update is available when a reader first connects, that update is
automatically installed. The update will be installed before ConnectedReader is emitted and
before the Promise returned by [`connectReader()`](#connectreader) resolves.
In this case, you will receive this sequence of events:

1. StartInstallingUpdate
2. ReaderSoftwareUpdateProgress (repeatedly)
3. FinishInstallingUpdates
4. ConnectedReader
5. `connectReader()` Promise resolves

Your app should show UI to the user indicating that a software update is being installed
to explain why connecting is taking longer than usual.

[*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-reader-listener/on-start-installing-update.html)

| Param              | Type                                                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.StartInstallingUpdate</a></code>                                       |
| **`listenerFunc`** | <code>({ update }: { update: <a href="#readersoftwareupdateinterface">ReaderSoftwareUpdateInterface</a>; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 6.1.0

--------------------


### addListener(TerminalEventsEnum.ReaderSoftwareUpdateProgress, ...)

```typescript
addListener(eventName: TerminalEventsEnum.ReaderSoftwareUpdateProgress, listenerFunc: ({ progress }: { progress: number; }) => void) => Promise<PluginListenerHandle>
```

**Only applicable to Bluetooth and USB readers.**

Emitted periodically while reader software is updating to inform of the installation progress.
`progress` is a float between 0 and 1.

[*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-reader-listener/on-report-reader-software-update-progress.html)

| Param              | Type                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.ReaderSoftwareUpdateProgress</a></code> |
| **`listenerFunc`** | <code>({ progress }: { progress: number; }) =&gt; void</code>                                  |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 6.1.0

--------------------


### addListener(TerminalEventsEnum.FinishInstallingUpdate, ...)

```typescript
addListener(eventName: TerminalEventsEnum.FinishInstallingUpdate, listenerFunc: (args: { update: ReaderSoftwareUpdateInterface; } | { error: string; }) => void) => Promise<PluginListenerHandle>
```

**Only applicable to Bluetooth and USB readers.**

Emitted when reader software installation finishes. The callback contains
either the installed update or an error.

[*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-reader-listener/on-finish-installing-update.html)

| Param              | Type                                                                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.FinishInstallingUpdate</a></code>                                                      |
| **`listenerFunc`** | <code>(args: { update: <a href="#readersoftwareupdateinterface">ReaderSoftwareUpdateInterface</a>; } \| { error: string; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 6.1.0

--------------------


### addListener(TerminalEventsEnum.BatteryLevel, ...)

```typescript
addListener(eventName: TerminalEventsEnum.BatteryLevel, listenerFunc: ({ level, charging, status }: { level: number; charging: boolean; status: BatteryStatus; }) => void) => Promise<PluginListenerHandle>
```

**Only applicable to Bluetooth and USB readers.**

Emitted upon connection and every 10 minutes.

[*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-reader-listener/on-battery-level-update.html)

| Param              | Type                                                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.BatteryLevel</a></code>                                                                   |
| **`listenerFunc`** | <code>({ level, charging, status }: { level: number; charging: boolean; status: <a href="#batterystatus">BatteryStatus</a>; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 6.1.0

--------------------


### addListener(TerminalEventsEnum.ReaderEvent, ...)

```typescript
addListener(eventName: TerminalEventsEnum.ReaderEvent, listenerFunc: ({ event }: { event: ReaderEvent; }) => void) => Promise<PluginListenerHandle>
```

**Only applicable to Bluetooth and USB readers.**

[*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-reader-listenable/on-report-reader-event.html)

| Param              | Type                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.ReaderEvent</a></code>           |
| **`listenerFunc`** | <code>({ event }: { event: <a href="#readerevent">ReaderEvent</a>; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 6.1.0

--------------------


### addListener(TerminalEventsEnum.RequestDisplayMessage, ...)

```typescript
addListener(eventName: TerminalEventsEnum.RequestDisplayMessage, listenerFunc: ({ messageType, message }: { messageType: ReaderDisplayMessage; message: string; }) => void) => Promise<PluginListenerHandle>
```

**Only applicable to Bluetooth and USB readers.**

Emitted when the Terminal requests that a message be displayed in your app.

[*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-reader-listener/on-request-reader-display-message.html)

| Param              | Type                                                                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.RequestDisplayMessage</a></code>                                                         |
| **`listenerFunc`** | <code>({ messageType, message }: { messageType: <a href="#readerdisplaymessage">ReaderDisplayMessage</a>; message: string; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 6.1.0

--------------------


### addListener(TerminalEventsEnum.RequestReaderInput, ...)

```typescript
addListener(eventName: TerminalEventsEnum.RequestReaderInput, listenerFunc: ({ options, message }: { options: ReaderInputOption[]; message: string; }) => void) => Promise<PluginListenerHandle>
```

**Only applicable to Bluetooth and USB readers.**

Emitted when the reader begins waiting for input. Your app should prompt the customer
to present a source using one of the given input options. If the reader emits a message,
the RequestDisplayMessage event will be emitted.

[*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-reader-listener/on-request-reader-input.html)

| Param              | Type                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.RequestReaderInput</a></code>               |
| **`listenerFunc`** | <code>({ options, message }: { options: ReaderInputOption[]; message: string; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 6.1.0

--------------------


### addListener(TerminalEventsEnum.PaymentStatusChange, ...)

```typescript
addListener(eventName: TerminalEventsEnum.PaymentStatusChange, listenerFunc: ({ status }: { status: PaymentStatus; }) => void) => Promise<PluginListenerHandle>
```

Emitted when the Terminal SDK's payment collection status changes.

[*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-terminal-listener/on-payment-status-change.html)

| Param              | Type                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.PaymentStatusChange</a></code>         |
| **`listenerFunc`** | <code>({ status }: { status: <a href="#paymentstatus">PaymentStatus</a>; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 6.1.0

--------------------


### addListener(TerminalEventsEnum.ReaderReconnectStarted, ...)

```typescript
addListener(eventName: TerminalEventsEnum.ReaderReconnectStarted, listenerFunc: ({ reader, reason }: { reader: ReaderInterface; reason: string; }) => void) => Promise<PluginListenerHandle>
```

Emitted when automatic reader reconnection begins.

| Param              | Type                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.ReaderReconnectStarted</a></code>                                  |
| **`listenerFunc`** | <code>({ reader, reason }: { reader: <a href="#readerinterface">ReaderInterface</a>; reason: string; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 6.2.0

--------------------


### addListener(TerminalEventsEnum.ReaderReconnectSucceeded, ...)

```typescript
addListener(eventName: TerminalEventsEnum.ReaderReconnectSucceeded, listenerFunc: ({ reader }: { reader: ReaderInterface; }) => void) => Promise<PluginListenerHandle>
```

Emitted when automatic reader reconnection succeeds.

| Param              | Type                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.ReaderReconnectSucceeded</a></code>        |
| **`listenerFunc`** | <code>({ reader }: { reader: <a href="#readerinterface">ReaderInterface</a>; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 6.2.0

--------------------


### addListener(TerminalEventsEnum.ReaderReconnectFailed, ...)

```typescript
addListener(eventName: TerminalEventsEnum.ReaderReconnectFailed, listenerFunc: ({ reader }: { reader: ReaderInterface; }) => void) => Promise<PluginListenerHandle>
```

Emitted when automatic reader reconnection fails.

| Param              | Type                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.ReaderReconnectFailed</a></code>           |
| **`listenerFunc`** | <code>({ reader }: { reader: <a href="#readerinterface">ReaderInterface</a>; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 6.2.0

--------------------


### Interfaces


#### StripeTerminalInitializationOptions

| Prop                        | Type                 | Description                                                         | Since |
| --------------------------- | -------------------- | ------------------------------------------------------------------- | ----- |
| **`tokenProviderEndpoint`** | <code>string</code>  | HTTPS endpoint that creates a new Stripe Terminal connection token. | 5.1.0 |
| **`isTest`**                | <code>boolean</code> | Enables simulated discovery and readers where supported.            | 5.1.0 |


#### ReaderInterface

Snapshot of a Stripe Terminal reader returned by discovery or connection.

| Prop                        | Type                                                                                    | Description                                                            | Since |
| --------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----- |
| **`serialNumber`**          | <code>string</code>                                                                     | Stable hardware serial number used as the reader's primary identifier. | 6.2.0 |
| **`label`**                 | <code>string</code>                                                                     | Human-readable reader label.                                           | 6.2.0 |
| **`batteryLevel`**          | <code>number</code>                                                                     | Reader battery level from `0` to `1`.                                  | 6.2.0 |
| **`batteryStatus`**         | <code><a href="#batterystatus">BatteryStatus</a></code>                                 | Current reader battery status.                                         | 6.2.0 |
| **`simulated`**             | <code>boolean</code>                                                                    | Whether this is a simulated reader.                                    | 6.2.0 |
| **`id`**                    | <code>number</code>                                                                     | Platform-specific numeric reader identifier.                           | 6.2.0 |
| **`availableUpdate`**       | <code><a href="#readersoftwareupdateinterface">ReaderSoftwareUpdateInterface</a></code> | Available reader software update, when one has been reported.          | 6.2.0 |
| **`locationId`**            | <code>string</code>                                                                     | Stripe Terminal Location ID assigned to the reader.                    | 6.2.0 |
| **`ipAddress`**             | <code>string</code>                                                                     | Reader IP address when available.                                      | 6.2.0 |
| **`status`**                | <code><a href="#networkstatus">NetworkStatus</a></code>                                 | Current network status of the reader.                                  | 6.2.0 |
| **`location`**              | <code><a href="#locationinterface">LocationInterface</a></code>                         | Location details returned with the reader, when available.             | 6.2.0 |
| **`locationStatus`**        | <code><a href="#locationstatus">LocationStatus</a></code>                               | Current location-assignment status.                                    | 6.2.0 |
| **`deviceType`**            | <code><a href="#devicetype">DeviceType</a></code>                                       | Reader hardware type.                                                  | 6.2.0 |
| **`deviceSoftwareVersion`** | <code>string \| null</code>                                                             | Installed reader software version, when reported by the SDK.           | 6.2.0 |
| **`isCharging`**            | <code>number</code>                                                                     | iOS Only properties. These properties are not available on Android.    | 6.2.0 |
| **`baseUrl`**               | <code>string</code>                                                                     | Android Only properties. These properties are not available on iOS.    | 6.2.0 |
| **`bootloaderVersion`**     | <code>string</code>                                                                     | Android reader bootloader version.                                     | 6.2.0 |
| **`configVersion`**         | <code>string</code>                                                                     | Android reader configuration version.                                  | 6.2.0 |
| **`emvKeyProfileId`**       | <code>string</code>                                                                     | Android reader EMV key-profile identifier.                             | 6.2.0 |
| **`firmwareVersion`**       | <code>string</code>                                                                     | Android reader firmware version.                                       | 6.2.0 |
| **`hardwareVersion`**       | <code>string</code>                                                                     | Android reader hardware version.                                       | 6.2.0 |
| **`macKeyProfileId`**       | <code>string</code>                                                                     | Android reader MAC key-profile identifier.                             | 6.2.0 |
| **`pinKeyProfileId`**       | <code>string</code>                                                                     | Android reader PIN key-profile identifier.                             | 6.2.0 |
| **`trackKeyProfileId`**     | <code>string</code>                                                                     | Android reader track key-profile identifier.                           | 6.2.0 |
| **`settingsVersion`**       | <code>string</code>                                                                     | Android reader settings version.                                       | 6.2.0 |
| **`pinKeysetId`**           | <code>string</code>                                                                     | Android reader PIN keyset identifier.                                  | 6.2.0 |


#### ReaderSoftwareUpdateInterface

Metadata for an available reader software update.

| Prop                        | Type                                                              | Description                                             | Since |
| --------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------- | ----- |
| **`deviceSoftwareVersion`** | <code>string</code>                                               | Software version offered by the update.                 | 6.1.0 |
| **`estimatedUpdateTime`**   | <code><a href="#updatetimeestimate">UpdateTimeEstimate</a></code> | Estimated duration of the update.                       | 6.1.0 |
| **`requiredAt`**            | <code>number</code>                                               | Unix timestamp after which the update becomes required. | 6.1.0 |


#### LocationInterface

Stripe Terminal Location assigned to a reader.

| Prop              | Type                                                        | Description                                   | Since |
| ----------------- | ----------------------------------------------------------- | --------------------------------------------- | ----- |
| **`id`**          | <code>string</code>                                         | Stripe Terminal Location ID.                  | 6.2.0 |
| **`displayName`** | <code>string</code>                                         | Display name configured for the location.     | 6.2.0 |
| **`address`**     | <code><a href="#locationaddress">LocationAddress</a></code> | Postal address configured for the location.   | 6.2.0 |
| **`ipAddress`**   | <code>string</code>                                         | Location IP address when provided by the SDK. | 6.2.0 |


#### LocationAddress

Postal address configured for a Stripe Terminal Location.

| Prop             | Type                | Description                               | Since |
| ---------------- | ------------------- | ----------------------------------------- | ----- |
| **`city`**       | <code>string</code> | City, district, suburb, town, or village. | 6.2.0 |
| **`country`**    | <code>string</code> | Two-letter ISO 3166-1 country code.       | 6.2.0 |
| **`postalCode`** | <code>string</code> | ZIP or postal code.                       | 6.2.0 |
| **`line1`**      | <code>string</code> | Primary address line.                     | 6.2.0 |
| **`line2`**      | <code>string</code> | Secondary address line.                   | 6.2.0 |
| **`state`**      | <code>string</code> | State, county, province, or region.       | 6.2.0 |


#### DiscoverReadersOptions

| Prop                        | Type                                                                  | Description                                                                                                                                                                                                                                                                                                                                           | Since |
| --------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **`type`**                  | <code><a href="#terminalconnecttypes">TerminalConnectTypes</a></code> | Discovery method and reader transport to use.                                                                                                                                                                                                                                                                                                         | 5.1.0 |
| **`locationId`**            | <code>string</code>                                                   | Stripe Terminal Location ID used to scope internet reader discovery and reader registration where required.                                                                                                                                                                                                                                           | 5.1.0 |
| **`bluetoothScanWaitTime`** | <code>number</code>                                                   | Only applies to Bluetooth scan discovery (iOS only). During discovery, readers are reported via DiscoveryDelegate.didUpdateDiscoveredReaders. This timeout controls how long to wait before resolving the `discoverReaders` method with the current list. If this setting is not specified or is set to 0, the initial scan results will be returned. | 7.2.0 |


#### SetConnectionTokenOptions

| Prop        | Type                | Description                                         | Since |
| ----------- | ------------------- | --------------------------------------------------- | ----- |
| **`token`** | <code>string</code> | Secret returned by the Stripe Connection Token API. | 5.4.5 |


#### SimulatorConfigurationOptions

| Prop                     | Type                                                                  | Description                                                         | Since |
| ------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------- | ----- |
| **`update`**             | <code><a href="#simulatereaderupdate">SimulateReaderUpdate</a></code> | Simulated reader-update scenario.                                   | 6.1.0 |
| **`simulatedCard`**      | <code><a href="#simulatedcardtype">SimulatedCardType</a></code>       | Simulated card presented during collection.                         | 6.1.0 |
| **`simulatedTipAmount`** | <code>number</code>                                                   | Simulated tip amount in the PaymentIntent currency's smallest unit. | 6.1.0 |


#### ConnectReaderOptions

| Prop                                      | Type                                                        | Description                                                                                                                                | Default            | Since |
| ----------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ | ----- |
| **`reader`**                              | <code><a href="#readerinterface">ReaderInterface</a></code> | Reader selected from the latest discovery result.                                                                                          |                    | 5.1.0 |
| **`autoReconnectOnUnexpectedDisconnect`** | <code>boolean</code>                                        | Automatically attempts to reconnect after an unexpected disconnect.                                                                        | <code>false</code> | 6.2.0 |
| **`merchantDisplayName`**                 | <code>string</code>                                         | Merchant name displayed by local mobile readers. iOS only; on Android configure the merchant name on the PaymentIntent.                    |                    | 6.2.0 |
| **`onBehalfOf`**                          | <code>string</code>                                         | Stripe connected-account ID for which the funds are intended. iOS local mobile readers only; on Android configure it on the PaymentIntent. |                    | 6.2.0 |


#### CollectPaymentMethodOptions

| Prop                | Type                | Description                                                     | Since |
| ------------------- | ------------------- | --------------------------------------------------------------- | ----- |
| **`paymentIntent`** | <code>string</code> | Client secret of a PaymentIntent configured for `card_present`. | 5.5.0 |


#### Cart

<a href="#cart">Cart</a> totals displayed on a reader's customer-facing screen.

| Prop            | Type                        | Description                                                     | Since |
| --------------- | --------------------------- | --------------------------------------------------------------- | ----- |
| **`currency`**  | <code>string</code>         | Three-letter ISO 4217 currency code.                            | 6.2.0 |
| **`tax`**       | <code>number</code>         | Tax amount in the currency's smallest unit.                     | 6.2.0 |
| **`total`**     | <code>number</code>         | <a href="#cart">Cart</a> total in the currency's smallest unit. | 6.2.0 |
| **`lineItems`** | <code>CartLineItem[]</code> | Items displayed in the cart.                                    | 6.2.0 |


#### CartLineItem

Line item displayed on a reader's customer-facing screen.

| Prop              | Type                | Description                                       | Since |
| ----------------- | ------------------- | ------------------------------------------------- | ----- |
| **`displayName`** | <code>string</code> | Item name shown on the reader.                    | 6.2.0 |
| **`quantity`**    | <code>number</code> | Number of units in the cart.                      | 6.2.0 |
| **`amount`**      | <code>number</code> | Line-item amount in the currency's smallest unit. | 6.2.0 |


#### TapToPayUxConfiguration

Configuration for the Tap to Pay UX (Android only).

| Prop           | Type                                                                | Description                                  | Since |
| -------------- | ------------------------------------------------------------------- | -------------------------------------------- | ----- |
| **`colors`**   | <code><a href="#taptopaycolorscheme">TapToPayColorScheme</a></code> | Color scheme for the Tap to Pay screen.      | 8.1.0 |
| **`darkMode`** | <code><a href="#taptopaydarkmode">TapToPayDarkMode</a></code>       | Dark-mode setting for the Tap to Pay screen. | 8.1.0 |
| **`tapZone`**  | <code><a href="#taptopaytapzone">TapToPayTapZone</a></code>         | Position of the tap indicator on screen.     | 8.1.0 |


#### TapToPayColorScheme

Color scheme for the Tap to Pay screen.

| Prop          | Type                                                    | Description                                                              | Since |
| ------------- | ------------------------------------------------------- | ------------------------------------------------------------------------ | ----- |
| **`primary`** | <code><a href="#taptopaycolor">TapToPayColor</a></code> | Primary color for the tap-zone indicator. Use a hex string or `default`. | 8.1.0 |
| **`success`** | <code><a href="#taptopaycolor">TapToPayColor</a></code> | Success-state color. Use a hex string or `default`.                      | 8.1.0 |
| **`error`**   | <code><a href="#taptopaycolor">TapToPayColor</a></code> | Error-state color. Use a hex string or `default`.                        | 8.1.0 |


#### IsTapToPayAccountLinkedOptions

Options for isTapToPayAccountLinked.

| Prop             | Type                | Description                                                                                          | Since |
| ---------------- | ------------------- | ---------------------------------------------------------------------------------------------------- | ----- |
| **`onBehalfOf`** | <code>string</code> | Connected account ID, for Stripe Connect platforms. Omit to check the account that owns the API key. | 8.2.0 |


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


### Type Aliases


#### DeviceType

<code>Stripe.Terminal.Reader.<a href="#devicetype">DeviceType</a></code>


#### TapToPayColor

Color value for <a href="#taptopayuxconfiguration">TapToPayUxConfiguration</a>.
Use 'default' to use Stripe's default color, or a hex string like '#965D35'.

<code>'default' | string</code>


#### TapToPayTapZone

Tap zone position configuration.
Controls where the tap indicator appears on screen.

<code>{ type: 'default' } | { type: 'front'; xBias: number; yBias: number } | { type: 'behind'; xBias: number; yBias: number } | { type: 'above'; bias?: number } | { type: 'below'; bias?: number } | { type: 'left'; bias?: number } | { type: 'right'; bias?: number }</code>


### Enums


#### BatteryStatus

| Members        | Value                   |
| -------------- | ----------------------- |
| **`Unknown`**  | <code>'UNKNOWN'</code>  |
| **`Critical`** | <code>'CRITICAL'</code> |
| **`Low`**      | <code>'LOW'</code>      |
| **`Nominal`**  | <code>'NOMINAL'</code>  |


#### UpdateTimeEstimate

| Members                    | Value                                  |
| -------------------------- | -------------------------------------- |
| **`LessThanOneMinute`**    | <code>'LESS_THAN_ONE_MINUTE'</code>    |
| **`OneToTwoMinutes`**      | <code>'ONE_TO_TWO_MINUTES'</code>      |
| **`TwoToFiveMinutes`**     | <code>'TWO_TO_FIVE_MINUTES'</code>     |
| **`FiveToFifteenMinutes`** | <code>'FIVE_TO_FIFTEEN_MINUTES'</code> |


#### NetworkStatus

| Members       | Value                  |
| ------------- | ---------------------- |
| **`Unknown`** | <code>'UNKNOWN'</code> |
| **`Online`**  | <code>'ONLINE'</code>  |
| **`Offline`** | <code>'OFFLINE'</code> |


#### LocationStatus

| Members       | Value                  |
| ------------- | ---------------------- |
| **`NotSet`**  | <code>'NOT_SET'</code> |
| **`Set`**     | <code>'SET'</code>     |
| **`Unknown`** | <code>'UNKNOWN'</code> |


#### DeviceType

| Members                | Value                           |
| ---------------------- | ------------------------------- |
| **`tapToPayDevice`**   | <code>'tapToPayDevice'</code>   |
| **`wisePad3s`**        | <code>'wisePad3s'</code>        |
| **`appleBuiltIn`**     | <code>'appleBuiltIn'</code>     |
| **`chipper1X`**        | <code>'chipper1X'</code>        |
| **`chipper2X`**        | <code>'chipper2X'</code>        |
| **`etna`**             | <code>'etna'</code>             |
| **`stripeM2`**         | <code>'stripeM2'</code>         |
| **`stripeS700`**       | <code>'stripeS700'</code>       |
| **`stripeS700DevKit`** | <code>'stripeS700Devkit'</code> |
| **`wiseCube`**         | <code>'wiseCube'</code>         |
| **`wisePad3`**         | <code>'wisePad3'</code>         |
| **`wisePosE`**         | <code>'wisePosE'</code>         |
| **`wisePosEDevKit`**   | <code>'wisePosEDevkit'</code>   |
| **`unknown`**          | <code>'unknown'</code>          |


#### TerminalConnectTypes

| Members         | Value                     |
| --------------- | ------------------------- |
| **`Simulated`** | <code>'simulated'</code>  |
| **`Internet`**  | <code>'internet'</code>   |
| **`Bluetooth`** | <code>'bluetooth'</code>  |
| **`Usb`**       | <code>'usb'</code>        |
| **`TapToPay`**  | <code>'tap-to-pay'</code> |
| **`HandOff`**   | <code>'hand-off'</code>   |


#### SimulateReaderUpdate

| Members                        | Value                                      |
| ------------------------------ | ------------------------------------------ |
| **`UpdateAvailable`**          | <code>'UPDATE_AVAILABLE'</code>            |
| **`None`**                     | <code>'NONE'</code>                        |
| **`Required`**                 | <code>'REQUIRED'</code>                    |
| **`Random`**                   | <code>'RANDOM'</code>                      |
| **`LowBattery`**               | <code>'LOW_BATTERY'</code>                 |
| **`LowBatterySucceedConnect`** | <code>'LOW_BATTERY_SUCCEED_CONNECT'</code> |


#### SimulatedCardType

| Members                               | Value                                             |
| ------------------------------------- | ------------------------------------------------- |
| **`Visa`**                            | <code>'VISA'</code>                               |
| **`VisaDebit`**                       | <code>'VISA_DEBIT'</code>                         |
| **`Mastercard`**                      | <code>'MASTERCARD'</code>                         |
| **`MastercardDebit`**                 | <code>'MASTERCARD_DEBIT'</code>                   |
| **`MastercardPrepaid`**               | <code>'MASTERCARD_PREPAID'</code>                 |
| **`Amex`**                            | <code>'AMEX'</code>                               |
| **`Amex2`**                           | <code>'AMEX_2'</code>                             |
| **`Discover`**                        | <code>'DISCOVER'</code>                           |
| **`Discover2`**                       | <code>'DISCOVER_2'</code>                         |
| **`DinersClub`**                      | <code>'DINERS'</code>                             |
| **`DinersClulb14Digits`**             | <code>'DINERS_14_DIGITS'</code>                   |
| **`JCB`**                             | <code>'JCB'</code>                                |
| **`UnionPay`**                        | <code>'UNION_PAY'</code>                          |
| **`Interac`**                         | <code>'INTERAC'</code>                            |
| **`EftposAustraliaDebit`**            | <code>'EFTPOS_AU_DEBIT'</code>                    |
| **`VisaUsCommonDebit`**               | <code>'VISA_US_COMMON_DEBIT'</code>               |
| **`ChargeDeclined`**                  | <code>'CHARGE_DECLINED'</code>                    |
| **`ChargeDeclinedInsufficientFunds`** | <code>'CHARGE_DECLINED_INSUFFICIENT_FUNDS'</code> |
| **`ChargeDeclinedLostCard`**          | <code>'CHARGE_DECLINED_LOST_CARD'</code>          |
| **`ChargeDeclinedStolenCard`**        | <code>'CHARGE_DECLINED_STOLEN_CARD'</code>        |
| **`ChargeDeclinedExpiredCard`**       | <code>'CHARGE_DECLINED_EXPIRED_CARD'</code>       |
| **`ChargeDeclinedProcessingError`**   | <code>'CHARGE_DECLINED_PROCESSING_ERROR'</code>   |
| **`EftposAustraliaVisaDebit`**        | <code>'EFTPOS_AU_VISA_DEBIT'</code>               |
| **`EftposAustraliaMastercardDebit`**  | <code>'EFTPOS_AU_DEBIT_MASTERCARD'</code>         |
| **`OfflinePinCVM`**                   | <code>'OFFLINE_PIN_CVM'</code>                    |
| **`OfflinePinSCARetry`**              | <code>'OFFLINE_PIN_SCA_RETRY'</code>              |
| **`OnlinePinCVM`**                    | <code>'ONLINE_PIN_CVM'</code>                     |
| **`OnlinePinSCARetry`**               | <code>'ONLINE_PIN_SCA_RETRY'</code>               |


#### TapToPayDarkMode

| Members      | Value                 |
| ------------ | --------------------- |
| **`System`** | <code>'SYSTEM'</code> |
| **`Dark`**   | <code>'DARK'</code>   |
| **`Light`**  | <code>'LIGHT'</code>  |


#### TerminalEventsEnum

| Members                            | Value                                               |
| ---------------------------------- | --------------------------------------------------- |
| **`Loaded`**                       | <code>'terminalLoaded'</code>                       |
| **`DiscoveredReaders`**            | <code>'terminalDiscoveredReaders'</code>            |
| **`DiscoveringReaders`**           | <code>'terminalDiscoveringReaders'</code>           |
| **`CancelDiscoveredReaders`**      | <code>'terminalCancelDiscoveredReaders'</code>      |
| **`ConnectedReader`**              | <code>'terminalConnectedReader'</code>              |
| **`DisconnectedReader`**           | <code>'terminalDisconnectedReader'</code>           |
| **`ConnectionStatusChange`**       | <code>'terminalConnectionStatusChange'</code>       |
| **`UnexpectedReaderDisconnect`**   | <code>'terminalUnexpectedReaderDisconnect'</code>   |
| **`ConfirmedPaymentIntent`**       | <code>'terminalConfirmedPaymentIntent'</code>       |
| **`CollectedPaymentIntent`**       | <code>'terminalCollectedPaymentIntent'</code>       |
| **`Canceled`**                     | <code>'terminalCanceled'</code>                     |
| **`Failed`**                       | <code>'terminalFailed'</code>                       |
| **`RequestedConnectionToken`**     | <code>'terminalRequestedConnectionToken'</code>     |
| **`ReportAvailableUpdate`**        | <code>'terminalReportAvailableUpdate'</code>        |
| **`StartInstallingUpdate`**        | <code>'terminalStartInstallingUpdate'</code>        |
| **`ReaderSoftwareUpdateProgress`** | <code>'terminalReaderSoftwareUpdateProgress'</code> |
| **`FinishInstallingUpdate`**       | <code>'terminalFinishInstallingUpdate'</code>       |
| **`BatteryLevel`**                 | <code>'terminalBatteryLevel'</code>                 |
| **`ReaderEvent`**                  | <code>'terminalReaderEvent'</code>                  |
| **`RequestDisplayMessage`**        | <code>'terminalRequestDisplayMessage'</code>        |
| **`RequestReaderInput`**           | <code>'terminalRequestReaderInput'</code>           |
| **`PaymentStatusChange`**          | <code>'terminalPaymentStatusChange'</code>          |
| **`ReaderReconnectStarted`**       | <code>'terminalReaderReconnectStarted'</code>       |
| **`ReaderReconnectSucceeded`**     | <code>'terminalReaderReconnectSucceeded'</code>     |
| **`ReaderReconnectFailed`**        | <code>'terminalReaderReconnectFailed'</code>        |


#### DisconnectReason

| Members                    | Value                                 |
| -------------------------- | ------------------------------------- |
| **`Unknown`**              | <code>'UNKNOWN'</code>                |
| **`DisconnectRequested`**  | <code>'DISCONNECT_REQUESTED'</code>   |
| **`RebootRequested`**      | <code>'REBOOT_REQUESTED'</code>       |
| **`SecurityReboot`**       | <code>'SECURITY_REBOOT'</code>        |
| **`CriticallyLowBattery`** | <code>'CRITICALLY_LOW_BATTERY'</code> |
| **`PoweredOff`**           | <code>'POWERED_OFF'</code>            |
| **`BluetoothDisabled`**    | <code>'BLUETOOTH_DISABLED'</code>     |


#### ConnectionStatus

| Members            | Value                        |
| ------------------ | ---------------------------- |
| **`Unknown`**      | <code>'UNKNOWN'</code>       |
| **`NotConnected`** | <code>'NOT_CONNECTED'</code> |
| **`Connecting`**   | <code>'CONNECTING'</code>    |
| **`Connected`**    | <code>'CONNECTED'</code>     |


#### ReaderEvent

| Members            | Value                        |
| ------------------ | ---------------------------- |
| **`Unknown`**      | <code>'UNKNOWN'</code>       |
| **`CardInserted`** | <code>'CARD_INSERTED'</code> |
| **`CardRemoved`**  | <code>'CARD_REMOVED'</code>  |


#### ReaderDisplayMessage

| Members                                | Value                                              |
| -------------------------------------- | -------------------------------------------------- |
| **`CheckMobileDevice`**                | <code>'CHECK_MOBILE_DEVICE'</code>                 |
| **`RetryCard`**                        | <code>'RETRY_CARD'</code>                          |
| **`InsertCard`**                       | <code>'INSERT_CARD'</code>                         |
| **`InsertOrSwipeCard`**                | <code>'INSERT_OR_SWIPE_CARD'</code>                |
| **`SwipeCard`**                        | <code>'SWIPE_CARD'</code>                          |
| **`RemoveCard`**                       | <code>'REMOVE_CARD'</code>                         |
| **`MultipleContactlessCardsDetected`** | <code>'MULTIPLE_CONTACTLESS_CARDS_DETECTED'</code> |
| **`TryAnotherReadMethod`**             | <code>'TRY_ANOTHER_READ_METHOD'</code>             |
| **`TryAnotherCard`**                   | <code>'TRY_ANOTHER_CARD'</code>                    |
| **`CardRemovedTooEarly`**              | <code>'CARD_REMOVED_TOO_EARLY'</code>              |


#### ReaderInputOption

| Members           | Value                       |
| ----------------- | --------------------------- |
| **`None`**        | <code>'NONE'</code>         |
| **`Insert`**      | <code>'INSERT'</code>       |
| **`Swipe`**       | <code>'SWIPE'</code>        |
| **`Tap`**         | <code>'TAP'</code>          |
| **`ManualEntry`** | <code>'MANUAL_ENTRY'</code> |


#### PaymentStatus

| Members               | Value                            |
| --------------------- | -------------------------------- |
| **`Unknown`**         | <code>'UNKNOWN'</code>           |
| **`NotReady`**        | <code>'NOT_READY'</code>         |
| **`Ready`**           | <code>'READY'</code>             |
| **`WaitingForInput`** | <code>'WAITING_FOR_INPUT'</code> |
| **`Processing`**      | <code>'PROCESSING'</code>        |

</docgen-api>
