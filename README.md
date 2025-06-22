<p align="center"><br><img src="https://user-images.githubusercontent.com/236501/85893648-1c92e880-b7a8-11ea-926d-95355b8175c7.png" width="128" height="128" /></p>

<h3 align="center">Stripe</h3>
<p align="center">
  Capacitor community plugin for native Stripe.
</p>

<p align="center">
  <img src="https://img.shields.io/maintenance/yes/2025?style=flat-square" />
  <a href="https://www.npmjs.com/package/@capacitor-community/stripe"><img src="https://img.shields.io/npm/l/@capacitor-community/stripe?style=flat-square" /></a>
</p>

## packages

| package name                         | description | path                                                                                                   |
|--------------------------------------|-------------|--------------------------------------------------------------------------------------------------------|
| @capacitor-community/stripe          | Support for non-personal payments using Stripe | [/packages/payment](https://github.com/capacitor-community/stripe/tree/main/packages/payment#readme)   |
| @capacitor-community/stripe-identity | Supports identity verification using Stripe | [/packages/identity](https://github.com/capacitor-community/stripe/tree/main/packages/identity#readme) |
| @capacitor-community/stripe-terminal | Support for in-person payments using Stripe  | [/packages/terminal](https://github.com/capacitor-community/stripe/tree/main/packages/terminal#readme) |


## Hint

### Using v7, we recommend to remove buildscript from `app/build.gradle`

Good news for users who added a buildscript in v6 to eliminate the `Unable to get provider androidx.startup.InitializationProvider` error, it is no longer needed in Capacitor v7. Please remove the following

```diff
- buildscript {
-   ext.kotlin_version = '2.0.+'
-   repositories {
-       google()
-       mavenCentral()
-   }
-   dependencies {
-     classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
-   }
- }
- apply plugin: 'kotlin-android'
```

### Versions

Users of Capacitor v6 should use version v6 of the Plugin.

```bash
% npm install @capacitor-community/stripe@6
% npm install @capacitor-community/stripe-identity@6
% npm install @capacitor-community/stripe-terminal@6
```

### How to use Stripe Android currently package

Capacitor Android 7's default settings is here:

```
minSdkVersion = 22
compileSdkVersion = 35
targetSdkVersion = 35
```

To use the latest Stripe Android, you need to version these up. To use the latest features, follow these steps.

1. Open `android/variables.gradle` and change sdkVersion version, if need.
2. Add `stripeAndroidVersion`, `identityVersion` or `stripeterminalCoreVersion` and set required version. Release information is here: 
- https://github.com/stripe/stripe-android/releases
- https://github.com/stripe/stripe-terminal-android/releases

```diff
  ext {
-   minSdkVersion = 23
+   minSdkVersion = 26
    compileSdkVersion = 35
    targetSdkVersion = 35
    androidxActivityVersion = '1.9.2'
    androidxAppCompatVersion = '1.7.0'
    androidxCoordinatorLayoutVersion = '1.2.0'
    androidxCoreVersion = '1.15.0'
    androidxFragmentVersion = '1.8.4'
    coreSplashScreenVersion = '1.0.1'
    androidxWebkitVersion = '1.12.1'
    junitVersion = '4.13.2'
    androidxJunitVersion = '1.2.1'
    androidxEspressoCoreVersion = '3.6.1'
    cordovaAndroidVersion = '10.1.1'

    // If you use @capacitor-community/stripe:
+   stripeAndroidVersion = '21.3.+'

    // If you use @capacitor-community/stripe-identity:
+   identityVersion = '21.3.+'

    // If you use @capacitor-community/stripe-terminal:
+   stripeterminalCoreVersion = '4.5.0'
+   stripeterminalTapToPayVersion = '4.5.0'
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
% cd packages/payment && npm install && npm run build
% cd demo && npm install && npm run cap && npx cap update
```
