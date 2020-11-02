#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN Macro, and
// each method the plugin supports using the CAP_PLUGIN_METHOD macro.
CAP_PLUGIN(StripePlugin, "Stripe",
           CAP_PLUGIN_METHOD(setStripeAccount, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setPublishableKey, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(validateCardNumber, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(validateExpiryDate, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(validateCVC, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(identifyCardBrand, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(createCardToken, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(createBankAccountToken, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(payWithApplePay, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(cancelApplePay, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(finalizeApplePayTransaction, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(createSourceToken, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(createPiiToken, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(createAccountToken, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(confirmPaymentIntent, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(confirmSetupIntent, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(initCustomerSession, CAPPluginReturnPromise);
           
           CAP_PLUGIN_METHOD(presentPaymentOptions, CAPPluginReturnPromise);
           
           // CAP_PLUGIN_METHOD(presentShippingOptions, CAPPluginReturnPromise);
           
           // CAP_PLUGIN_METHOD(presentShippingOptions, CAPPluginReturnPromise);
           
           CAP_PLUGIN_METHOD(initPaymentSession, CAPPluginReturnPromise);
           
           CAP_PLUGIN_METHOD(customerPaymentMethods, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setCustomerDefaultSource, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(addCustomerSource, CAPPluginReturnPromise);
           // CAP_PLUGIN_METHOD(customizePaymentAuthUI, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(isApplePayAvailable, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(isGooglePayAvailable, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(payWithGooglePay, CAPPluginReturnPromise);
)
