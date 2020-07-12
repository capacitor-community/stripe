# Usage Example


## Initializing the plugin
```ts
import { Plugins } from '@capacitor/core';

const { Stripe } = Plugins;

...

await Stripe.setPublishableKey('pk_test_....');
```

## Validating card information
```ts
const { valid } = await Stripe.validateCardNumber({ number: '424242424242' });
// valid: true

const { valid } = await Stripe.validateExpiryDate({ exp_month: 12, exp_year: 25 });
// valid: true

const { valid } = await Stripe.validateCVC({ cvc: '244' });
// valid: true
```

## Creating card token 
```ts
const res = await Stripe.createCardToken({
  number: '4242424242424242',
  exp_month: 12,
  exp_year: 25,
  cvc: '224',
});

// {
//    id: 'tok_....',
//    card: {
//      last4: '4242',
//      exp_month: 12,
//      exp_year: 25,
//    }
// }
```

## Confirming setup intent
```ts
const clientSecret: string = 'secret from your API';

const res = await Stripe.confirmSetupIntent({
  clientSecret,
  card: {
      number: '4242424242424242',
      exp_month: 12,
      exp_year: 25,
      cvc: '224',
  },
  redirectUrl: 'https://app.myapp.com', // Required for Android
});
```

## Confirming payment intent
```ts
const clientSecret: string = 'secret from your API';

//
// confirm with card
await Stripe.confirmPaymentIntent({
  clientSecret,
  card: {
      number: '4242424242424242',
      exp_month: 12,
      exp_year: 25,
      cvc: '224',
  },
  redirectUrl: 'https://app.myapp.com', // Required for Android
});

//
// confirm with apple pay
await Stripe.confirmPaymentIntent({
  clientSecret,
  applePayOptions: {
    // options here
    merchantId: 'merchant.company',
    country: 'CA',
    currency: 'CAD',
    items: [
      {
        label: 'Some item',
        amount: '50', // amount in dollars
      }
    ]
  },
});

//
// confirm with payment method id
await Stripe.confirmPaymentIntent({
  clientSecret,
  paymentMethodId: 'pm_...',
});

//
// confirm with Google Pay
await Stripe.confirmPaymentIntent({
  clientSecret,
  fromGooglePay: true,
  googlePayOptions: { // just demo options
    currencyCode: 'CAD',
    totalPrice: 500.00,
    totalPriceStatus: 'FINAL',
    allowedAuthMethods: ['PAN_ONLY'],
    allowedCardNetworks: ['VISA'],
  },
});
```

## Payment methods

```ts
// ephemeral key issued by your API
const ephemeralKey = {
  id: 'eph_....',
  object: 'ephemeral_key',
  secret: '....',
  ...
};

await Stripe.initCustomerSession(ephemeralKey);

// get payment methods
const { paymentMethods } = await Stripe.customerPaymentMethods();

// add new payment method
const token = 'tok_....'; // token from createCardToken
await Stripe.addCustomerSource({ sourceId: token });

// set payment method as default
// (Android only)
const sourceId = 'card_....';
await Stripe.setCustomerDefaultSource({ sourceId });
```
