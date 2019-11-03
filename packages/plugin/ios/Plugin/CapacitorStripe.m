#import "CapacitorStripe.h"
@import Stripe;

@implementation CapacitorStripe

@synthesize client;
@synthesize applePayCDVCallbackId;
@synthesize applePayCompleteCallback;

NSArray *CardBrands = nil;

- (void)pluginInitialize
{
    CardBrands = [[NSArray alloc] initWithObjects:@"Visa", @"American Express", @"MasterCard", @"Discover", @"JCB", @"Diners Club", @"Unknown", nil];
}

- (void)setPublishableKey:(CDVInvokedUrlCommand*)command
{
    NSString* publishableKey = [[command arguments] objectAtIndex:0];
    [[STPPaymentConfiguration sharedConfiguration] setPublishableKey:publishableKey];
    
    if (self.client == nil) {
        // init client if doesn't exist
        client = [[STPAPIClient alloc] init];
    } else {
        [self.client setPublishableKey:publishableKey];
    }
    
    CDVPluginResult* result = [CDVPluginResult
                               resultWithStatus: CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)initializeApplePayTransaction:(CDVInvokedUrlCommand *) command
{
    NSString *merchantIdentifier = [command.arguments objectAtIndex:0];
    NSString *country = [command.arguments objectAtIndex:1];
    NSString *currency = [command.arguments objectAtIndex:2];
    NSArray *items = [command.arguments objectAtIndex:3];
    
    PKPaymentRequest *paymentRequest = [Stripe paymentRequestWithMerchantIdentifier:merchantIdentifier country:country currency:currency];
    
    NSMutableArray *paymentSummaryItems = [[NSMutableArray alloc] initWithCapacity:sizeof items];
    for (NSDictionary *item in items) {
        [paymentSummaryItems addObject:[PKPaymentSummaryItem summaryItemWithLabel:item[@"label"] amount:[NSDecimalNumber decimalNumberWithString:item[@"amount"]]]];
    }
    
    paymentRequest.paymentSummaryItems = paymentSummaryItems;
    
    if ([Stripe canSubmitPaymentRequest:paymentRequest]) {
        PKPaymentAuthorizationViewController *paymentAuthorizationViewController = [[PKPaymentAuthorizationViewController alloc] initWithPaymentRequest:paymentRequest];
        
        paymentAuthorizationViewController.delegate = self.appDelegate;
        self.applePayCDVCallbackId = command.callbackId;
        
        NSLog(@"Callback ID is %@", command.callbackId);
        
        
        [self.viewController presentViewController:paymentAuthorizationViewController animated:YES completion:nil];
        
        
    } else {
        NSLog(@"Problem with integration");
    }
}

- (void)processPayment: (PKPaymentAuthorizationViewController *)controller didAuthorizePayment:(PKPayment *)payment completion:(void (^)(PKPaymentAuthorizationStatus))completion
{
    [self.client createTokenWithPayment:payment completion:^(STPToken *token, NSError *error) {
        CDVPluginResult *result;
        
        if (error != nil) {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error.localizedDescription];
        } else if (token == nil) {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Unable to retrieve token"];
        } else {
            self.applePayCompleteCallback = completion;
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:token.allResponseFields];
        }
        
        [self.commandDelegate sendPluginResult:result callbackId:self.applePayCDVCallbackId];
        self.applePayCDVCallbackId = nil;
    }];
}

- (void)finalizeApplePayTransaction: (CDVInvokedUrlCommand *) command
{
    BOOL successful = [command.arguments objectAtIndex:0];
    if (self.applePayCompleteCallback) {
        self.applePayCompleteCallback(successful? PKPaymentAuthorizationStatusSuccess : PKPaymentAuthorizationStatusFailure);
        self.applePayCompleteCallback = nil;
    }
    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId:command.callbackId];
}

- (void)checkApplePaySupport: (CDVInvokedUrlCommand *)command
{
    CDVPluginResult* const result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:[Stripe deviceSupportsApplePay]];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)setAppleMerchantIdentifier: (CDVInvokedUrlCommand *)command
{
    NSString* key = [[command arguments] objectAtIndex:0];
    [[STPPaymentConfiguration sharedConfiguration] setAppleMerchantIdentifier:key];
}

