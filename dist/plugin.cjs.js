'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@capacitor/core');

exports.ApplePayEventsEnum = void 0;
(function (ApplePayEventsEnum) {
    ApplePayEventsEnum["Loaded"] = "applePayLoaded";
    ApplePayEventsEnum["FailedToLoad"] = "applePayFailedToLoad";
    ApplePayEventsEnum["Completed"] = "applePayCompleted";
    ApplePayEventsEnum["Canceled"] = "applePayCanceled";
    ApplePayEventsEnum["Failed"] = "applePayFailed";
})(exports.ApplePayEventsEnum || (exports.ApplePayEventsEnum = {}));

exports.GooglePayEventsEnum = void 0;
(function (GooglePayEventsEnum) {
    GooglePayEventsEnum["Loaded"] = "googlePayLoaded";
    GooglePayEventsEnum["FailedToLoad"] = "googlePayFailedToLoad";
    GooglePayEventsEnum["Completed"] = "googlePayCompleted";
    GooglePayEventsEnum["Canceled"] = "googlePayCanceled";
    GooglePayEventsEnum["Failed"] = "googlePayFailed";
})(exports.GooglePayEventsEnum || (exports.GooglePayEventsEnum = {}));

exports.PaymentFlowEventsEnum = void 0;
(function (PaymentFlowEventsEnum) {
    PaymentFlowEventsEnum["Loaded"] = "paymentFlowLoaded";
    PaymentFlowEventsEnum["FailedToLoad"] = "paymentFlowFailedToLoad";
    PaymentFlowEventsEnum["Opened"] = "paymentFlowOpened";
    PaymentFlowEventsEnum["Created"] = "paymentFlowCreated";
    PaymentFlowEventsEnum["Completed"] = "paymentFlowCompleted";
    PaymentFlowEventsEnum["Canceled"] = "paymentFlowCanceled";
    PaymentFlowEventsEnum["Failed"] = "paymentFlowFailed";
})(exports.PaymentFlowEventsEnum || (exports.PaymentFlowEventsEnum = {}));

exports.PaymentSheetEventsEnum = void 0;
(function (PaymentSheetEventsEnum) {
    PaymentSheetEventsEnum["Loaded"] = "paymentSheetLoaded";
    PaymentSheetEventsEnum["FailedToLoad"] = "paymentSheetFailedToLoad";
    PaymentSheetEventsEnum["Completed"] = "paymentSheetCompleted";
    PaymentSheetEventsEnum["Canceled"] = "paymentSheetCanceled";
    PaymentSheetEventsEnum["Failed"] = "paymentSheetFailed";
})(exports.PaymentSheetEventsEnum || (exports.PaymentSheetEventsEnum = {}));

const Stripe = core.registerPlugin('Stripe', {
    web: () => Promise.resolve().then(function () { return web; }).then(m => new m.StripeWeb()),
});

const getPlatforms = (win) => setupPlatforms(win);
const isPlatform = (winOrPlatform, platform) => {
    if (typeof winOrPlatform === 'string') {
        platform = winOrPlatform;
        winOrPlatform = undefined;
    }
    return getPlatforms(winOrPlatform).includes(platform);
};
const setupPlatforms = (win = window) => {
    if (typeof win === 'undefined') {
        return [];
    }
    win.Ionic = win.Ionic || {};
    let platforms = win.Ionic.platforms;
    if (platforms == null) {
        platforms = win.Ionic.platforms = detectPlatforms(win);
        platforms.forEach(p => win.document.documentElement.classList.add(`plt-${p}`));
    }
    return platforms;
};
const detectPlatforms = (win) => Object.keys(PLATFORMS_MAP).filter(p => PLATFORMS_MAP[p](win));
const isMobileWeb = (win) => isMobile(win) && !isHybrid(win);
const isIpad = (win) => {
    // iOS 12 and below
    if (testUserAgent(win, /iPad/i)) {
        return true;
    }
    // iOS 13+
    if (testUserAgent(win, /Macintosh/i) && isMobile(win)) {
        return true;
    }
    return false;
};
const isIphone = (win) => testUserAgent(win, /iPhone/i);
const isIOS = (win) => testUserAgent(win, /iPhone|iPod/i) || isIpad(win);
const isAndroid = (win) => testUserAgent(win, /android|sink/i);
const isAndroidTablet = (win) => {
    return isAndroid(win) && !testUserAgent(win, /mobile/i);
};
const isPhablet = (win) => {
    const width = win.innerWidth;
    const height = win.innerHeight;
    const smallest = Math.min(width, height);
    const largest = Math.max(width, height);
    return (smallest > 390 && smallest < 520) &&
        (largest > 620 && largest < 800);
};
const isTablet = (win) => {
    const width = win.innerWidth;
    const height = win.innerHeight;
    const smallest = Math.min(width, height);
    const largest = Math.max(width, height);
    return (isIpad(win) ||
        isAndroidTablet(win) ||
        ((smallest > 460 && smallest < 820) &&
            (largest > 780 && largest < 1400)));
};
const isMobile = (win) => matchMedia(win, '(any-pointer:coarse)');
const isDesktop = (win) => !isMobile(win);
const isHybrid = (win) => isCordova(win) || isCapacitorNative(win);
const isCordova = (win) => !!(win['cordova'] || win['phonegap'] || win['PhoneGap']);
const isCapacitorNative = (win) => {
    const capacitor = win['Capacitor'];
    return !!(capacitor && capacitor.isNative);
};
const isElectron = (win) => testUserAgent(win, /electron/i);
const isPWA = (win) => !!(win.matchMedia('(display-mode: standalone)').matches || win.navigator.standalone);
const testUserAgent = (win, expr) => expr.test(win.navigator.userAgent);
const matchMedia = (win, query) => win.matchMedia(query).matches;
const PLATFORMS_MAP = {
    'ipad': isIpad,
    'iphone': isIphone,
    'ios': isIOS,
    'android': isAndroid,
    'phablet': isPhablet,
    'tablet': isTablet,
    'cordova': isCordova,
    'capacitor': isCapacitorNative,
    'electron': isElectron,
    'pwa': isPWA,
    'mobile': isMobile,
    'mobileweb': isMobileWeb,
    'desktop': isDesktop,
    'hybrid': isHybrid
};

