import { HttpClient } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { Component, Injectable, inject, signal } from '@angular/core';
import { Stripe } from '@capacitor-community/stripe';
import { PluginListenerHandle } from '@capacitor/core';
import {
  AlertController,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  ViewDidEnter,
  ViewWillLeave,
  IonToolbar,
} from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
class Checkout {
  readonly #alerts = inject(AlertController);
  readonly #http = inject(HttpClient);
  readonly amount = 1099;
  readonly currency = 'USD';
  readonly height = signal(180);
  readonly ready = signal(false);
  readonly paying = signal(false);
  readonly completed = signal(false);
  readonly message = signal('');
  #entry = 0;
  #listener?: PluginListenerHandle;
  #mounting = false;

  async enter() {
    const entry = ++this.#entry;
    this.ready.set(false);
    this.completed.set(false);
    this.paying.set(false);
    this.message.set('Loading payment methods…');
    await this.#mount(entry).catch(() => {
      if (entry === this.#entry)
        this.message.set('Could not load checkout. Go back and try again.');
    });
  }

  async #mount(entry: number) {
    const { paymentIntent } = await firstValueFrom(
      this.#http.post<{ paymentIntent: string }>(
        environment.api + 'intent/without-customer',
        { amount: this.amount, currency: this.currency.toLowerCase() },
      ),
    );
    if (entry !== this.#entry) return;
    const listener = await Stripe.addListener(
      'embeddedPaymentElementChange',
      ({ ready, height }) => {
        if (entry !== this.#entry) return;
        this.ready.set(ready);
        if (height && height > 0) this.height.set(height);
      },
    );
    if (entry !== this.#entry) {
      await listener.remove();
      return;
    }
    this.#listener = listener;
    this.#mounting = true;
    await Stripe.mountEmbeddedPaymentElement({
      selector: '#embedded-payment-methods',
      amount: this.amount,
      currency: this.currency.toLowerCase(),
      merchantDisplayName: 'Demo shop',
      paymentIntentClientSecret: paymentIntent,
    });
    if (entry === this.#entry) this.message.set('');
  }

  async disableHandler(event: Event, operation: Promise<void>) {
    event.preventDefault();
    this.paying.set(true);
    const entry = this.#entry;
    await operation.finally(() => {
      if (entry === this.#entry) this.paying.set(false);
    });
  }

  async showTestCards() {
    const alert = await this.#alerts.create({
      header: 'Stripe test cards',
      message:
        'Use 4242 4242 4242 4242 for a successful payment or 4000 0025 0000 3155 for 3D Secure. Enter any future expiry and any three-digit CVC.',
      buttons: ['Close'],
    });
    await alert.present();
  }

  async pay() {
    const entry = this.#entry;
    await Stripe.confirmEmbeddedPaymentElement().then(
      ({ result }) => {
        if (entry !== this.#entry) return;
        this.completed.set(result === 'completed');
        this.message.set(
          {
            completed: 'Test payment completed.',
            canceled: 'Payment canceled. You can try again.',
            failed: 'Payment failed. Check your payment method and try again.',
          }[result],
        );
      },
      () => {
        if (entry === this.#entry)
          this.message.set('Unable to confirm payment. Please try again.');
      },
    );
  }

  async leave() {
    ++this.#entry;
    const listener = this.#listener;
    this.#listener = undefined;
    const destroy = this.#mounting;
    this.#mounting = false;
    await Promise.all([
      listener?.remove(),
      destroy && Stripe.destroyEmbeddedPaymentElement(),
    ]);
  }
}

@Component({
  providers: [Checkout],
  selector: 'app-embedded-checkout',
  imports: [
    CurrencyPipe,
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"
          ><ion-back-button defaultHref="/tabs/demo"
        /></ion-buttons>
        <ion-title>Custom checkout</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <h2>Order summary</h2>
      <p>Demo notebook · Quantity 1</p>
      <p>
        <strong
          >Total
          {{ checkout.amount / 100 | currency: checkout.currency }}</strong
        >
      </p>
      <ion-button
        type="button"
        fill="clear"
        [disabled]="checkout.paying()"
        (click)="checkout.disableHandler($event, checkout.showTestCards())"
      >
        Test card details
      </ion-button>
      <h2>Payment method</h2>
      <div
        id="embedded-payment-methods"
        [style.height.px]="checkout.height()"
      ></div>
      <p role="status">{{ checkout.message() }}</p>
      <form (submit)="checkout.disableHandler($event, checkout.pay())">
        <ion-button
          type="submit"
          expand="block"
          [disabled]="
            !checkout.ready() || checkout.paying() || checkout.completed()
          "
        >
          Pay {{ checkout.amount / 100 | currency: checkout.currency }}
        </ion-button>
      </form>
    </ion-content>
  `,
})
// eslint-disable-next-line @rdlabo/rules/require-viewmodel -- The page-scoped checkout owns payment state and subscriptions.
export class EmbeddedPage implements ViewDidEnter, ViewWillLeave {
  readonly checkout = inject(Checkout);

  ionViewDidEnter() {
    return this.checkout.enter();
  }
  ionViewWillLeave() {
    return this.checkout.leave();
  }
}
