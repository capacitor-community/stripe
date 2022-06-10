import { Component } from '@angular/core';
import { PaymentSheetEventsEnum, Stripe } from '../../../../../dist/esm';
import { ITestItems } from '../shared/interfaces';
import { environment } from '../../environments/environment';
import { first } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { HelperService } from '../shared/helper.service';
import { PluginListenerHandle } from '@capacitor/core';

const happyPathItems: ITestItems [] = [
  {
    type: 'method',
    name: 'HttpClient',
  },
  {
    type: 'method',
    name: 'createPaymentSheet',
  },
  {
    type: 'event',
    name: PaymentSheetEventsEnum.Loaded,
  },
  {
    type: 'event',
    name: PaymentSheetEventsEnum.Completed,
  },
  {
    type: 'method',
    name: 'presentPaymentSheet',
    expect: [PaymentSheetEventsEnum.Completed],
  },
];

const cancelPathItems: ITestItems [] = [
  {
    type: 'method',
    name: 'HttpClient',
  },
  {
    type: 'method',
    name: 'createPaymentSheet',
  },
  {
    type: 'event',
    name: PaymentSheetEventsEnum.Loaded,
  },
  {
    type: 'event',
    name: PaymentSheetEventsEnum.Canceled,
  },
  {
    type: 'method',
    name: 'presentPaymentSheet',
    expect: [PaymentSheetEventsEnum.Canceled],
  },
];

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  public eventItems: ITestItems [] = [];
  private readonly listenerHandlers: PluginListenerHandle[] = [];

  constructor(
    private http: HttpClient,
    private helper: HelperService,
  ) {}

  async create(type: 'happyPath' | 'cancelPath') {
    const eventKeys = Object.keys(PaymentSheetEventsEnum);
    eventKeys.forEach(key => {
      const handler = Stripe.addListener(PaymentSheetEventsEnum[key], (value) => {
        this.helper.updateItem(this.eventItems, PaymentSheetEventsEnum[key], true, value);
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

    await Stripe.createPaymentSheet({
      paymentIntentClientSecret: paymentIntent,
      customerEphemeralKeySecret: ephemeralKey,
      customerId: customer,
      merchantDisplayName: 'rdlabo',
    })
      .then(() => this.helper.updateItem(this.eventItems,'createPaymentSheet', true))
      .catch(() => this.helper.updateItem(this.eventItems,'createPaymentSheet', false));

    await Stripe.presentPaymentSheet()
      .then((data) => this.helper.updateItem(this.eventItems,'presentPaymentSheet', undefined, data.paymentResult))
      .catch(() => this.helper.updateItem(this.eventItems,'presentPaymentSheet', false));

    this.listenerHandlers.forEach(handler => handler.remove());
  }
}