- (void)throwNotInitializedError:(CDVInvokedUrlCommand *) command
{
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"You must call setPublishableKey method before executing this command."];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void (^)(STPToken * _Nullable token, NSError * _Nullable error)) handleTokenCallback: (CDVInvokedUrlCommand *) command
{
    return ^(STPToken * _Nullable token, NSError * _Nullable error) {
        CDVPluginResult* result;
        if (error != nil) {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString: error.localizedDescription];
        } else {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:token.allResponseFields];
        }
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    };
}

- (void)createCardToken:(CDVInvokedUrlCommand *)command
{
    if (self.client == nil) {
        [self throwNotInitializedError:command];
        return;
    }
    
    [self.commandDelegate runInBackground:^{
        
        NSDictionary* const cardInfo = [[command arguments] objectAtIndex:0];
        
        STPCardParams* cardParams = [[STPCardParams alloc] init];
        
        STPAddress* address = [[STPAddress alloc] init];
        address.line1 = cardInfo[@"address_line1"];
        address.line2 = cardInfo[@"address_line2"];
        address.city = cardInfo[@"address_city"];
        address.state = cardInfo[@"address_state"];
        address.country = cardInfo[@"address_country"];
        address.postalCode = cardInfo[@"postalCode"];
        address.phone = cardInfo[@"phone"];
        address.email = cardInfo[@"email"];
        
        cardParams.address = address;
        
        cardParams.number = cardInfo[@"number"];
        cardParams.expMonth = [cardInfo[@"expMonth"] intValue];
        cardParams.expYear = [cardInfo[@"expYear"] intValue];
        cardParams.cvc = cardInfo[@"cvc"];
        cardParams.name = cardInfo[@"name"];
        cardParams.currency = cardInfo[@"currency"];
        
        [self.client createTokenWithCard:cardParams completion:[self handleTokenCallback:command]];
    }];
    
}

- (void) createBankAccountToken:(CDVInvokedUrlCommand *)command
{
    if (self.client == nil) {
        [self throwNotInitializedError:command];
        return;
    }
    
    
    [self.commandDelegate runInBackground:^{
        
        NSDictionary* const bankAccountInfo = [command.arguments objectAtIndex:0];
        STPBankAccountParams* params = [[STPBankAccountParams alloc] init];
        
        params.accountNumber = bankAccountInfo[@"account_number"];
        params.country = bankAccountInfo[@"country"];
        params.currency = bankAccountInfo[@"currency"];
        params.routingNumber = bankAccountInfo[@"routing_number"];
        params.accountHolderName = bankAccountInfo[@"account_holder_name"];
        
        NSString* accountType = bankAccountInfo[@"account_holder_type"];
        if ([accountType  isEqualToString: @"individual"]) {
            params.accountHolderType = STPBankAccountHolderTypeIndividual;
        } else if([accountType isEqualToString: @"company"]) {
            params.accountHolderType = STPBankAccountHolderTypeCompany;
        }
        
        [self.client createTokenWithBankAccount:params completion:[self handleTokenCallback:command]];
    }];
    
}

