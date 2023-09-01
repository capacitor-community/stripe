# @capacitor-community/stripe-identity

Stripe Identity SDK bindings for Capacitor Applications.

## Install

```bash
npm install @capacitor-community/stripe-identity
npx cap sync
```

### Initialize Android

change base application theme to `Theme.MaterialComponents.DayNight` at `res/values/styles.xml`:

```diff xml: res/values/styles.xml
- <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
+ <style name="AppTheme" parent="Theme.MaterialComponents.DayNight">
```

parent can be any MaterialComponents. [See here for other options](https://m2.material.io/develop/android/theming/dark/).
see more details on Stripe's native Android SDK page [here](https://stripe.com/docs/identity/verify-identity-documents?platform=android&type=new-integration#set-up-material-theme).


### Initialize iOS

set up camera authorization by adding `NSCameraUsageDescription` in `Info.plist` and add a string value that explains the usage.
see more details on Stripe's native iOS SDK page [here](https://stripe.com/docs/identity/verify-identity-documents?platform=ios&type=new-integration#set-up-camera-authorization).

## Usage

If you want to implement, we recommend to read https://stripe.com/docs/identity .

```ts
import { StripeIdentity } from '@capacitor-community/stripe-identity';

await StripeIdentity.create({
  ephemeralKeySecret,
  verificationId,
});
const result = await StripeIdentity.present();
```

## API

<docgen-index>

* [`create(...)`](#create)
* [`present()`](#present)
* [`addListener(IdentityVerificationSheetEventsEnum.Loaded, ...)`](#addlisteneridentityverificationsheeteventsenumloaded)
* [`addListener(IdentityVerificationSheetEventsEnum.FailedToLoad, ...)`](#addlisteneridentityverificationsheeteventsenumfailedtoload)
* [`addListener(IdentityVerificationSheetEventsEnum.Completed, ...)`](#addlisteneridentityverificationsheeteventsenumcompleted)
* [`addListener(IdentityVerificationSheetEventsEnum.Canceled, ...)`](#addlisteneridentityverificationsheeteventsenumcanceled)
* [`addListener(IdentityVerificationSheetEventsEnum.Failed, ...)`](#addlisteneridentityverificationsheeteventsenumfailed)
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)
* [Enums](#enums)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### create(...)

```typescript
create(options: CreateIdentityVerificationSheetOption) => Promise<void>
```

| Param         | Type                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#createidentityverificationsheetoption">CreateIdentityVerificationSheetOption</a></code> |

--------------------


### present()

```typescript
present() => Promise<{ identityVerificationResult: IdentityVerificationSheetResultInterface; }>
```

**Returns:** <code>Promise&lt;{ identityVerificationResult: <a href="#identityverificationsheetresultinterface">IdentityVerificationSheetResultInterface</a>; }&gt;</code>

--------------------


### addListener(IdentityVerificationSheetEventsEnum.Loaded, ...)

```typescript
addListener(eventName: IdentityVerificationSheetEventsEnum.Loaded, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#identityverificationsheeteventsenum">IdentityVerificationSheetEventsEnum.Loaded</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                                                 |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(IdentityVerificationSheetEventsEnum.FailedToLoad, ...)

```typescript
addListener(eventName: IdentityVerificationSheetEventsEnum.FailedToLoad, listenerFunc: (error: string) => void) => PluginListenerHandle
```

| Param              | Type                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#identityverificationsheeteventsenum">IdentityVerificationSheetEventsEnum.FailedToLoad</a></code> |
| **`listenerFunc`** | <code>(error: string) =&gt; void</code>                                                                          |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(IdentityVerificationSheetEventsEnum.Completed, ...)

```typescript
addListener(eventName: IdentityVerificationSheetEventsEnum.Completed, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#identityverificationsheeteventsenum">IdentityVerificationSheetEventsEnum.Completed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                                                    |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(IdentityVerificationSheetEventsEnum.Canceled, ...)

```typescript
addListener(eventName: IdentityVerificationSheetEventsEnum.Canceled, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#identityverificationsheeteventsenum">IdentityVerificationSheetEventsEnum.Canceled</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                                                   |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(IdentityVerificationSheetEventsEnum.Failed, ...)

```typescript
addListener(eventName: IdentityVerificationSheetEventsEnum.Failed, listenerFunc: (error: string) => void) => PluginListenerHandle
```

| Param              | Type                                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#identityverificationsheeteventsenum">IdentityVerificationSheetEventsEnum.Failed</a></code> |
| **`listenerFunc`** | <code>(error: string) =&gt; void</code>                                                                    |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### Interfaces


#### CreateIdentityVerificationSheetOption

| Prop                     | Type                |
| ------------------------ | ------------------- |
| **`verificationId`**     | <code>string</code> |
| **`ephemeralKeySecret`** | <code>string</code> |


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


### Type Aliases


#### IdentityVerificationSheetResultInterface

<code><a href="#identityverificationsheeteventsenum">IdentityVerificationSheetEventsEnum.Completed</a> | <a href="#identityverificationsheeteventsenum">IdentityVerificationSheetEventsEnum.Canceled</a> | <a href="#identityverificationsheeteventsenum">IdentityVerificationSheetEventsEnum.Failed</a></code>


### Enums


#### IdentityVerificationSheetEventsEnum

| Members            | Value                                                |
| ------------------ | ---------------------------------------------------- |
| **`Loaded`**       | <code>"identityVerificationSheetLoaded"</code>       |
| **`FailedToLoad`** | <code>"identityVerificationSheetFailedToLoad"</code> |
| **`Completed`**    | <code>"identityVerificationSheetCompleted"</code>    |
| **`Canceled`**     | <code>"identityVerificationSheetCanceled"</code>     |
| **`Failed`**       | <code>"identityVerificationSheetFailed"</code>       |

</docgen-api>
