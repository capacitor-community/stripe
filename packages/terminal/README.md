# @capacitor-community/stripe-terminal

Stripe SDK bindings for Capacitor Applications

## Install

```bash
npm install @capacitor-community/stripe-terminal
npx cap sync
```

## API

<docgen-index>

* [`initialize(...)`](#initialize)
* [`discoverReaders(...)`](#discoverreaders)
* [`connectReader(...)`](#connectreader)
* [`collect(...)`](#collect)
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
initialize(options: { tokenProviderEndpoint: string; }) => Promise<void>
```

| Param         | Type                                            |
| ------------- | ----------------------------------------------- |
| **`options`** | <code>{ tokenProviderEndpoint: string; }</code> |

--------------------


### discoverReaders(...)

```typescript
discoverReaders(options: { type: TerminalConnectType; locationId?: string; }) => Promise<{ readers: ReaderInterface[]; }>
```

| Param         | Type                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------- |
| **`options`** | <code>{ type: <a href="#terminalconnecttype">TerminalConnectType</a>; locationId?: string; }</code> |

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


### collect(...)

```typescript
collect(options: { paymentIntent: string; }) => Promise<void>
```

| Param         | Type                                    |
| ------------- | --------------------------------------- |
| **`options`** | <code>{ paymentIntent: string; }</code> |

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


#### TerminalConnectType

| Members         | Value                     |
| --------------- | ------------------------- |
| **`Simulated`** | <code>'simulated'</code>  |
| **`Internet`**  | <code>'internet'</code>   |
| **`Bluetooth`** | <code>'bluetooth'</code>  |
| **`Usb`**       | <code>'usb'</code>        |
| **`TapToPay`**  | <code>'tap-to-pay'</code> |


#### TerminalEventsEnum

| Members                 | Value                                    |
| ----------------------- | ---------------------------------------- |
| **`Loaded`**            | <code>'terminalLoaded'</code>            |
| **`DiscoveredReaders`** | <code>'terminalDiscoveredReaders'</code> |
| **`ConnectedReader`**   | <code>'terminalConnectedReader'</code>   |
| **`Completed`**         | <code>'terminalCompleted'</code>         |
| **`Canceled`**          | <code>'terminalCanceled'</code>          |
| **`Failed`**            | <code>'terminalFailed'</code>            |

</docgen-api>
