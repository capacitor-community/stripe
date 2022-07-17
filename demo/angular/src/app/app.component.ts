import { Component } from '@angular/core';
import { Stripe } from '../../../../dist/esm';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor() {
    Stripe.initialize({
      publishableKey: 'pk_test_51KFDksKRG9PRcrzzFTufGURQI0o6bpWmfKE2j38nn0bTHIrLDq0nWyD4j6Y6weguOBJL4y5qrmPJCWzGKioy4uOX00icJMyhaP',

      /**
       * Danger: This is production environment using production key.
       * For testing ApplePay and GooglePay, but If it fails, payment will occur.
       */
      // publishableKey: 'pk_live_51KFDksKRG9PRcrzztDRkrFSon0jOxWuQ77zd2URAyn3sy4Dn1EST360KnM6ElTlAerKOBvi27J4SPlKd2rG4SNAZ00n0f3mEbg',
    });
  }
}
