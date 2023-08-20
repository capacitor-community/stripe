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
* [`connect(...)`](#connect)
* [`collect(...)`](#collect)
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


### connect(...)

```typescript
connect(options: { type: TerminalConnectType; locationId?: string; }) => Promise<void>
```

| Param         | Type                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------- |
| **`options`** | <code>{ type: <a href="#terminalconnecttype">TerminalConnectType</a>; locationId?: string; }</code> |

--------------------


### collect(...)

```typescript
collect(options: { paymentIntent: string; }) => Promise<void>
```

| Param         | Type                                    |
| ------------- | --------------------------------------- |
| **`options`** | <code>{ paymentIntent: string; }</code> |

--------------------


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
