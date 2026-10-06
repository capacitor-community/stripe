import { JsonPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { disabled, form, FormField, required } from '@angular/forms/signals';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { BillingService } from './billing.service';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.page.html',
  imports: [
    JsonPipe,
    FormField,
    IonButton,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonTitle,
    IonToolbar,
  ],
})
// eslint-disable-next-line @rdlabo/rules/require-viewmodel -- Billing listeners live in the root service; this standalone demo does not depend on ViewModelStore.
export class BillingPage {
  readonly billing = inject(BillingService);
  readonly model = signal({ token: '' });
  readonly credentials = form(this.model, (path) => {
    required(path.token, { message: 'Enter the demo token.' });
    disabled(
      path.token,
      () =>
        this.billing.busy() ||
        this.billing.connected() ||
        !this.billing.supported,
    );
  });

  readonly vm = new BillingViewModel(this);
}

class BillingViewModel {
  constructor(readonly component: BillingPage) {}

  async connect(): Promise<void> {
    if (
      !this.component.billing.supported ||
      this.component.billing.connected() ||
      this.component.billing.busy() ||
      this.component.credentials().invalid()
    )
      return;
    return this.component.billing
      .connect(this.component.model().token)
      .finally(() => this.component.model.set({ token: '' }));
  }

  disableHandler(event: Event, work: Promise<void>): Promise<void> {
    event.preventDefault();
    // The service's busy signal disables all controls until the operation settles.
    return work;
  }
}
