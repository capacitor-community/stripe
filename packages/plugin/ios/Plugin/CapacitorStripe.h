#import <Cordova/CDV.h>
@import Stripe;

typedef void(^ApplePayCallback)(PKPaymentAuthorizationStatus);

@interface CapacitorStripe : CDVPlugin
@property (nonatomic, retain) STPAPIClient *client;
@property (nonatomic, copy) ApplePayCallback applePayCompleteCallback;
@property (nonatomic, retain) NSString *applePayCDVCallbackId;
extern NSArray *CardBrands;
- (void) setPublishableKey: (CDVInvokedUrlCommand *) command;
- (void) createCardToken: (CDVInvokedUrlCommand *) command;
- (void) validateCardNumber: (CDVInvokedUrlCommand *) command;
- (void) validateExpiryDate: (CDVInvokedUrlCommand *) command;
- (void) validateCVC: (CDVInvokedUrlCommand *) command;
- (void) getCardType: (CDVInvokedUrlCommand *) command;
- (void) createBankAccountToken: (CDVInvokedUrlCommand *) command;
- (void) processPayment: (PKPaymentAuthorizationViewController *) controller didAuthorizePayment:(PKPayment *) payment completion:(void (^)(PKPaymentAuthorizationStatus)) completion;
- (void) createSource: (CDVInvokedUrlCommand *) command;
- (void) initializeApplePayTransaction:(CDVInvokedUrlCommand *) command;
- (void) finalizeApplePayTransaction:(CDVInvokedUrlCommand *) command;
@end
