import {
  Component,
  ElementRef,
  viewChild,
  inject,
  input,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PluginListenerHandle } from '@capacitor/core';
import {
  EmbeddedPaymentElement,
  type MountedEmbeddedPaymentElement,
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
  readonly host = viewChild.required<ElementRef<HTMLElement>>('paymentHost');
  readonly phase = signal<'idle' | 'working' | 'mounted'>('idle');
  readonly ready = signal(false);
  readonly height = signal(180);
  readonly message = signal('');
  readonly eventItems = signal<ITestItems[]>([]);
  #http = inject(HttpClient);
  #helper = inject(HelperService);
  #session = 0;
  #listener?: PluginListenerHandle;
  #mounting?: Promise<MountedEmbeddedPaymentElement>;

  constructor() {
    addIcons({ checkmarkCircle, notificationsCircleOutline, playOutline });
  }

  async mount(
    expected?:
      | EmbeddedPaymentElementEventsEnum.Completed
      | EmbeddedPaymentElementEventsEnum.Canceled,
  ) {
    const session = ++this.#session;
    this.phase.set('working');
    this.height.set(180);
    this.message.set('');
    this.eventItems.set(
      expected
        ? [
            { type: 'method', name: 'HttpClient' },
            { type: 'method', name: 'EmbeddedPaymentElement.create' },
            { type: 'event', name: EmbeddedPaymentElementEventsEnum.Change },
            {
              type: 'method',
              name: 'confirm',
              expect: [expected],
            },
            { type: 'method', name: 'destroy' },
          ]
        : [],
    );
    const order = { amount: 1099, currency: 'usd' };
    let step = 'HttpClient';
    try {
      const { paymentIntent } = await firstValueFrom(
        this.#http.post<{ paymentIntent: string }>(
          environment.api + 'intent/without-customer',
          order,
        ),
      );
      if (session !== this.#session) return;
      this.#helper.updateItem(this.eventItems, step, true);
      step = 'EmbeddedPaymentElement.create';
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
      this.#mounting = EmbeddedPaymentElement.create(
        this.host().nativeElement,
        {
          ...order,
          merchantDisplayName: 'rdlabo',
          paymentIntentClientSecret: paymentIntent,
        },
      );
      await this.#mounting;
      if (session !== this.#session) return;
      this.phase.set('mounted');
      this.#helper.updateItem(this.eventItems, step, true);
    } catch {
      if (session !== this.#session) return;
      this.#helper.updateItem(this.eventItems, step, false);
      this.message.set('Could not mount the payment element.');
      await this.destroy();
    }
  }

  async confirm() {
    const session = this.#session;
    this.phase.set('working');
    const result = await this.#mounting
      ?.then((element) => element.confirm())
      .catch(() => undefined);
    if (session !== this.#session) return;
    const paymentResult = result?.paymentResult;
    this.message.set(paymentResult ?? 'Confirmation failed.');
    this.#helper.updateItem(
      this.eventItems,
      'confirm',
      !!result,
      paymentResult,
    );
    if (paymentResult === this.events.Completed) this.ready.set(false);
    if (this.scenarios()) await this.destroy();
    else this.phase.set('mounted');
  }

  async destroy() {
    const session = ++this.#session;
    const listener = this.#listener;
    this.#listener = undefined;
    const mounting = this.#mounting;
    this.#mounting = undefined;
    this.ready.set(false);
    this.phase.set('working');
    try {
      const [, destroyed] = await Promise.all([
        listener?.remove(),
        mounting?.then(
          async (element) => {
            await element.destroy();
            return true;
          },
          () => false,
        ),
      ]);
      if (destroyed && session === this.#session)
        this.#helper.updateItem(this.eventItems, 'destroy', true);
    } catch {
      if (session === this.#session) {
        this.message.set('Could not destroy the payment element.');
        this.#helper.updateItem(this.eventItems, 'destroy', false);
      }
    } finally {
      if (session === this.#session) this.phase.set('idle');
    }
  }
}
