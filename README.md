<p align="center"><br><img src="https://user-images.githubusercontent.com/236501/85893648-1c92e880-b7a8-11ea-926d-95355b8175c7.png" width="128" height="128" /></p>

<h3 align="center">Stripe</h3>
<p align="center">
  Capacitor community plugin for native Stripe.
</p>

<p align="center">
  <img src="https://img.shields.io/maintenance/yes/2024?style=flat-square" />
  <a href="https://www.npmjs.com/package/@capacitor-community/stripe"><img src="https://img.shields.io/npm/l/@capacitor-community/stripe?style=flat-square" /></a>
</p>

## packages

| package name                         | description | path                                                                                                   |
|--------------------------------------|-------------|--------------------------------------------------------------------------------------------------------|
| @capacitor-community/stripe          | Support for non-personal payments using Stripe | [/packages/payment](https://github.com/capacitor-community/stripe/tree/main/packages/payment#readme)   |
| @capacitor-community/stripe-identity | Supports identity verification using Stripe | [/packages/identity](https://github.com/capacitor-community/stripe/tree/main/packages/identity#readme) |
| @capacitor-community/stripe-terminal | Support for in-person payments using Stripe  | [/packages/terminal](https://github.com/capacitor-community/stripe/tree/main/packages/terminal#readme) |


## Hint

### Versions

Users of Capacitor v5 should use version v5 of the Plugin.

```bash
% npm install @capacitor-community/stripe@5
% npm install @capacitor-community/stripe-identity@5
% npm install @capacitor-community/stripe-terminal@5
```

### How to use Stripe Android currently package

Capacitor Android 6's default settings is here:

```
minSdkVersion = 22
compileSdkVersion = 34
targetSdkVersion = 34
```

To use the latest Stripe Android, you need to version these up. To use the latest features, follow these steps.

1. Open `android/variables.gradle` and change sdkVersion version, if need.
2. Add `stripeAndroidVersion`, `identityVersion` or `stripeterminalCoreVersion` and set required version. Release information is here: 
- https://github.com/stripe/stripe-android/releases
- https://github.com/stripe/stripe-terminal-android/releases

```diff
  ext {
-   minSdkVersion = 22
+   minSdkVersion = 26
    compileSdkVersion = 34
    targetSdkVersion = 33
    androidxActivityVersion = '1.7.0'
    androidxAppCompatVersion = '1.6.1'
    androidxCoordinatorLayoutVersion = '1.2.0'
    androidxCoreVersion = '1.10.0'
    androidxFragmentVersion = '1.5.6'
    coreSplashScreenVersion = '1.0.0'
    androidxWebkitVersion = '1.6.1'
    junitVersion = '4.13.2'
    androidxJunitVersion = '1.1.5'
    androidxEspressoCoreVersion = '3.5.1'
    cordovaAndroidVersion = '10.1.1'

    // If you use @capacitor-community/stripe:
+   stripeAndroidVersion = '20.39.+'

    // If you use @capacitor-community/stripe-identity:
+   identityVersion = '20.39.+'

    // If you use @capacitor-community/stripe-terminal:
+   stripeterminalCoreVersion = '3.5.0'
+   stripeterminalLocalmobileVersion = '3.5.0'
  }
```

Note: `@capacitor-community/stripe-terminal` does not work with the default sdkVersion, so these updates are mandatory. See [/packages/terminal](https://github.com/capacitor-community/stripe/tree/main/packages/terminal#readme) for more information.

### Error when running `cap update ios`

```
[!] CocoaPods could not find compatible versions for pod "StripePaymentSheet":
  In snapshot (Podfile.lock):
..
You have either:
 * out-of-date source repos which you can update with `pod repo update` or with `pod install --repo-update`.
 * changed the constraints of dependency `StripePaymentSheet` inside your development pod `CapacitorCommunityStripe`.
   You should run `pod update StripePaymentSheet` to apply changes you've made.
```

You will see this error often when using Capacitor iOS. The solution is simple: do the following:

```bash
% cd ios/App && pod install --repo-update
```

or 

```bash
% cd ios/App && pod update
```

## Maintainers

| Maintainer          | GitHub                              | Social                                |
| ------------------- | ----------------------------------- | ------------------------------------- |
| Hidetaka Okamoto | [hideokamoto](https://github.com/hideokamoto) | [@hide__dev](https://twitter.com/hide__dev) |
| Masahiko Sakakibara | [rdlabo](https://github.com/rdlabo) | [@rdlabo](https://twitter.com/rdlabo) |

## Contributors ✨
<a href="https://github.com/capacitor-community/stripe/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=capacitor-community/stripe" />
</a>

Made with [contributors-img](https://contrib.rocks).

## Demo

- [Demo code is here](https://github.com/capacitor-community/stripe/tree/master/demo). Please check these code before ask at issues.
- Demo of Web is [hosting here](https://capacitor-community-stripe.netlify.app/).

### Screenshots

#### @capacitor-community/stripe

|              |                     Android                     |                     iOS                     |                     Web                     |
|:------------:|:-----------------------------------------------:|:-------------------------------------------:|:-------------------------------------------:|
| PaymentSheet | ![](demo/screenshots/payment-sheet-android.png) | ![](demo/screenshots/payment-sheet-ios.png) | ![](demo/screenshots/payment-sheet-web.png) |
| PaymentFlow  | ![](demo/screenshots/payment-flow-android.png)  | ![](demo/screenshots/payment-flow-ios.png)  | ![](demo/screenshots/payment-sheet-web.png) |
|   ApplePay   |                  Not supported                  |   ![](demo/screenshots/apple-pay-ios.png)   |                    beta.                    |
|  GooglePay   |  ![](demo/screenshots/google-pay-android.png)   |                Not supported                |  ![](demo/screenshots/google-pay-web.png)   |


#### @capacitor-community/stripe-identity

|              |                     Android                     |                     iOS                     |                  Web                   |
|:------------:|:-----------------------------------------------:|:-------------------------------------------:|:--------------------------------------:|
|   Identity   |   ![](demo/screenshots/identity-android.png)    |    ![](demo/screenshots/identity-ios.png)     | ![](demo/screenshots/identity-web.png) |

## How to use Demo

```bash
% git clone git@github.com:capacitor-community/stripe.git
% cd stripe && npm install && npm run build
% cd demo && npm install && npm run cap && npx cap update
```
