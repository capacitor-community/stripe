#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN Macro, and
// each method the plugin supports using the CAP_PLUGIN_METHOD macro.
CAP_PLUGIN(StripePlugin, "Stripe",
           CAP_PLUGIN_METHOD(initialize, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(isApplePayAvailable, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(payWithApplePay, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(cancelApplePay, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(finalizeApplePayTransaction, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(isGooglePayAvailable, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(payWithGooglePay, CAPPluginReturnPromise);
)
