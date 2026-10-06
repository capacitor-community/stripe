# @capacitor-community/stripe-billing

Experimental, optional Stripe BillingSDK integration for **iOS 15+ / Capacitor 8**. Supports subscription buy buttons, Customer Sessions, active entitlements, and the Customer Portal. It does not add BillingSDK to the Payment, Identity, or Terminal packages.

## Installation

```sh
npm install @capacitor-community/stripe-billing
npx cap sync ios
```

Use **Swift Package Manager**. The upstream SDK does not ship a CocoaPods specification; CocoaPods, Android, and web are not supported by this package. Guard calls with `Capacitor.getPlatform() === 'ios'`. Unsupported platforms reject calls as unimplemented.

The upstream [BillingSDK](https://github.com/stripe-samples/billing-ios-sdk) is experimental and requires access to Stripe's private preview APIs. Its dependency is pinned to revision `02416cf6bb57fa9ede1786ea8ac127ea05fa9b87` because upstream has no release tags. This API may change with the preview. See [integration and backend example](docs/integration.md).

## API

<docgen-index>

* [`initialize(...)`](#initialize)
* [`setCustomerSession(...)`](#setcustomersession)
* [`getBuyButton(...)`](#getbuybutton)
* [`presentBuyButton(...)`](#presentbuybutton)
* [`getActiveEntitlements(...)`](#getactiveentitlements)
* [`hasEntitlement(...)`](#hasentitlement)
* [`presentCustomerPortal(...)`](#presentcustomerportal)
* [`reset()`](#reset)
* [`addListener('customerSessionRequested', ...)`](#addlistenercustomersessionrequested-)
* [`addListener('entitlementsChanged', ...)`](#addlistenerentitlementschanged-)
* [`addListener('billingError', ...)`](#addlistenerbillingerror-)
* [`removeAllListeners()`](#removealllisteners)
* [Interfaces](#interfaces)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

Experimental, iOS 15+ and Swift Package Manager only. Android/web are unsupported.

### initialize(...)

```typescript
initialize(options: InitializeOptions) => Promise<void>
```

Register customerSessionRequested before initialization. Call reset before changing users.

| Param         | Type                                                            |
| ------------- | --------------------------------------------------------------- |
| **`options`** | <code><a href="#initializeoptions">InitializeOptions</a></code> |

--------------------


### setCustomerSession(...)

```typescript
setCustomerSession(options: CustomerSessionResponse) => Promise<void>
```

Complete one session request within 30 seconds. Stale/duplicate responses are rejected.

| Param         | Type                                                                        |
| ------------- | --------------------------------------------------------------------------- |
| **`options`** | <code><a href="#customersessionresponse">CustomerSessionResponse</a></code> |

--------------------


### getBuyButton(...)

```typescript
getBuyButton(options: { id: string; }) => Promise<BuyButton>
```

| Param         | Type                         |
| ------------- | ---------------------------- |
| **`options`** | <code>{ id: string; }</code> |

**Returns:** <code>Promise&lt;<a href="#buybutton">BuyButton</a>&gt;</code>

--------------------


### presentBuyButton(...)

```typescript
presentBuyButton(options: { id: string; }) => Promise<void>
```

Present the SDK's native buy button. Resolves on presentation, not payment completion.

| Param         | Type                         |
| ------------- | ---------------------------- |
| **`options`** | <code>{ id: string; }</code> |

--------------------


### getActiveEntitlements(...)

```typescript
getActiveEntitlements(options?: { forceRefresh?: boolean | undefined; } | undefined) => Promise<{ entitlements: Entitlement[]; }>
```

| Param         | Type                                     |
| ------------- | ---------------------------------------- |
| **`options`** | <code>{ forceRefresh?: boolean; }</code> |

**Returns:** <code>Promise&lt;{ entitlements: Entitlement[]; }&gt;</code>

--------------------


### hasEntitlement(...)

```typescript
hasEntitlement(options: { lookupKey: string; forceRefresh?: boolean; }) => Promise<{ active: boolean; }>
```

| Param         | Type                                                        |
| ------------- | ----------------------------------------------------------- |
| **`options`** | <code>{ lookupKey: string; forceRefresh?: boolean; }</code> |

**Returns:** <code>Promise&lt;{ active: boolean; }&gt;</code>

--------------------


### presentCustomerPortal(...)

```typescript
presentCustomerPortal(options?: { external?: boolean | undefined; } | undefined) => Promise<void>
```

Opens the portal in-app by default. Resolves on presentation/launch, not subscription change.

| Param         | Type                                 |
| ------------- | ------------------------------------ |
| **`options`** | <code>{ external?: boolean; }</code> |

--------------------


### reset()

```typescript
reset() => Promise<void>
```

Cancel pending work, dismiss plugin UI, clear session/caches. initialize again before reuse.

--------------------


### addListener('customerSessionRequested', ...)

```typescript
addListener(eventName: 'customerSessionRequested', listenerFunc: (event: { requestId: string; }) => void) => Promise<PluginListenerHandle>
```

Fetch a new Customer Session from your backend for each request; never cache its secret.

| Param              | Type                                                    |
| ------------------ | ------------------------------------------------------- |
| **`eventName`**    | <code>'customerSessionRequested'</code>                 |
| **`listenerFunc`** | <code>(event: { requestId: string; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener('entitlementsChanged', ...)

```typescript
addListener(eventName: 'entitlementsChanged', listenerFunc: (event: { entitlements: Entitlement[]; }) => void) => Promise<PluginListenerHandle>
```

SDK refresh notifications; not a server push subscription.

| Param              | Type                                                              |
| ------------------ | ----------------------------------------------------------------- |
| **`eventName`**    | <code>'entitlementsChanged'</code>                                |
| **`listenerFunc`** | <code>(event: { entitlements: Entitlement[]; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener('billingError', ...)

```typescript
addListener(eventName: 'billingError', listenerFunc: (event: { message: string; }) => void) => Promise<PluginListenerHandle>
```

Errors from tapping the presented native buy button.

| Param              | Type                                                  |
| ------------------ | ----------------------------------------------------- |
| **`eventName`**    | <code>'billingError'</code>                           |
| **`listenerFunc`** | <code>(event: { message: string; }) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### removeAllListeners()

```typescript
removeAllListeners() => Promise<void>
```

--------------------


### Interfaces


#### InitializeOptions

| Prop                                   | Type                | Description                                                          |
| -------------------------------------- | ------------------- | -------------------------------------------------------------------- |
| **`publishableKey`**                   | <code>string</code> |                                                                      |
| **`maximumStaleEntitlementsDuration`** | <code>number</code> | Maximum age in seconds before refreshing entitlements. Default: 300. |


#### CustomerSessionResponse

| Prop            | Type                                                                | Description                                                                           |
| --------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **`requestId`** | <code>string</code>                                                 |                                                                                       |
| **`session`**   | <code><a href="#customersession">CustomerSession</a> \| null</code> | A fresh session, or null only when the user is signed out.                            |
| **`failed`**    | <code>boolean</code>                                                | Set true on backend/network failure. Do not silently fall back to anonymous checkout. |


#### CustomerSession

| Prop               | Type                | Description                                                           |
| ------------------ | ------------------- | --------------------------------------------------------------------- |
| **`customer`**     | <code>string</code> |                                                                       |
| **`clientSecret`** | <code>string</code> |                                                                       |
| **`expiresAt`**    | <code>number</code> | Unix timestamp in seconds, as returned by your authenticated backend. |


#### BuyButton

| Prop               | Type                 | Description                                                     |
| ------------------ | -------------------- | --------------------------------------------------------------- |
| **`id`**           | <code>string</code>  |                                                                 |
| **`active`**       | <code>boolean</code> |                                                                 |
| **`callToAction`** | <code>string</code>  |                                                                 |
| **`amount`**       | <code>string</code>  | Amount in minor currency units, as a string supplied by Stripe. |
| **`currency`**     | <code>string</code>  |                                                                 |


#### Entitlement

| Prop            | Type                |
| --------------- | ------------------- |
| **`id`**        | <code>string</code> |
| **`feature`**   | <code>string</code> |
| **`lookupKey`** | <code>string</code> |


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |

</docgen-api>
