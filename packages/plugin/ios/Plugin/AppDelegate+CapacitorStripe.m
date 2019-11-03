#import "AppDelegate+CapacitorStripe.h"
#import "CapacitorStripe.h"
@import Stripe;

@implementation AppDelegate (CapacitorStripe)
static NSString* const PLUGIN_NAME = @"CapacitorStripe";
- (void)paymentAuthorizationViewController:(PKPaymentAuthorizationViewController *)controller didAuthorizePayment:(PKPayment *)payment completion:(void (^)(PKPaymentAuthorizationStatus))completion {
    CapacitorStripe* pluginInstance = [self.viewController getCommandInstance:PLUGIN_NAME];
    if (pluginInstance != nil) {
        // Send token back to plugin
        [pluginInstance processPayment:controller didAuthorizePayment:payment completion:completion];
    } else {
        // Discard payment
        NSLog(@"Unable to get plugin instsnce, discarding payment.");
        completion(PKPaymentAuthorizationStatusFailure);
    }
}

- (void)paymentAuthorizationViewControllerDidFinish:(PKPaymentAuthorizationViewController *)controller {
    
}

@end
