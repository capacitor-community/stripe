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
connectReader(options: { readerIndex: number; }) => Promise<void>
```

| Param         | Type                                  |
| ------------- | ------------------------------------- |
| **`options`** | <code>{ readerIndex: number; }</code> |

--------------------


### collect(...)

```typescript
collect(options: { paymentIntent: string; }) => Promise<void>
```

| Param         | Type                                    |
| ------------- | --------------------------------------- |
| **`options`** | <code>{ paymentIntent: string; }</code> |

--------------------


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

</docgen-api>
