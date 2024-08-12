#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Define the plugin using the CAP_PLUGIN Macro, and
// each method the plugin supports using the CAP_PLUGIN_METHOD macro.
CAP_PLUGIN(StripeTerminalPlugin, "StripeTerminal",
           CAP_PLUGIN_METHOD(initialize, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setConnectionToken, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(discoverReaders, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(cancelDiscoverReaders, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(connectReader, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(getConnectedReader, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(disconnectReader, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(collectPaymentMethod, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(cancelCollectPaymentMethod, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(confirmPaymentIntent, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setSimulatorConfiguration, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(installAvailableUpdate, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(cancelInstallUpdate, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(setReaderDisplay, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(clearReaderDisplay, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(rebootReader, CAPPluginReturnPromise);
)