- (void)validateCardNumber:(CDVInvokedUrlCommand *)command
{
    STPCardValidationState state = [STPCardValidator validationStateForNumber:[command.arguments objectAtIndex:0] validatingCardBrand:YES];
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:state == STPCardValidationStateValid];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)validateExpiryDate:(CDVInvokedUrlCommand *)command
{
    NSString *expMonth = [command.arguments objectAtIndex:0];
    NSString *expYear = [command.arguments objectAtIndex:1];
    
    if (expYear.length == 4) {
        expYear = [expYear substringFromIndex:2];
    }
    
    STPCardValidationState state = [STPCardValidator validationStateForExpirationYear:expYear inMonth:expMonth];
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:state == STPCardValidationStateValid];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)validateCVC:(CDVInvokedUrlCommand *)command
{
    STPCardValidationState state = [STPCardValidator validationStateForCVC:[command.arguments objectAtIndex:0] cardBrand:STPCardBrandUnknown];
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:state == STPCardValidationStateValid];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)getCardType:(CDVInvokedUrlCommand *)command
{
    STPCardBrand brand = [STPCardValidator brandForNumber:[command.arguments objectAtIndex:0]];
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:CardBrands[brand]];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) createSource:(CDVInvokedUrlCommand *)command
{
    [self.commandDelegate runInBackground:^{
        NSInteger type = [[command.arguments objectAtIndex:0] integerValue];
        NSDictionary *params = [command.arguments objectAtIndex:1];
        STPSourceParams *sourceParams;
        
        switch (type) {
            case 0:
                // 3DS
                sourceParams = [STPSourceParams threeDSecureParamsWithAmount:[params[@"amount"] integerValue] currency:params[@"currency"] returnURL:params[@"returnURL"] card:params[@"card"]];
                break;
                
            case 1:
                // GiroPay
                sourceParams = [STPSourceParams giropayParamsWithAmount:[params[@"amount"] integerValue] name:params[@"name"] returnURL:params[@"returnURL"] statementDescriptor:params[@"statementDescriptor"]];
                break;
                
            case 2:
                // iDEAL
                sourceParams = [STPSourceParams idealParamsWithAmount:[params[@"amount"] integerValue] name:params[@"name"] returnURL:params[@"returnURL"] statementDescriptor:params[@"statementDescriptor"] bank:params[@"bank"]];
                break;
                
            case 3:
                // SEPA Debit
                sourceParams = [STPSourceParams sepaDebitParamsWithName:params[@"name"] iban:params[@"iban"] addressLine1:params[@"addressLine1"] city:params[@"city"] postalCode:params[@"postalCode"] country:params[@"country"]];
                break;
                
            case 4:
                // Sofort
                sourceParams = [STPSourceParams sofortParamsWithAmount:[params[@"amount"] integerValue] returnURL:params[@"returnURL"] country:params[@"country"] statementDescriptor:params[@"statementDescriptor"]];
                break;
                
            case 5:
                // Alipay
                sourceParams = [STPSourceParams alipayParamsWithAmount:[params[@"amount"] integerValue] currency:params[@"currency"] returnURL:params[@"returnURL"]];
                break;
                
            case 6:
                // Alipay Reusable
                sourceParams = [STPSourceParams alipayReusableParamsWithCurrency:params[@"currency"] returnURL:params[@"returnURL"]];
                break;
                
            case 7:
                // P24
                sourceParams = [STPSourceParams p24ParamsWithAmount:[params[@"amount"] integerValue] currency:params[@"currency"] email:params[@"email"] name:params[@"name"] returnURL:params[@"returnURL"]];
                break;
                
            case 8:
                // Visa Checkout
                sourceParams = [STPSourceParams visaCheckoutParamsWithCallId:params[@"callId"]];
                break;
                
            default:
                [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Invalid source type"] callbackId:command.callbackId];
                return;
        }
        
        [self.client createSourceWithParams:sourceParams completion:^(STPSource * _Nullable source, NSError * _Nullable error) {
            CDVPluginResult *pluginResult;
            if (source != nil) {
                pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:source.allResponseFields];
            } else {
                pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error.localizedDescription];
            }
            
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        }];
    }];
}

- (void) createPiiToken:(CDVInvokedUrlCommand *) command
{
    [self.commandDelegate runInBackground:^{
        NSString *pid = [command.arguments objectAtIndex:0];
        [self.client createTokenWithPersonalIDNumber:pid completion:^(STPToken * _Nullable token, NSError * _Nullable error) {
            CDVPluginResult *pluginResult;
            if (error != nil) {
                pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error.localizedDescription];
            } else {
                pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:token.tokenId];
            }
            
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        }];
    }];
}

- (void) createAccountToken:(CDVInvokedUrlCommand *) command
{
    STPConnectAccountParams *params;
    [self.client createTokenWithConnectAccount: params completion:^(STPToken * _Nullable token, NSError * _Nullable error) {
        CDVPluginResult *pluginResult;
        if (error != nil) {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error.localizedDescription];
        } else {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:token.tokenId];
        }
        
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}

@end

