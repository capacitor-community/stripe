# @capacitor-community/stripe-terminal

Stripe SDK bindings for Capacitor Applications. __This plugin is still in beta.__
We have confirmed that it works well in the demo project. Please refer to https://github.com/capacitor-community/stripe/tree/main/demo/angular for the implementation.

- [x] Tap To Pay
- [x] Internet
- [x] Bluetooth
- [x] USB

## Install

```bash
npm install @capacitor-community/stripe-terminal
npx cap sync
```

### iOS

- [iOS Configure your app](https://stripe.com/docs/terminal/payments/setup-integration?terminal-sdk-platform=ios#configure)

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
-    minSdkVersion = 22
-    compileSdkVersion = 33
+    minSdkVersion = 30
+    compileSdkVersion = 34
```

## Usage

### use native http client for getting a token

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

### set string token

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
* [`addListener(TerminalEventsEnum.Loaded, ...)`](#addlistenerterminaleventsenumloaded)
* [`addListener(TerminalEventsEnum.RequestedConnectionToken, ...)`](#addlistenerterminaleventsenumrequestedconnectiontoken)
* [`addListener(TerminalEventsEnum.DiscoveredReaders, ...)`](#addlistenerterminaleventsenumdiscoveredreaders)
* [`addListener(TerminalEventsEnum.ConnectedReader, ...)`](#addlistenerterminaleventsenumconnectedreader)
* [`addListener(TerminalEventsEnum.DisconnectedReader, ...)`](#addlistenerterminaleventsenumdisconnectedreader)
* [`addListener(TerminalEventsEnum.ConfirmedPaymentIntent, ...)`](#addlistenerterminaleventsenumconfirmedpaymentintent)
* [`addListener(TerminalEventsEnum.CollectedPaymentIntent, ...)`](#addlistenerterminaleventsenumcollectedpaymentintent)
* [`addListener(TerminalEventsEnum.Canceled, ...)`](#addlistenerterminaleventsenumcanceled)
* [`addListener(TerminalEventsEnum.Failed, ...)`](#addlistenerterminaleventsenumfailed)
* [`addListener(TerminalEventsEnum.StartInstallingUpdate, ...)`](#addlistenerterminaleventsenumstartinstallingupdate)
* [`addListener(TerminalEventsEnum.ReaderSoftwareUpdateProgress, ...)`](#addlistenerterminaleventsenumreadersoftwareupdateprogress)
* [`addListener(TerminalEventsEnum.FinishInstallingUpdate, ...)`](#addlistenerterminaleventsenumfinishinstallingupdate)
* [`addListener(TerminalEventsEnum.BatteryLevel, ...)`](#addlistenerterminaleventsenumbatterylevel)
* [`addListener(TerminalEventsEnum.ReaderEvent, ...)`](#addlistenerterminaleventsenumreaderevent)
* [`addListener(TerminalEventsEnum.RequestDisplayMessage, ...)`](#addlistenerterminaleventsenumrequestdisplaymessage)
* [`addListener(TerminalEventsEnum.RequestReaderInput, ...)`](#addlistenerterminaleventsenumrequestreaderinput)
* [`addListener(TerminalEventsEnum.PaymentStatusChange, ...)`](#addlistenerterminaleventsenumpaymentstatuschange)
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
discoverReaders(options: { type: TerminalConnectTypes; locationId?: string; }) => Promise<{ readers: ReaderInterface[]; }>
```

| Param         | Type                                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| **`options`** | <code>{ type: <a href="#terminalconnecttypes">TerminalConnectTypes</a>; locationId?: string; }</code> |

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

| Param         | Type                                                                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`options`** | <code>{ update?: <a href="#simulatereaderupdate">SimulateReaderUpdate</a>; simulatedCard?: <a href="#simulatedcardtype">SimulatedCardType</a>; simulatedTipAmount?: number; }</code> |

--------------------


### connectReader(...)

```typescript
connectReader(options: { reader: ReaderInterface; }) => Promise<void>
```

| Param         | Type                                                                     |
| ------------- | ------------------------------------------------------------------------ |
| **`options`** | <code>{ reader: <a href="#readerinterface">ReaderInterface</a>; }</code> |

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

**Note:** For Bluetooth and USB readers, when you call [`disconnectReader()`](#disconnectreader), this event will
be emitted twice: one without a `reason` in acknowledgement of your call, and again with a `reason` when the reader
finishes disconnecting.

| Param              | Type                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.DisconnectedReader</a></code>                 |
| **`listenerFunc`** | <code>({ reason }: { reason?: <a href="#disconnectreason">DisconnectReason</a>; }) =&gt; void</code> |

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

| Param              | Type                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.Canceled</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                 |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(TerminalEventsEnum.Failed, ...)

```typescript
addListener(eventName: TerminalEventsEnum.Failed, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                     |
| ------------------ | ------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.Failed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                               |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(TerminalEventsEnum.StartInstallingUpdate, ...)

```typescript
addListener(eventName: TerminalEventsEnum.StartInstallingUpdate, listenerFunc: ({ update }: { update: ReaderSoftwareUpdateInterface; }) => void) => Promise<PluginListenerHandle>
```

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

| Param              | Type                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.ReaderSoftwareUpdateProgress</a></code> |
| **`listenerFunc`** | <code>({ progress }: { progress: number; }) =&gt; void</code>                                  |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(TerminalEventsEnum.FinishInstallingUpdate, ...)

```typescript
addListener(eventName: TerminalEventsEnum.FinishInstallingUpdate, listenerFunc: ({ update, errorCode, errorMessage }: { update: ReaderSoftwareUpdateInterface | null; errorCode: string | null; errorMessage: string | null; }) => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                                                                                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.FinishInstallingUpdate</a></code>                                                                                                                                |
| **`listenerFunc`** | <code>({ update, errorCode, errorMessage }: { update: <a href="#readersoftwareupdateinterface">ReaderSoftwareUpdateInterface</a> \| null; errorCode: string \| null; errorMessage: string \| null; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(TerminalEventsEnum.BatteryLevel, ...)

```typescript
addListener(eventName: TerminalEventsEnum.BatteryLevel, listenerFunc: ({ level, charging, status }: { level: number; charging: boolean; status: BatteryStatus; }) => void) => Promise<PluginListenerHandle>
```

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

| Param              | Type                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.PaymentStatusChange</a></code>         |
| **`listenerFunc`** | <code>({ status }: { status: <a href="#paymentstatus">PaymentStatus</a>; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### Interfaces


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


### Type Aliases


#### ReaderInterface

<code>{ index: number; serialNumber: string; }</code>


#### ReaderSoftwareUpdateInterface

<code>{ version: string; settingsVersion: string; requiredAt: number; timeEstimate: <a href="#updatetimeestimate">UpdateTimeEstimate</a>; }</code>


### Enums


#### TerminalConnectTypes

| Members         | Value                     |
| --------------- | ------------------------- |
| **`Simulated`** | <code>'simulated'</code>  |
| **`Internet`**  | <code>'internet'</code>   |
| **`Bluetooth`** | <code>'bluetooth'</code>  |
| **`Usb`**       | <code>'usb'</code>        |
| **`TapToPay`**  | <code>'tap-to-pay'</code> |


#### SimulateReaderUpdate

| Members               | Value                           |
| --------------------- | ------------------------------- |
| **`UpdateAvailable`** | <code>'UPDATE_AVAILABLE'</code> |
| **`None`**            | <code>'NONE'</code>             |
| **`Required`**        | <code>'REQUIRED'</code>         |
| **`Random`**          | <code>'RANDOM'</code>           |


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
| **`CancelDiscoveredReaders`**      | <code>'terminalCancelDiscoveredReaders'</code>      |
| **`ConnectedReader`**              | <code>'terminalConnectedReader'</code>              |
| **`DisconnectedReader`**           | <code>'terminalDisconnectedReader'</code>           |
| **`ConfirmedPaymentIntent`**       | <code>'terminalConfirmedPaymentIntent'</code>       |
| **`CollectedPaymentIntent`**       | <code>'terminalCollectedPaymentIntent'</code>       |
| **`Canceled`**                     | <code>'terminalCanceled'</code>                     |
| **`Failed`**                       | <code>'terminalFailed'</code>                       |
| **`RequestedConnectionToken`**     | <code>'terminalRequestedConnectionToken'</code>     |
| **`StartInstallingUpdate`**        | <code>'terminalStartInstallingUpdate'</code>        |
| **`ReaderSoftwareUpdateProgress`** | <code>'terminalReaderSoftwareUpdateProgress'</code> |
| **`FinishInstallingUpdate`**       | <code>'terminalFinishInstallingUpdate'</code>       |
| **`BatteryLevel`**                 | <code>'terminalBatteryLevel'</code>                 |
| **`ReaderEvent`**                  | <code>'terminalReaderEvent'</code>                  |
| **`RequestDisplayMessage`**        | <code>'terminalRequestDisplayMessage'</code>        |
| **`RequestReaderInput`**           | <code>'terminalRequestReaderInput'</code>           |
| **`PaymentStatusChange`**          | <code>'terminalPaymentStatusChange'</code>          |


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


#### UpdateTimeEstimate

| Members                    | Value                                  |
| -------------------------- | -------------------------------------- |
| **`LessThanOneMinute`**    | <code>'LESS_THAN_ONE_MINUTE'</code>    |
| **`OneToTwoMinutes`**      | <code>'ONE_TO_TWO_MINUTES'</code>      |
| **`TwoToFiveMinutes`**     | <code>'TWO_TO_FIVE_MINUTES'</code>     |
| **`FiveToFifteenMinutes`** | <code>'FIVE_TO_FIFTEEN_MINUTES'</code> |


#### BatteryStatus

| Members        | Value                   |
| -------------- | ----------------------- |
| **`Unknown`**  | <code>'UNKNOWN'</code>  |
| **`Critical`** | <code>'CRITICAL'</code> |
| **`Low`**      | <code>'LOW'</code>      |
| **`Nominal`**  | <code>'NOMINAL'</code>  |


#### ReaderEvent

| Members            | Value                        |
| ------------------ | ---------------------------- |
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
| **`NotReady`**        | <code>'NOT_READY'</code>         |
| **`Ready`**           | <code>'READY'</code>             |
| **`WaitingForInput`** | <code>'WAITING_FOR_INPUT'</code> |
| **`Processing`**      | <code>'PROCESSING'</code>        |

</docgen-api>
