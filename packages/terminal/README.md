# @capacitor-community/stripe-terminal

Stripe SDK bindings for Capacitor Applications. __This plugin is still in the RC (release candidate) phase.__
We have confirmed that it works well in the demo project. Please refer to https://github.com/capacitor-community/stripe/tree/main/demo/angular for the implementation.

## Install

```bash
npm install @capacitor-community/stripe-terminal
npx cap sync
```

### Web

No additional steps are necessary.

__Note: Stripe Web SDK is beta version. So this plugin's implement is experimental. Please refer to https://github.com/stripe/terminal-js for more information.__

### iOS

Stripe Terminal require development target 14.0 or later. Change Podfile( `ios/App/Podfile` ) like below:

```diff
  require_relative '../../node_modules/@capacitor/ios/scripts/pods_helpers'

- platform :ios, '13.0'
+ platform :ios, '14.0'
```

Follow Stripe's documentation for other configuration items.

- [Stripe - iOS Configure your app](https://stripe.com/docs/terminal/payments/setup-integration?terminal-sdk-platform=ios#configure)

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

If used in conjunction with the `@capacitor-community/stripe` plugin, the following settings may be necessary

Add packagingOptions to your `android/app/build.gradle` file:

```diff
android {
...
+  packagingOptions {
+    resources.excludes.add("org/bouncycastle/x509/*")
+  }
}
```

And update minSdkVersion to 26 And compileSdkVersion to 34 in your `android/app/build.gradle` file:

```diff
  ext {
-    minSdkVersion = 23
+    minSdkVersion = 30
```

If you are developing apps for Stripe Android devices (e.g. Stripe Reader S700), follow the Stripe's documentation for the client-side setup.
- [Stripe - Android configure your app](https://docs.stripe.com/terminal/features/apps-on-devices/build?terminal-sdk-platform=android&lang-android=java#setup-app)


## Usage

### Simple collect payment

#### Use plugin client

```typescript
(async ()=> {
  /**
   * tokenProviderEndpoint: The URL of your backend to provide a token. Use Post request to get a token.
   */
  await StripeTerminal.initialize({ tokenProviderEndpoint: 'https://example.com/token', isTest: true })
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
});
```

#### set string token

```typescript
(async ()=> {
  // run before StripeTerminal.initialize
  StripeTerminal.addListener(TerminalEventsEnum.RequestedConnectionToken, async () => {
    const { token } = (await fetch("https://example.com/token")).json();
    StripeTerminal.setConnectionToken({ token });
  });
});
(async ()=> {
  await StripeTerminal.initialize({ isTest: true })
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
});
````

### Listen device update

The device will **if necessary** automatically start updating itself. It is important to handle them as needed so as not to disrupt business operations.

```ts
(async ()=> {
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
});
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
initialize(options: { tokenProviderEndpoint?: string; isTest: boolean; }) => Promise<void>
```

| Param         | Type                                                              |
| ------------- | ----------------------------------------------------------------- |
| **`options`** | <code>{ tokenProviderEndpoint?: string; isTest: boolean; }</code> |

--------------------


### discoverReaders(...)

```typescript
discoverReaders(options: DiscoverReadersOptions) => Promise<{ readers: ReaderInterface[]; }>
```

| Param         | Type                                                                      |
| ------------- | ------------------------------------------------------------------------- |
| **`options`** | <code><a href="#discoverreadersoptions">DiscoverReadersOptions</a></code> |

**Returns:** <code>Promise&lt;{ readers: ReaderInterface[]; }&gt;</code>

--------------------


### setConnectionToken(...)

```typescript
setConnectionToken(options: { token: string; }) => Promise<void>
```

| Param         | Type                            |
| ------------- | ------------------------------- |
| **`options`** | <code>{ token: string; }</code> |

--------------------


### setSimulatorConfiguration(...)

```typescript
setSimulatorConfiguration(options: { update?: SimulateReaderUpdate; simulatedCard?: SimulatedCardType; simulatedTipAmount?: number; }) => Promise<void>
```

[*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.models/-simulator-configuration/index.html)

| Param         | Type                                                                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`options`** | <code>{ update?: <a href="#simulatereaderupdate">SimulateReaderUpdate</a>; simulatedCard?: <a href="#simulatedcardtype">SimulatedCardType</a>; simulatedTipAmount?: number; }</code> |

--------------------


### connectReader(...)

```typescript
connectReader(options: { reader: ReaderInterface; autoReconnectOnUnexpectedDisconnect?: boolean; merchantDisplayName?: string; onBehalfOf?: string; }) => Promise<void>
```

| Param         | Type                                                                                                                                                                       |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`options`** | <code>{ reader: <a href="#readerinterface">ReaderInterface</a>; autoReconnectOnUnexpectedDisconnect?: boolean; merchantDisplayName?: string; onBehalfOf?: string; }</code> |

--------------------


### getConnectedReader()

```typescript
getConnectedReader() => Promise<{ reader: ReaderInterface | null; }>
```

**Returns:** <code>Promise&lt;{ reader: <a href="#readerinterface">ReaderInterface</a> | null; }&gt;</code>

--------------------


### disconnectReader()

```typescript
disconnectReader() => Promise<void>
```

--------------------


### cancelDiscoverReaders()

```typescript
cancelDiscoverReaders() => Promise<void>
```

--------------------


### collectPaymentMethod(...)

```typescript
collectPaymentMethod(options: { paymentIntent: string; }) => Promise<void>
```

| Param         | Type                                    |
| ------------- | --------------------------------------- |
| **`options`** | <code>{ paymentIntent: string; }</code> |

--------------------


### cancelCollectPaymentMethod()

```typescript
cancelCollectPaymentMethod() => Promise<void>
```

--------------------


### confirmPaymentIntent()

```typescript
confirmPaymentIntent() => Promise<void>
```

--------------------


### installAvailableUpdate()

```typescript
installAvailableUpdate() => Promise<void>
```

--------------------


### cancelInstallUpdate()

```typescript
cancelInstallUpdate() => Promise<void>
```

--------------------


### setReaderDisplay(...)

```typescript
setReaderDisplay(options: Cart) => Promise<void>
```

| Param         | Type                                  |
| ------------- | ------------------------------------- |
| **`options`** | <code><a href="#cart">Cart</a></code> |

--------------------


### clearReaderDisplay()

```typescript
clearReaderDisplay() => Promise<void>
```

--------------------


### rebootReader()

```typescript
rebootReader() => Promise<void>
```

--------------------


### cancelReaderReconnection()

```typescript
cancelReaderReconnection() => Promise<void>
```

--------------------


### addListener(TerminalEventsEnum.Loaded, ...)

```typescript
addListener(eventName: TerminalEventsEnum.Loaded, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                     |
| ------------------ | ------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.Loaded</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                               |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(TerminalEventsEnum.RequestedConnectionToken, ...)

```typescript
addListener(eventName: TerminalEventsEnum.RequestedConnectionToken, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.RequestedConnectionToken</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                                 |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(TerminalEventsEnum.DiscoveredReaders, ...)

```typescript
addListener(eventName: TerminalEventsEnum.DiscoveredReaders, listenerFunc: ({ readers }: { readers: ReaderInterface[]; }) => void) => Promise<PluginListenerHandle>
```

When searching for iOS Bluetooth, this will be executed multiple times.
https://docs.stripe.com/terminal/payments/connect-reader?terminal-sdk-platform=ios&reader-type=bluetooth

| Param              | Type                                                                                |
| ------------------ | ----------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.DiscoveredReaders</a></code> |
| **`listenerFunc`** | <code>({ readers }: { readers: ReaderInterface[]; }) =&gt; void</code>              |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(TerminalEventsEnum.ConnectedReader, ...)

```typescript
addListener(eventName: TerminalEventsEnum.ConnectedReader, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                              |
| ------------------ | --------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.ConnectedReader</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                        |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

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

--------------------


### addListener(TerminalEventsEnum.ConfirmedPaymentIntent, ...)

```typescript
addListener(eventName: TerminalEventsEnum.ConfirmedPaymentIntent, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.ConfirmedPaymentIntent</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                               |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(TerminalEventsEnum.CollectedPaymentIntent, ...)

```typescript
addListener(eventName: TerminalEventsEnum.CollectedPaymentIntent, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.CollectedPaymentIntent</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                               |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

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

Your app should show UI to the user indiciating that a software update is being installed
to explain why connecting is taking longer than usual.

[*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-reader-listener/on-start-installing-update.html)

| Param              | Type                                                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.StartInstallingUpdate</a></code>                                       |
| **`listenerFunc`** | <code>({ update }: { update: <a href="#readersoftwareupdateinterface">ReaderSoftwareUpdateInterface</a>; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

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

--------------------


### addListener(TerminalEventsEnum.FinishInstallingUpdate, ...)

```typescript
addListener(eventName: TerminalEventsEnum.FinishInstallingUpdate, listenerFunc: (args: { update: ReaderSoftwareUpdateInterface; } | { error: string; }) => void) => Promise<PluginListenerHandle>
```

**Only applicable to Bluetooth and USB readers.**

[*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-reader-listener/on-finish-installing-update.html)

| Param              | Type                                                                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.FinishInstallingUpdate</a></code>                                                      |
| **`listenerFunc`** | <code>(args: { update: <a href="#readersoftwareupdateinterface">ReaderSoftwareUpdateInterface</a>; } \| { error: string; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

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

--------------------


### addListener(TerminalEventsEnum.PaymentStatusChange, ...)

```typescript
addListener(eventName: TerminalEventsEnum.PaymentStatusChange, listenerFunc: ({ status }: { status: PaymentStatus; }) => void) => Promise<PluginListenerHandle>
```

[*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-terminal-listener/on-payment-status-change.html)

| Param              | Type                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.PaymentStatusChange</a></code>         |
| **`listenerFunc`** | <code>({ status }: { status: <a href="#paymentstatus">PaymentStatus</a>; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(TerminalEventsEnum.ReaderReconnectStarted, ...)

```typescript
addListener(eventName: TerminalEventsEnum.ReaderReconnectStarted, listenerFunc: ({ reader, reason }: { reader: ReaderInterface; reason: string; }) => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.ReaderReconnectStarted</a></code>                                  |
| **`listenerFunc`** | <code>({ reader, reason }: { reader: <a href="#readerinterface">ReaderInterface</a>; reason: string; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(TerminalEventsEnum.ReaderReconnectSucceeded, ...)

```typescript
addListener(eventName: TerminalEventsEnum.ReaderReconnectSucceeded, listenerFunc: ({ reader }: { reader: ReaderInterface; }) => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.ReaderReconnectSucceeded</a></code>        |
| **`listenerFunc`** | <code>({ reader }: { reader: <a href="#readerinterface">ReaderInterface</a>; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(TerminalEventsEnum.ReaderReconnectFailed, ...)

```typescript
addListener(eventName: TerminalEventsEnum.ReaderReconnectFailed, listenerFunc: ({ reader }: { reader: ReaderInterface; }) => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.ReaderReconnectFailed</a></code>           |
| **`listenerFunc`** | <code>({ reader }: { reader: <a href="#readerinterface">ReaderInterface</a>; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### Interfaces


#### DiscoverReadersOptions

| Prop                        | Type                                                                  | Description                                                                                                                                                                                                                                                                                                                                           |
| --------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`type`**                  | <code><a href="#terminalconnecttypes">TerminalConnectTypes</a></code> |                                                                                                                                                                                                                                                                                                                                                       |
| **`locationId`**            | <code>string</code>                                                   |                                                                                                                                                                                                                                                                                                                                                       |
| **`bluetoothScanWaitTime`** | <code>number</code>                                                   | Only applies to Bluetooth scan discovery (iOS only). During discovery, readers are reported via DiscoveryDelegate.didUpdateDiscoveredReaders. This timeout controls how long to wait before resolving the `discoverReaders` method with the current list. If this setting is not specified or is set to 0, the initial scan results will be returned. |


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


### Type Aliases


#### ReaderInterface

<code>{ /** * The unique serial number is primary identifier inner plugin. */ serialNumber: string; label: string; batteryLevel: number; batteryStatus: <a href="#batterystatus">BatteryStatus</a>; simulated: boolean; id: number; availableUpdate: <a href="#readersoftwareupdateinterface">ReaderSoftwareUpdateInterface</a>; locationId: string; ipAddress: string; status: <a href="#networkstatus">NetworkStatus</a>; location: <a href="#locationinterface">LocationInterface</a>; locationStatus: <a href="#locationstatus">LocationStatus</a>; deviceType: <a href="#devicetype">DeviceType</a>; deviceSoftwareVersion: string | null; /** * iOS Only properties. These properties are not available on Android. */ isCharging: number; /** * Android Only properties. These properties are not available on iOS. */ baseUrl: string; bootloaderVersion: string; configVersion: string; emvKeyProfileId: string; firmwareVersion: string; hardwareVersion: string; macKeyProfileId: string; pinKeyProfileId: string; trackKeyProfileId: string; settingsVersion: string; pinKeysetId: string; }</code>


#### ReaderSoftwareUpdateInterface

<code>{ deviceSoftwareVersion: string; estimatedUpdateTime: <a href="#updatetimeestimate">UpdateTimeEstimate</a>; requiredAt: number; }</code>


#### LocationInterface

<code>{ id: string; displayName: string; address: { city: string; country: string; postalCode: string; line1: string; line2: string; state: string; }; ipAddress: string; }</code>


#### DeviceType

<code>Stripe.Terminal.Reader.<a href="#devicetype">DeviceType</a></code>


#### Cart

<code>{ currency: string; tax: number; total: number; lineItems: CartLineItem[]; }</code>


#### CartLineItem

<code>{ displayName: string; quantity: number; amount: number; }</code>


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
| **`verifoneP400`**     | <code>'verifoneP400'</code>     |
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
