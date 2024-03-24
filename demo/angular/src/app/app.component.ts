import { Component } from '@angular/core';
import { Stripe } from '@capacitor-community/stripe';
import { StripeIdentity } from '@capacitor-community/stripe-identity';
import { IonApp, IonRouterOutlet } from "@ionic/angular/standalone";

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
    standalone: true,
    imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
    constructor() {
        Stripe.initialize({
            publishableKey: 'pk_test_51MmARtKzMYim9cy3tOI5vOdHbai4G26V1AiDJmiE4aiAXc8BaSzh9Z0b0f8Novn0Jyyi8JqNdzLzcI2rUGT4g8ct00gfUVdLuM',

            /**
             * Danger: This is production environment using production key.
             * For testing ApplePay and GooglePay, but If it fails, payment will occur.
             */
            // publishableKey: 'pk_live_51KFDksKRG9PRcrzztDRkrFSon0jOxWuQ77zd2URAyn3sy4Dn1EST360KnM6ElTlAerKOBvi27J4SPlKd2rG4SNAZ00n0f3mEbg',
        });
        StripeIdentity.initialize({
            publishableKey: 'pk_test_51MmARtKzMYim9cy3tOI5vOdHbai4G26V1AiDJmiE4aiAXc8BaSzh9Z0b0f8Novn0Jyyi8JqNdzLzcI2rUGT4g8ct00gfUVdLuM',
        });
    }
}
