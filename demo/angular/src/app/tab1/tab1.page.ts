import { Component } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { Stripe } from '@capacitor-community/stripe';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements ViewWillEnter {

  constructor() {}

  ionViewWillEnter() {
    Stripe.createPaymentSheet({
      paymentIntentUrl: environment.api + 'payment-sheet',
      customerUrl: '',
    });
  }

  presentPaymentSheet() {
    Stripe.presentPaymentSheet();
  }
}
