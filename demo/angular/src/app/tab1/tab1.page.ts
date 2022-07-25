import {Component, OnInit} from '@angular/core';
import {ApplePayEventsEnum, GooglePayEventsEnum, PaymentFlowEventsEnum, PaymentSheetEventsEnum, Stripe} from '@capacitor-community/stripe';

import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {first} from 'rxjs/operators';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  processSheet: 'willReady' | 'Ready' = 'willReady';
  processFlow: 'willReady' | 'Ready' | 'canConfirm' = 'willReady';
  processApplePay: 'willReady' | 'Ready' = 'willReady';
  processGooglePay: 'willReady' | 'Ready' = 'willReady';
  isApplePayAvailable = false;
  isGooglePayAvailable = false;

  constructor(
    private http: HttpClient,
  ) {
  }

  async ngOnInit() {
    Stripe.addListener(PaymentSheetEventsEnum.Loaded, () => {
      this.processSheet = 'Ready';
      console.log('PaymentSheetEventsEnum.Loaded');
    });

    Stripe.addListener(PaymentSheetEventsEnum.FailedToLoad, () => {
      console.log('PaymentSheetEventsEnum.FailedToLoad');
    });

    Stripe.addListener(PaymentSheetEventsEnum.Completed, () => {
      this.processSheet = 'willReady';
      console.log('PaymentSheetEventsEnum.Completed');
    });

    Stripe.addListener(PaymentSheetEventsEnum.Canceled, () => {
      this.processSheet = 'willReady';
      console.log('PaymentSheetEventsEnum.Canceled');
    });

    Stripe.addListener(PaymentSheetEventsEnum.Failed, () => {
      this.processSheet = 'willReady';
      console.log('PaymentSheetEventsEnum.Failed');
    });

    /** ------------------------------------------------------------------- **/

    Stripe.addListener(PaymentFlowEventsEnum.Loaded, () => {
      this.processFlow = 'Ready';
      console.log('PaymentFlowEventsEnum.Loaded');
    });

    Stripe.addListener(PaymentFlowEventsEnum.FailedToLoad, () => {
      console.log('PaymentFlowEventsEnum.FailedToLoad');
    });

    Stripe.addListener(PaymentFlowEventsEnum.Completed, () => {
      this.processFlow = 'willReady';
      console.log('PaymentFlowEventsEnum.Completed');
    });

    Stripe.addListener(PaymentFlowEventsEnum.Canceled, () => {
      this.processFlow = 'willReady';
      console.log('PaymentFlowEventsEnum.Canceled');
    });

    Stripe.addListener(PaymentFlowEventsEnum.Failed, () => {
      this.processFlow = 'willReady';
      console.log('PaymentFlowEventsEnum.Failed');
    });

    Stripe.addListener(PaymentFlowEventsEnum.Created, (info) => {
      console.log(info);
      this.processFlow = 'canConfirm';
    });

    /** ------------------------------------------------------------------- **/

    Stripe.addListener(ApplePayEventsEnum.Loaded, () => {
      this.processApplePay = 'Ready';
      console.log('ApplePayEventsEnum.Loaded');
    });

    Stripe.addListener(ApplePayEventsEnum.FailedToLoad, () => {
      console.log('ApplePayEventsEnum.FailedToLoad');
    });

    Stripe.addListener(ApplePayEventsEnum.Completed, () => {
      this.processApplePay = 'willReady';
      console.log('ApplePayEventsEnum.Completed');
    });

    Stripe.addListener(ApplePayEventsEnum.Canceled, () => {
      this.processApplePay = 'willReady';
      console.log('ApplePayEventsEnum.Canceled');
    });

    Stripe.addListener(ApplePayEventsEnum.Failed, () => {
      this.processApplePay = 'willReady';
      console.log('ApplePayEventsEnum.Failed');
    });

    /** ------------------------------------------------------------------- **/

    Stripe.addListener(GooglePayEventsEnum.Loaded, () => {
      this.processGooglePay = 'Ready';
      console.log('GooglePayEventsEnum.Loaded');
    });

    Stripe.addListener(GooglePayEventsEnum.FailedToLoad, () => {
      console.log('GooglePayEventsEnum.FailedToLoad');
    });

    Stripe.addListener(GooglePayEventsEnum.Completed, () => {
      this.processGooglePay = 'willReady';
      console.log('GooglePayEventsEnum.Completed');
    });

    Stripe.addListener(GooglePayEventsEnum.Canceled, () => {
      this.processGooglePay = 'willReady';
      console.log('GooglePayEventsEnum.Canceled');
    });

    Stripe.addListener(GooglePayEventsEnum.Failed, () => {
      this.processGooglePay = 'willReady';
      console.log('GooglePayEventsEnum.Failed');
    });

    Stripe.isApplePayAvailable().then(() => this.isApplePayAvailable = true).catch(() => undefined);
    Stripe.isGooglePayAvailable().then(() => this.isGooglePayAvailable = true).catch(() => undefined);
  }

  async createPaymentSheet(withCustomer = true) {
    if (withCustomer) {
      const { paymentIntent, ephemeralKey, customer } = await this.http.post<{
        paymentIntent: string;
        ephemeralKey: string;
        customer: string;
      }>(environment.api + 'intent', {}).pipe(first()).toPromise(Promise);

      await Stripe.createPaymentSheet({
        paymentIntentClientSecret: paymentIntent,
        customerEphemeralKeySecret: ephemeralKey,
        customerId: customer,
        merchantDisplayName: 'rdlabo',
      });
    } else {
      const { paymentIntent } = await this.http.post<{
        paymentIntent: string;
      }>(environment.api + 'intent/without-customer', {}).pipe(first()).toPromise(Promise);

      await Stripe.createPaymentSheet({
        paymentIntentClientSecret: paymentIntent,
        merchantDisplayName: 'rdlabo',
      });
    }
  }

  async createPaymentSheetWithSetupIntent() {
    const { setupIntent, ephemeralKey, customer } = await this.http.post<{
      setupIntent: string;
      ephemeralKey: string;
      customer: string;
    }>(environment.api + 'intent/setup', {}).pipe(first()).toPromise(Promise);

    await Stripe.createPaymentSheet({
      setupIntentClientSecret: setupIntent,
      customerEphemeralKeySecret: ephemeralKey,
      customerId: customer,
      merchantDisplayName: 'rdlabo',
      enableGooglePay: true,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      GooglePayIsTesting: true,
    });
  }

  presentPaymentSheet() {
    return Stripe.presentPaymentSheet();
  }

  async createPaymentFlow(withCustomer = true) {
    if (withCustomer) {
      const { paymentIntent, ephemeralKey, customer } = await this.http.post<{
        paymentIntent: string;
        ephemeralKey: string;
        customer: string;
      }>(environment.api + 'intent', {}).pipe(first()).toPromise(Promise);

      await Stripe.createPaymentFlow({
        paymentIntentClientSecret: paymentIntent,
        customerEphemeralKeySecret: ephemeralKey,
        customerId: customer,
        merchantDisplayName: 'rdlabo',
      });
    } else {
      const { paymentIntent } = await this.http.post<{
        paymentIntent: string;
      }>(environment.api + 'intent/without-customer', {}).pipe(first()).toPromise(Promise);

      await Stripe.createPaymentFlow({
        paymentIntentClientSecret: paymentIntent,
        merchantDisplayName: 'rdlabo',
      });
    }
  }

  presentPaymentFlow() {
    return Stripe.presentPaymentFlow();
  }

  confirmPaymentFlow() {
    return Stripe.confirmPaymentFlow();
  }

  async createApplePay() {
    const { paymentIntent } = await this.http.post<{
      paymentIntent: string;
    }>(environment.api + 'intent', {}).pipe(first()).toPromise(Promise);

    await Stripe.createApplePay({
      paymentIntentClientSecret: paymentIntent,
      paymentSummaryItems: [{
        label: 'Product Name',
        amount: 1099.00
      }],
      merchantIdentifier: 'merchant.com.getcapacitor.stripe',
      countryCode: 'US',
      currency: 'USD',
    });
  }

  presentApplePay() {
    return Stripe.presentApplePay();
  }

  async createGooglePay() {
    const { paymentIntent } = await this.http.post<{
      paymentIntent: string;
    }>(environment.api + 'intent', {}).pipe(first()).toPromise(Promise);

    await Stripe.createGooglePay({
      paymentIntentClientSecret: paymentIntent,
      paymentSummaryItems: [{
        label: 'Product Name',
        amount: 1099.00
      }],
      merchantIdentifier: 'merchant.com.getcapacitor.stripe',
      countryCode: 'US',
      currency: 'USD',
    });
  }

  async presentGooglePay() {
    return Stripe.presentGooglePay();
  }
}
