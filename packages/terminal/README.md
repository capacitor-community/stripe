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
connect(options: { type: 'simulated' | 'internet' | 'bluetooth' | 'usb' | 'tap-to-pay'; location?: { display_name: string; address: { line1: string; city: string; state: string; country: string; postal_code: string; }; }; }) => Promise<void>
```

| Param         | Type                                                                                                                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`options`** | <code>{ type: 'simulated' \| 'internet' \| 'bluetooth' \| 'usb' \| 'tap-to-pay'; location?: { display_name: string; address: { line1: string; city: string; state: string; country: string; postal_code: string; }; }; }</code> |

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