class StripeWeb extends core.WebPlugin {
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
            this.notifyListeners(exports.PaymentSheetEventsEnum.FailedToLoad, null);
            return;
        }
        this.paymentSheet = document.createElement('stripe-payment-sheet');
        (_a = document.querySelector('body')) === null || _a === void 0 ? void 0 : _a.appendChild(this.paymentSheet);
        await customElements.whenDefined('stripe-payment-sheet');
        this.paymentSheet.publishableKey = this.publishableKey;
        this.paymentSheet.intentClientSecret =
            options.paymentIntentClientSecret;
        this.paymentSheet.intentType = "payment";
        this.notifyListeners(exports.PaymentSheetEventsEnum.Loaded, null);
    }
    async presentPaymentSheet() {
        if (!this.paymentSheet) {
            throw new Error();
        }
        const props = await this.paymentSheet.present();
        if (props === undefined) {
            this.notifyListeners(exports.PaymentSheetEventsEnum.Canceled, null);
            return {
                paymentResult: exports.PaymentSheetEventsEnum.Canceled,
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
            this.notifyListeners(exports.PaymentSheetEventsEnum.Failed, null);
            return {
                paymentResult: exports.PaymentSheetEventsEnum.Failed,
            };
        }
        this.notifyListeners(exports.PaymentSheetEventsEnum.Completed, null);
        return {
            paymentResult: exports.PaymentSheetEventsEnum.Completed,
        };
    }
    async createPaymentFlow(options) {
        var _a;
        if (!this.publishableKey) {
            this.notifyListeners(exports.PaymentFlowEventsEnum.FailedToLoad, null);
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
        this.notifyListeners(exports.PaymentFlowEventsEnum.Loaded, null);
    }
    async presentPaymentFlow() {
        if (!this.paymentSheet) {
            throw new Error();
        }
        this.notifyListeners(exports.PaymentFlowEventsEnum.Opened, null);
        const props = await this.paymentSheet.present().catch(() => undefined);
        if (props === undefined) {
            this.notifyListeners(exports.PaymentFlowEventsEnum.Canceled, null);
            throw new Error();
        }
        const { detail: { stripe, cardNumberElement }, } = props;
        const { token } = await stripe.createToken(cardNumberElement);
        if (token === undefined || token.card === undefined) {
            throw new Error();
        }
        this.flowStripe = stripe;
        this.flowCardNumberElement = cardNumberElement;
        this.notifyListeners(exports.PaymentFlowEventsEnum.Created, {
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
            this.notifyListeners(exports.PaymentFlowEventsEnum.Failed, null);
        }
        this.paymentSheet.updateProgress('success');
        this.paymentSheet.remove();
        this.notifyListeners(exports.PaymentFlowEventsEnum.Completed, null);
        return {
            paymentResult: exports.PaymentFlowEventsEnum.Completed,
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

var web = /*#__PURE__*/Object.freeze({
    __proto__: null,
    StripeWeb: StripeWeb
});

exports.Stripe = Stripe;
//# sourceMappingURL=plugin.cjs.js.map
