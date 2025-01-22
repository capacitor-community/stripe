# @capacitor-community/stripe

Stripe Identity SDK bindings for Capacitor Applications

## Install

```bash
npm install @capacitor-community/stripe
npx cap sync
```

## How to use

Learn at [the official @capacitor-community/stripe documentation](https://stripe.capacitorjs.jp/).

日本語版をご利用の際は [ja.stripe.capacitorjs.jp](https://ja.stripe.capacitorjs.jp/) をご確認ください。

## API

<docgen-index>

* [Interfaces](#interfaces)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

This is for @capacitor/docgen only.
Not use in product.

### Interfaces


#### StripePlugin

| Method                | Signature                                                                                                | Description |
| --------------------- | -------------------------------------------------------------------------------------------------------- | ----------- |
| **initialize**        | (opts: <a href="#stripeinitializationoptions">StripeInitializationOptions</a>) =&gt; Promise&lt;void&gt; |             |
| **handleURLCallback** | (opts: <a href="#stripeurlhandlingoptions">StripeURLHandlingOptions</a>) =&gt; Promise&lt;void&gt;       | iOS Only    |


#### StripeInitializationOptions

| Prop                 | Type                | Description                                       |
| -------------------- | ------------------- | ------------------------------------------------- |
| **`publishableKey`** | <code>string</code> |                                                   |
| **`stripeAccount`**  | <code>string</code> | Optional. Making API calls for connected accounts |


#### StripeURLHandlingOptions

| Prop      | Type                |
| --------- | ------------------- |
| **`url`** | <code>string</code> |


#### CapacitorStripeContext

| Prop                       | Type                                                  |
| -------------------------- | ----------------------------------------------------- |
| **`stripe`**               | <code><a href="#stripeplugin">StripePlugin</a></code> |
| **`isApplePayAvailable`**  | <code>boolean</code>                                  |
| **`isGooglePayAvailable`** | <code>boolean</code>                                  |

</docgen-api>


## License

@capacitor-community/stripe is [MIT licensed](./LICENSE).
