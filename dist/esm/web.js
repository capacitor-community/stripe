import { WebPlugin } from '@capacitor/core';
import { isPlatform } from './shared/platform';
import { PaymentFlowEventsEnum, PaymentSheetEventsEnum } from './definitions';
export class StripeWeb extends WebPlugin {
    constructor() {
        super({
            name: 'Stripe',
            platforms: ['web'],
        });
    }
    async initialize(options) {
        if (typeof options.publishableKey !== 'string' ||
            options.publishableKey.trim().length === 0) {
            throw new Error('you must provide a valid key');
        }
        this.publishableKey = options.publishableKey;
    }
    async createPaymentSheet(options) {
        var _a;
        if (!this.publishableKey) {
            this.notifyListeners(PaymentSheetEventsEnum.FailedToLoad, null);
            return;
        }
        this.paymentSheet = document.createElement('stripe-payment-sheet');
        (_a = document.querySelector('body')) === null || _a === void 0 ? void 0 : _a.appendChild(this.paymentSheet);
        await customElements.whenDefined('stripe-payment-sheet');
        this.paymentSheet.publishableKey = this.publishableKey;
        this.paymentSheet.intentClientSecret =
            options.paymentIntentClientSecret;
        this.paymentSheet.intentType = "payment";
        this.notifyListeners(PaymentSheetEventsEnum.Loaded, null);
    }
    async presentPaymentSheet() {
        if (!this.paymentSheet) {
            throw new Error();
        }
        const props = await this.paymentSheet.present();
        if (props === undefined) {
            this.notifyListeners(PaymentSheetEventsEnum.Canceled, null);
            return {
                paymentResult: PaymentSheetEventsEnum.Canceled,
            };
        }
        const { detail: { stripe, cardNumberElement }, } = props;
        const result = await stripe.createPaymentMethod({
            type: 'card',
            card: cardNumberElement,
        });
        this.paymentSheet.updateProgress('success');
        this.paymentSheet.remove();
        if (result.error !== undefined) {
            this.notifyListeners(PaymentSheetEventsEnum.Failed, null);
            return {
                paymentResult: PaymentSheetEventsEnum.Failed,
            };
        }
        this.notifyListeners(PaymentSheetEventsEnum.Completed, null);
        return {
            paymentResult: PaymentSheetEventsEnum.Completed,
        };
    }
    async createPaymentFlow(options) {
        var _a;
        if (!this.publishableKey) {
            this.notifyListeners(PaymentFlowEventsEnum.FailedToLoad, null);
            return;
        }
        this.paymentSheet = document.createElement('stripe-payment-sheet');
        (_a = document.querySelector('body')) === null || _a === void 0 ? void 0 : _a.appendChild(this.paymentSheet);
        await customElements.whenDefined('stripe-payment-sheet');
        this.paymentSheet.publishableKey = this.publishableKey;
        this.paymentSheet.applicationName = "@capacitor-community/stripe";
        // eslint-disable-next-line no-prototype-builtins
        if (options.hasOwnProperty('paymentIntentClientSecret')) {
            this.paymentSheet.intentType = "payment";
            this.paymentSheet.intentClientSecret =
                options.paymentIntentClientSecret;
        }
        else {
            this.paymentSheet.intentType = "setup";
            this.paymentSheet.intentClientSecret =
                options.setupIntentClientSecret;
        }
        if (isPlatform(window, 'ios')) {
            this.paymentSheet.buttonLabel = 'Add card';
            this.paymentSheet.sheetTitle = 'Add a card';
        }
        else {
            this.paymentSheet.buttonLabel = 'Add';
        }
        this.notifyListeners(PaymentFlowEventsEnum.Loaded, null);
    }
    async presentPaymentFlow() {
        if (!this.paymentSheet) {
            throw new Error();
        }
        this.notifyListeners(PaymentFlowEventsEnum.Opened, null);
        const props = await this.paymentSheet.present().catch(() => undefined);
        if (props === undefined) {
            this.notifyListeners(PaymentFlowEventsEnum.Canceled, null);
            throw new Error();
        }
        const { detail: { stripe, cardNumberElement }, } = props;
        const { token } = await stripe.createToken(cardNumberElement);
        if (token === undefined || token.card === undefined) {
            throw new Error();
        }
        this.flowStripe = stripe;
        this.flowCardNumberElement = cardNumberElement;
        this.notifyListeners(PaymentFlowEventsEnum.Created, {
            cardNumber: token.card.last4,
        });
        return {
            cardNumber: token.card.last4,
        };
    }
    async confirmPaymentFlow() {
        if (!this.paymentSheet || !this.flowStripe || !this.flowCardNumberElement) {
            throw new Error();
        }
        const result = await this.flowStripe.createPaymentMethod({
            type: 'card',
            card: this.flowCardNumberElement,
        });
        if (result.error !== undefined) {
            this.notifyListeners(PaymentFlowEventsEnum.Failed, null);
        }
        this.paymentSheet.updateProgress('success');
        this.paymentSheet.remove();
        this.notifyListeners(PaymentFlowEventsEnum.Completed, null);
        return {
            paymentResult: PaymentFlowEventsEnum.Completed,
        };
    }
    isApplePayAvailable() {
        throw this.unimplemented('Not implemented on web.');
    }
    createApplePay() {
        throw this.unimplemented('Not implemented on web.');
    }
    presentApplePay() {
        throw this.unimplemented('Not implemented on web.');
    }
    isGooglePayAvailable() {
        throw this.unimplemented('Not implemented on web.');
    }
    createGooglePay() {
        throw this.unimplemented('Not implemented on web.');
    }
    presentGooglePay() {
        throw this.unimplemented('Not implemented on web.');
    }
}
//# sourceMappingURL=web.js.map