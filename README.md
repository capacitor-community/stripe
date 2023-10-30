<p align="center"><br><img src="https://user-images.githubusercontent.com/236501/85893648-1c92e880-b7a8-11ea-926d-95355b8175c7.png" width="128" height="128" /></p>

<h3 align="center">Stripe</h3>
<p align="center">
  VendPark fork of the Capacitor community plugin for native Stripe.
</p>

<p align="center">
  <img src="https://img.shields.io/maintenance/yes/2023?style=flat-square" />
  <a href="https://www.npmjs.com/package/@capacitor-community/stripe"><img src="https://img.shields.io/npm/l/@capacitor-community/stripe?style=flat-square" /></a>
</p>

## packages

| package name              | description                                    | path                                                                                                  |
| ------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| @vendpark/stripe-payment  | Support for non-personal payments using Stripe | [/packages/payment](https://github.com/vendpark/capacitor-stripe/tree/main/packages/payment#readme)   |
| @vendpark/stripe-identity | Supports identity verification using Stripe    | [/packages/identity](https://github.com/vendpark/capacitor-stripe/tree/main/packages/identity#readme) |
| @vendpark/stripe-terminal | Support for in-person payments using Stripe    | [/packages/terminal](https://github.com/vendpark/capacitor-stripe/tree/main/packages/terminal#readme) |

## Maintainers

| Maintainer   | GitHub                                        | Social                                  |
| ------------ | --------------------------------------------- | --------------------------------------- |
| Isaiah Moran | [isaiahmoran](https://github.com/isaiahmoran) | [@iamstow](https://twitter.com/iamstow) |

## Contributors ✨

<a href="https://github.com/isaiahmoran/express-example/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=isaiahmoran/express-example" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

## Demo

- [Demo code is here](https://github.com/vendpark/capacitor-stripe/tree/master/demo).

### Screenshots

#### @vendpark/capacitor-stripe

|              |                     Android                     |                     iOS                     |                     Web                     |
| :----------: | :---------------------------------------------: | :-----------------------------------------: | :-----------------------------------------: |
| PaymentSheet | ![](demo/screenshots/payment-sheet-android.png) | ![](demo/screenshots/payment-sheet-ios.png) | ![](demo/screenshots/payment-sheet-web.png) |
| PaymentFlow  | ![](demo/screenshots/payment-flow-android.png)  | ![](demo/screenshots/payment-flow-ios.png)  | ![](demo/screenshots/payment-sheet-web.png) |
|   ApplePay   |                  Not supported                  |   ![](demo/screenshots/apple-pay-ios.png)   |                    beta.                    |
|  GooglePay   |  ![](demo/screenshots/google-pay-android.png)   |                Not supported                |  ![](demo/screenshots/google-pay-web.png)   |

#### @capacitor-community/stripe-identity

|          |                  Android                   |                  iOS                   |      Web      |
| :------: | :----------------------------------------: | :------------------------------------: | :-----------: |
| Identity | ![](demo/screenshots/identity-android.png) | ![](demo/screenshots/identity-ios.png) | Not supported |
