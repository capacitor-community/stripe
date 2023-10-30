# @vendpark/stripe-terminal

Stripe SDK bindings for Capacitor Applications. **This plugin is still in beta.**
We have confirmed that it works well in the demo project. Please refer to https://github.com/vendpark/capacitor-stripe/tree/main/demo/angular for the implementation.

- [x] Tap To Pay
- [x] Internet
- [ ] Bluetooth
- [ ] USB

## Install

```bash
npm install @vendpark/stripe-terminal
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
+ <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
+ <uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
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
+    minSdkVersion = 26
+    compileSdkVersion = 34
```

## Usage

```typescript
async () => {
  /**
   * tokenProviderEndpoint: The URL of your backend to provide a token. Use Post request to get a token.
   */
  await StripeTerminal.initialize({
    tokenProviderEndpoint: 'https://example.com/token',
    isTest: true,
  });
  const { readers } = await StripeTerminal.discoverReaders({
    type: TerminalConnectTypes.TapToPay,
    locationId: '**************',
  });
  await StripeTerminal.connectReader({
    reader: readers[0],
  });
  await StripeTerminal.collect({ paymentIntent: '**************' });
};
```

## API

<docgen-index>

* [`initialize(...)`](#initialize)
* [`discoverReaders(...)`](#discoverreaders)
* [`connectReader(...)`](#connectreader)
* [`getConnectedReader()`](#getconnectedreader)
* [`disconnectReader()`](#disconnectreader)
* [`cancelDiscoverReaders()`](#canceldiscoverreaders)
* [`collect(...)`](#collect)
* [`cancelCollect()`](#cancelcollect)
* [`addListener(TerminalEventsEnum.Loaded, ...)`](#addlistenerterminaleventsenumloaded)
* [`addListener(TerminalEventsEnum.DiscoveredReaders, ...)`](#addlistenerterminaleventsenumdiscoveredreaders)
* [`addListener(TerminalEventsEnum.ConnectedReader, ...)`](#addlistenerterminaleventsenumconnectedreader)
* [`addListener(TerminalEventsEnum.Completed, ...)`](#addlistenerterminaleventsenumcompleted)
* [`addListener(TerminalEventsEnum.Canceled, ...)`](#addlistenerterminaleventsenumcanceled)
* [`addListener(TerminalEventsEnum.Failed, ...)`](#addlistenerterminaleventsenumfailed)
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)
* [Enums](#enums)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### initialize(...)

```typescript
initialize(options: { tokenProviderEndpoint: string; isTest: boolean; }) => Promise<void>
```

| Param         | Type                                                             |
| ------------- | ---------------------------------------------------------------- |
| **`options`** | <code>{ tokenProviderEndpoint: string; isTest: boolean; }</code> |

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


### collect(...)

```typescript
collect(options: { paymentIntent: string; }) => Promise<void>
```

| Param         | Type                                    |
| ------------- | --------------------------------------- |
| **`options`** | <code>{ paymentIntent: string; }</code> |

--------------------


### cancelCollect()

```typescript
cancelCollect() => Promise<void>
```

--------------------


### addListener(TerminalEventsEnum.Loaded, ...)

```typescript
addListener(eventName: TerminalEventsEnum.Loaded, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                     |
| ------------------ | ------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.Loaded</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                               |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(TerminalEventsEnum.DiscoveredReaders, ...)

```typescript
addListener(eventName: TerminalEventsEnum.DiscoveredReaders, listenerFunc: () => { reader: ReaderInterface; }) => PluginListenerHandle
```

| Param              | Type                                                                                |
| ------------------ | ----------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.DiscoveredReaders</a></code> |
| **`listenerFunc`** | <code>() =&gt; { reader: <a href="#readerinterface">ReaderInterface</a>; }</code>   |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(TerminalEventsEnum.ConnectedReader, ...)

```typescript
addListener(eventName: TerminalEventsEnum.ConnectedReader, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                              |
| ------------------ | --------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.ConnectedReader</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                        |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(TerminalEventsEnum.Completed, ...)

```typescript
addListener(eventName: TerminalEventsEnum.Completed, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                        |
| ------------------ | --------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.Completed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                  |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(TerminalEventsEnum.Canceled, ...)

```typescript
addListener(eventName: TerminalEventsEnum.Canceled, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.Canceled</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                 |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(TerminalEventsEnum.Failed, ...)

```typescript
addListener(eventName: TerminalEventsEnum.Failed, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                     |
| ------------------ | ------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#terminaleventsenum">TerminalEventsEnum.Failed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                               |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### Interfaces


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


### Type Aliases


#### ReaderInterface

<code>{ index: number; serialNumber: string; }</code>


### Enums


#### TerminalConnectTypes

| Members         | Value                     |
| --------------- | ------------------------- |
| **`Simulated`** | <code>'simulated'</code>  |
| **`Internet`**  | <code>'internet'</code>   |
| **`Bluetooth`** | <code>'bluetooth'</code>  |
| **`Usb`**       | <code>'usb'</code>        |
| **`TapToPay`**  | <code>'tap-to-pay'</code> |


#### TerminalEventsEnum

| Members                       | Value                                          |
| ----------------------------- | ---------------------------------------------- |
| **`Loaded`**                  | <code>'terminalLoaded'</code>                  |
| **`DiscoveredReaders`**       | <code>'terminalDiscoveredReaders'</code>       |
| **`CancelDiscoveredReaders`** | <code>'terminalCancelDiscoveredReaders'</code> |
| **`ConnectedReader`**         | <code>'terminalConnectedReader'</code>         |
| **`DisconnectedReader`**      | <code>'terminalDisconnectedReader'</code>      |
| **`Completed`**               | <code>'terminalCompleted'</code>               |
| **`Canceled`**                | <code>'terminalCanceled'</code>                |
| **`Failed`**                  | <code>'terminalFailed'</code>                  |

</docgen-api>
