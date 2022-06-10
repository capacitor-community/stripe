import { Component } from '@angular/core';
import {ITestItems} from '../shared/interfaces';
import {PaymentFlowEventsEnum, Stripe} from '../../../../../dist/esm';
import {PluginListenerHandle} from '@capacitor/core';
import {HttpClient} from '@angular/common/http';
import {HelperService} from '../shared/helper.service';
import {environment} from '../../environments/environment';
import {first} from 'rxjs/operators';

const happyPathItems: ITestItems [] = [
  {
    type: 'method',
    name: 'HttpClient',
  },
  {
    type: 'method',
    name: 'createPaymentFlow',
  },
  {
    type: 'event',
    name: PaymentFlowEventsEnum.Loaded,
  },
  {
    type: 'method',
    name: 'presentPaymentFlow',
  },
  {
    type: 'event',
    name: PaymentFlowEventsEnum.Opened,
  },
  {
    type: 'event',
    name: PaymentFlowEventsEnum.Created,
  },
  {
    type: 'event',
    name: PaymentFlowEventsEnum.Completed,
  },
  {
    type: 'method',
    name: 'confirmPaymentFlow',
    expect: [PaymentFlowEventsEnum.Completed],
  },
];

const cancelPathItems: ITestItems [] = [
  {
    type: 'method',
    name: 'HttpClient',
  },
  {
    type: 'method',
    name: 'createPaymentFlow',
  },
  {
    type: 'event',
    name: PaymentFlowEventsEnum.Loaded,
  },
  {
    type: 'event',
    name: PaymentFlowEventsEnum.Canceled,
  },
  {
    type: 'method',
    name: 'presentPaymentFlow',
  },
];

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  public eventItems: ITestItems [] = [];
  private readonly listenerHandlers: PluginListenerHandle[] = [];

  constructor(
    private http: HttpClient,
    private helper: HelperService,
  ) {}

  async create(type: 'happyPath' | 'cancelPath') {
    const eventKeys = Object.keys(PaymentFlowEventsEnum);
    eventKeys.forEach(key => {
      const handler = Stripe.addListener(PaymentFlowEventsEnum[key], (value) => {
        this.helper.updateItem(this.eventItems, PaymentFlowEventsEnum[key], true, value);
      });
      this.listenerHandlers.push(handler);
    });

    if (type === 'happyPath') {
      this.eventItems =  JSON.parse(JSON.stringify(happyPathItems));
    } else {
      this.eventItems =  JSON.parse(JSON.stringify(cancelPathItems));
    }

    const { paymentIntent, ephemeralKey, customer } = await this.http.post<{
      paymentIntent: string;
      ephemeralKey: string;
      customer: string;
    }>(environment.api + 'intent', {}).pipe(first()).toPromise(Promise)
      .catch(async (e) => {
        await this.helper.updateItem(this.eventItems,'HttpClient', false);
        throw e;
      });

    await this.helper.updateItem(this.eventItems,'HttpClient', true);

    await Stripe.createPaymentFlow({
      paymentIntentClientSecret: paymentIntent,
      customerEphemeralKeySecret: ephemeralKey,
      customerId: customer,
      merchantDisplayName: 'rdlabo',
    })
      .then(() => this.helper.updateItem(this.eventItems,'createPaymentFlow', true))
      .catch(() => this.helper.updateItem(this.eventItems,'createPaymentFlow', false));

    if (type === 'happyPath') {
      await Stripe.presentPaymentFlow()
        .then((data) => this.helper.updateItem(this.eventItems, 'presentPaymentFlow', data.hasOwnProperty('cardNumber')))
        .catch(() => this.helper.updateItem(this.eventItems, 'presentPaymentFlow', false));

      await Stripe.confirmPaymentFlow()
        .then((data) => this.helper.updateItem(this.eventItems, 'confirmPaymentFlow', undefined, data.paymentResult))
        .catch(() => this.helper.updateItem(this.eventItems, 'confirmPaymentFlow', false));
    } else {
      await Stripe.presentPaymentFlow()
        .then((data) => this.helper.updateItem(this.eventItems, 'presentPaymentFlow', false))
        .catch(() => this.helper.updateItem(this.eventItems, 'presentPaymentFlow', true));
    }

    this.listenerHandlers.forEach(handler => handler.remove());
  }
}
