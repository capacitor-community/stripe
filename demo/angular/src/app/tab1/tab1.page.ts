import {Component, OnInit} from '@angular/core';
import {ApplePayEventsEnum, PaymentFlowEventsEnum, PaymentSheetEventsEnum, Stripe} from '../../../../../dist/esm';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {first} from 'rxjs/operators';
import {GooglePayEventsEnum} from '../../../../../src/googlepay';

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

    Stripe.isApplePayAvailable().then(() => this.isApplePayAvailable = true);

    /** ------------------------------------------------------------------- **/

    Stripe.addListener(GooglePayEventsEnum.Loaded, () => {
      this.processGooglePay = 'Ready';
      console.log('ApplePayEventsEnum.Loaded');
    });

    Stripe.addListener(GooglePayEventsEnum.FailedToLoad, () => {
      console.log('ApplePayEventsEnum.FailedToLoad');
    });

    Stripe.addListener(GooglePayEventsEnum.Completed, () => {
      this.processGooglePay = 'willReady';
      console.log('ApplePayEventsEnum.Completed');
    });

    Stripe.addListener(GooglePayEventsEnum.Canceled, () => {
      this.processGooglePay = 'willReady';
      console.log('ApplePayEventsEnum.Canceled');
    });

    Stripe.addListener(GooglePayEventsEnum.Failed, () => {
      this.processGooglePay = 'willReady';
      console.log('ApplePayEventsEnum.Failed');
    });

    Stripe.isGooglePayAvailable().then(() => this.isGooglePayAvailable = true);
  }

  async createPaymentSheet() {
    const { paymentIntent, ephemeralKey, customer } = await this.http.post<{
      paymentIntent: string;
      ephemeralKey: string;
      customer: string;
    }>(environment.api + 'payment-sheet', {}).pipe(first()).toPromise(Promise);

    await Stripe.createPaymentSheet({
      paymentIntentClientSecret: paymentIntent,
      customerEphemeralKeySecret: ephemeralKey,
      customerId: customer,
      merchantDisplayName: 'rdlabo',
    });
  }

  presentPaymentSheet() {
    Stripe.presentPaymentSheet();
  }

  async createPaymentFlow() {
    const { paymentIntent, ephemeralKey, customer } = await this.http.post<{
      paymentIntent: string;
      ephemeralKey: string;
      customer: string;
    }>(environment.api + 'payment-sheet', {}).pipe(first()).toPromise(Promise);

    await Stripe.createPaymentFlow({
      paymentIntentClientSecret: paymentIntent,
      customerEphemeralKeySecret: ephemeralKey,
      customerId: customer,
      merchantDisplayName: 'rdlabo',
    });
  }

  presentPaymentFlow() {
    Stripe.presentPaymentFlow();
  }

  confirmPaymentFlow() {
    Stripe.confirmPaymentFlow();
  }

  async createApplePay() {
    const { paymentIntent } = await this.http.post<{
      paymentIntent: string;
    }>(environment.api + 'payment-sheet', {}).pipe(first()).toPromise(Promise);

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
    Stripe.presentApplePay();
  }

  async createGooglePay() {
    const { paymentIntent } = await this.http.post<{
      paymentIntent: string;
    }>(environment.api + 'payment-sheet', {}).pipe(first()).toPromise(Promise);

    await Stripe.createGooglePay({
      paymentIntentClientSecret: paymentIntent,
    });
  }

  presentGooglePay() {
    Stripe.presentGooglePay();
  }
}
