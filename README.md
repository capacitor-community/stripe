# Capacitor Stripe SDK
[WIP] Stripe Mobile SDK wrapper for Capacitor

Supports Android, iOS and Web <small>(*[see note #1](#notes)*)</small>

[![Actions Status](https://github.com/zyra/capacitor-stripe/workflows/Build/badge.svg)](https://github.com/zyra/capacitor-stripe/actions)

Apache Cordova version of this plugin can be found here: https://github.com/zyra/cordova-plugin-stripe

## Documentation
https://zyra.github.io/capacitor-stripe

## Notes
**1**. Web support is provided for development purposes.
Although it may function as intended in production, it has not been reviewed thoroughly for any security flaws. 
It's a simple HTTP based client library that communicates directly with Stripe's API Servers without using their 
official SDKs. Use at your own risk.
