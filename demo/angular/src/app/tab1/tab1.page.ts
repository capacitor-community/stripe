import {Component} from '@angular/core';
import {ViewWillEnter} from '@ionic/angular';
import {PaymentSheetEventsEnum, Stripe} from '@capacitor-community/stripe';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {first} from 'rxjs/operators';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements ViewWillEnter {

  constructor(
    private http: HttpClient,
  ) {}

  async ionViewWillEnter() {
    const { paymentIntent, ephemeralKey, customer } = await this.http.post<{
      paymentIntent: string;
      ephemeralKey: string;
      customer: string;
    }>(environment.api + 'payment-sheet', {}).pipe(first()).toPromise(Promise);

    Stripe.addListener(PaymentSheetEventsEnum.Loaded, () => {
      console.log('PaymentSheetEventsEnum.Loaded');
    });

    Stripe.addListener(PaymentSheetEventsEnum.FailedToLoad, () => {
      console.log('PaymentSheetEventsEnum.FailedToLoad');
    });

    Stripe.addListener(PaymentSheetEventsEnum.Completed, () => {
      console.log('PaymentSheetEventsEnum.Completed');
    });

    Stripe.addListener(PaymentSheetEventsEnum.Canceled, () => {
      console.log('PaymentSheetEventsEnum.Canceled');
    });

    Stripe.addListener(PaymentSheetEventsEnum.Failed, () => {
      console.log('PaymentSheetEventsEnum.Failed');
    });

    Stripe.createPaymentSheet({
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
