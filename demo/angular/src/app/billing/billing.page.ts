import { Component, inject } from '@angular/core';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle,
  notificationsCircleOutline,
  playOutline,
} from 'ionicons/icons';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { BillingService } from './billing.service';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.page.html',
  imports: [
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonTitle,
    IonToolbar,
  ],
})
// eslint-disable-next-line @rdlabo/rules/require-viewmodel -- Billing scenarios and listeners live in the root service, like the other demo pages.
export class BillingPage {
  readonly billing = inject(BillingService);

  constructor() {
    addIcons({ playOutline, notificationsCircleOutline, checkmarkCircle });
  }
}
