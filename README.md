<p align="center"><br><img src="https://user-images.githubusercontent.com/236501/85893648-1c92e880-b7a8-11ea-926d-95355b8175c7.png" width="128" height="128" /></p>
<h3 align="center">Stripe</h3>
<p align="center"><strong><code>@capacitor-community/stripe</code></strong></p>
<p align="center">
  Stripe Mobile SDK bindings for Capacitor apps
</p>

<p align="center">
  <img src="https://img.shields.io/maintenance/yes/2020?style=flat-square" />
  <a href="https://github.com/capacitor-community/stripe/actions?query=workflow%3A%22Build%22"><img src="https://img.shields.io/github/workflow/status/capacitor-community/stripe/Build?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/@capacitor-community/stripe"><img src="https://img.shields.io/npm/l/@capacitor-community/stripe?style=flat-square" /></a>
<br>
  <a href="https://www.npmjs.com/package/@capacitor-community/stripe"><img src="https://img.shields.io/npm/dw/@capacitor-community/stripe?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/@capacitor-community/stripe"><img src="https://img.shields.io/npm/v/@capacitor-community/stripe?style=flat-square" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
<a href="#contributors-"><img src="https://img.shields.io/badge/all%20contributors-0-orange?style=flat-square" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
</p>

## Platform support
|                   | Android            | iOS                | Web <small>*[1](#notes)*</small> |
| ----------------- | ------------------ | ------------------ | ------------------ |
| Card verification | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Card tokens       | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Source tokens     | :heavy_check_mark: | :construction:     | :x:                |
| PII tokens        | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Account tokens    | :heavy_check_mark: | :construction:     | :heavy_check_mark: |
| Payment Methods   | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Payment Intents   | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Setup Intents     | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Google Pay        | :heavy_check_mark: | :x:                | :x:                |
| Apple Pay         | :x:                | :heavy_check_mark: | :x:                |

## Installation

#### Basic setup

###### 1. Install the plugin using NPM

```shell
npm i -S @capacitor-community/stripe
```
<br>

###### 2. Import from @capacitor/core
```ts
import { Plugins } from '@capacitor/core';

const { Stripe } = Plugins;
```

###### 3. Set your publishable key
```ts
Stripe.setPublishableKey({ key: 'Your key here' });
```

#### Android Setup
Add the plugin class in your app's `MainActivity.java`:
```java
//
// other imports
// ...

// 1. Import Stripe plugin
import ca.zyra.capacitor.stripe.Stripe;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initializes the Bridge
        this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
            //
            // other plugins
            // ...

            // 2. Add Stripe plugin here
            add(Stripe.class);
        }});
    }
}
```

## Configuration

#### Google Pay

To use Google Pay you must add the following `<meta-data>` tag to `AndroidManifest.xml`:
```xml
<application
  ...
  <meta-data
    android:name="com.google.android.gms.wallet.api.enabled"
    android:value="true" />
</application>
```

Review the steps outlined here for more details on [Going live with Google Pay](https://stripe.com/docs/google-pay#going-live-with-google-pay).

#### Apple Pay
To enable payments using Apple Pay you must follow the first 3 steps in [this guide](https://stripe.com/docs/apple-pay#native):

###### 1. [Register for Apple Merchant ID](https://stripe.com/docs/apple-pay#merchantid)
###### 2. [Create a new Apple Pay certificate](https://stripe.com/docs/apple-pay#csr)
###### 3. [Integrate with Xcode](https://stripe.com/docs/apple-pay#setup)


## Documentation
https://capacitor-community.github.io/stripe/

## Maintainers

| Maintainer | GitHub | Social |
| -----------| -------| -------|
| Ibby Hadeed | [ihadeed](https://github.com/ihadeed) | |

## Notes
**1**. Web support is provided for development purposes.
Although it may function as intended in production, it has not been reviewed thoroughly for any security flaws. 
It's a simple HTTP based client library that communicates directly with Stripe's API Servers without using their 
official SDKs. Use at your own risk.
