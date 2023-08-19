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
connect(options: { type: typeof TerminalConnectType; locationId?: number; }) => Promise<void>
```

| Param         | Type                                                                    |
| ------------- | ----------------------------------------------------------------------- |
| **`options`** | <code>{ type: typeof TerminalConnectType; locationId?: number; }</code> |

--------------------


### collect(...)

```typescript
collect(options: { paymentIntent: string; }) => Promise<void>
```

| Param         | Type                                    |
| ------------- | --------------------------------------- |
| **`options`** | <code>{ paymentIntent: string; }</code> |

--------------------

</docgen-api>
