#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN Macro, and
// each method the plugin supports using the CAP_PLUGIN_METHOD macro.
CAP_PLUGIN(StripePlugin, "Stripe",
           CAP_PLUGIN_METHOD(initialize, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(handleURLCallback, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(createPaymentSheet, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(presentPaymentSheet, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(createPaymentFlow, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(presentPaymentFlow, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(confirmPaymentFlow, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(isApplePayAvailable, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(createApplePay, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(presentApplePay, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(isGooglePayAvailable, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(createGooglePay, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(presentGooglePay, CAPPluginReturnPromise);
)
