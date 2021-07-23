import {Component, OnInit} from '@angular/core';
import {PaymentSheetEventsEnum, Stripe} from '@capacitor-community/stripe';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {first} from 'rxjs/operators';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  process: 'willReady' | 'Ready' = 'willReady';

  constructor(
    private http: HttpClient,
  ) {
  }

  async ngOnInit() {
    Stripe.addListener(PaymentSheetEventsEnum.Loaded, () => {
      this.process = 'Ready';
      console.log('PaymentSheetEventsEnum.Loaded');
    });

    Stripe.addListener(PaymentSheetEventsEnum.FailedToLoad, () => {
      console.log('PaymentSheetEventsEnum.FailedToLoad');
    });

    Stripe.addListener(PaymentSheetEventsEnum.Completed, () => {
      this.process = 'willReady';
      console.log('PaymentSheetEventsEnum.Completed');
    });

    Stripe.addListener(PaymentSheetEventsEnum.Canceled, () => {
      this.process = 'willReady';
      console.log('PaymentSheetEventsEnum.Canceled');
    });

    Stripe.addListener(PaymentSheetEventsEnum.Failed, () => {
      this.process = 'willReady';
      console.log('PaymentSheetEventsEnum.Failed');
    });
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
      style: 'alwaysDark',
    });
  }

  presentPaymentSheet() {
    Stripe.presentPaymentSheet();
  }
}
