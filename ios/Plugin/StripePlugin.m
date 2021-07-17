#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN Macro, and
// each method the plugin supports using the CAP_PLUGIN_METHOD macro.
CAP_PLUGIN(StripePlugin, "Stripe",
           CAP_PLUGIN_METHOD(initialize, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(createPaymentSheet, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(presentPaymentSheet, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(createSetupIntent, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(presentSetupIntent, CAPPluginReturnPromise);
)
