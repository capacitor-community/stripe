# Capacitor Stripe SDK
[WIP] Stripe Mobile SDK wrapper for Capacitor

Supports Android, iOS and Web <small>(*[see note #1](#notes)*)</small>

[![Actions Status](https://github.com/zyra/capacitor-stripe/workflows/Build/badge.svg)](https://github.com/zyra/capacitor-stripe/actions)

Apache Cordova version of this plugin can be found here: https://github.com/zyra/cordova-plugin-stripe

## Installation

```bash
npm i -S capacitor-stripe
```

## Documentation
> TODO

### iOS Configuration

**Apple pay requirements**:
- follow [these steps](#) documented by Stripe and/or see [Apple's official documentation](#) to:
  1. create a merchant ID
  2. setup the required keys/certificates
  3. update your XCode app to enable the Apple Pay capability
- 

### Android Configuration

**Google pay requirements**:
- add this code snippet to `<project root>/android/AndroidManifest.xml`:
> TODO

**3DS  Authentication requirements**:
- setup a redirect URL for your app and add it to `<project root>/android/AndroidManifest.xml`, example:
> TODO


## Notes
**1**. Web support is provided for development purposes.
Although it may function as intended in production, it has not been reviewed thoroughly for any security flaws. 
It's a simple HTTP based client library that communicates directly with Stripe's API Servers without using their 
official SDKs. Use at your own risk.
