import { Component, inject, input, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PluginListenerHandle } from '@capacitor/core';
import {
  EmbeddedPaymentElementEventsEnum,
  Stripe,
} from '@capacitor-community/stripe';
import {
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle,
  notificationsCircleOutline,
  playOutline,
} from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { HelperService } from '../shared/helper.service';
import { ITestItems } from '../shared/interfaces';

@Component({
  selector: 'app-embedded-controls',
  templateUrl: 'embedded-controls.component.html',
  imports: [IonList, IonListHeader, IonItem, IonLabel, IonIcon],
})
export class EmbeddedControlsComponent {
  readonly events = EmbeddedPaymentElementEventsEnum;
  readonly scenarios = input(false);
  readonly selector = () =>
    this.scenarios() ? '#embedded-scenario' : '#embedded-demo';
  readonly active = signal(false);
  readonly busy = signal(false);
  readonly ready = signal(false);
  readonly height = signal(180);
  readonly message = signal('');
  readonly eventItems = signal<ITestItems[]>([]);
  #http = inject(HttpClient);
  #helper = inject(HelperService);
  #session = 0;
  #listener?: PluginListenerHandle;
  #mounting?: Promise<void>;

  constructor() {
    addIcons({ checkmarkCircle, notificationsCircleOutline, playOutline });
  }

  async mount(
    expected?:
      | EmbeddedPaymentElementEventsEnum.Completed
      | EmbeddedPaymentElementEventsEnum.Canceled,
  ) {
    const session = ++this.#session;
    this.active.set(true);
    this.busy.set(true);
    this.height.set(180);
    this.message.set('');
    this.eventItems.set(
      expected
        ? [
            { type: 'method', name: 'HttpClient' },
            { type: 'method', name: 'mountEmbeddedPaymentElement' },
            { type: 'event', name: EmbeddedPaymentElementEventsEnum.Change },
            {
              type: 'method',
              name: 'confirmEmbeddedPaymentElement',
              expect: [expected],
            },
            { type: 'method', name: 'unmountEmbeddedPaymentElement' },
          ]
        : [],
    );
    let step = 'HttpClient';
    try {
      const { paymentIntent } = await firstValueFrom(
        this.#http.post<{ paymentIntent: string }>(
          environment.api + 'intent/without-customer',
          { amount: 1099, currency: 'usd' },
        ),
      );
      if (session !== this.#session) return;
      this.#helper.updateItem(this.eventItems, step, true);
      step = 'mountEmbeddedPaymentElement';
      const listener = await Stripe.addListener(
        EmbeddedPaymentElementEventsEnum.Change,
        ({ ready, height }) => {
          if (session !== this.#session) return;
          this.ready.set(ready);
          if (height && height > 0) this.height.set(height);
          this.#helper.updateItem(
            this.eventItems,
            EmbeddedPaymentElementEventsEnum.Change,
            true,
          );
        },
      );
      if (session !== this.#session) {
        await listener.remove();
        return;
      }
      this.#listener = listener;
      this.#mounting = Stripe.mountEmbeddedPaymentElement({
        selector: this.selector(),
        amount: 1099,
        currency: 'usd',
        merchantDisplayName: 'rdlabo',
        paymentIntentClientSecret: paymentIntent,
      });
      await this.#mounting;
      if (session === this.#session)
        this.#helper.updateItem(this.eventItems, step, true);
    } catch {
      if (session !== this.#session) return;
      this.#helper.updateItem(this.eventItems, step, false);
      this.message.set('Could not mount the payment element.');
      await this.destroy();
    } finally {
      if (session === this.#session) this.busy.set(false);
    }
  }

  async confirm() {
    const session = this.#session;
    this.busy.set(true);
    try {
      const { paymentResult } = await Stripe.confirmEmbeddedPaymentElement();
      if (session !== this.#session) return;
      this.message.set(paymentResult);
      this.#helper.updateItem(
        this.eventItems,
        'confirmEmbeddedPaymentElement',
        true,
        paymentResult,
      );
      if (paymentResult === EmbeddedPaymentElementEventsEnum.Completed)
        this.ready.set(false);
    } catch {
      if (session !== this.#session) return;
      this.message.set('Confirmation failed.');
      this.#helper.updateItem(
        this.eventItems,
        'confirmEmbeddedPaymentElement',
        false,
      );
    } finally {
      if (session === this.#session) {
        if (this.scenarios()) await this.destroy();
        else this.busy.set(false);
      }
    }
  }

  async destroy() {
    const session = ++this.#session;
    const listener = this.#listener;
    this.#listener = undefined;
    const mounting = this.#mounting;
    this.#mounting = undefined;
    this.ready.set(false);
    this.busy.set(true);
    try {
      const [, destroyed] = await Promise.all([
        listener?.remove(),
        mounting?.then(
          async () => {
            await Stripe.unmountEmbeddedPaymentElement();
            return true;
          },
          () => false,
        ),
      ]);
      if (destroyed && session === this.#session)
        this.#helper.updateItem(
          this.eventItems,
          'unmountEmbeddedPaymentElement',
          true,
        );
    } catch {
      if (session === this.#session) {
        this.message.set('Could not destroy the payment element.');
        this.#helper.updateItem(
          this.eventItems,
          'unmountEmbeddedPaymentElement',
          false,
        );
      }
    } finally {
      if (session === this.#session) {
        this.active.set(false);
        this.busy.set(false);
      }
    }
  }
}
