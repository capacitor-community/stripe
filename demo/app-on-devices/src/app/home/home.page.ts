import { Component, inject} from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonIcon,
  IonButton,
  IonFooter,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import {AmountService} from "../amount.service";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonIcon,
    IonButton,
    IonFooter,
    RouterLink,
  ],
})
export class HomePage implements ViewWillEnter {
  readonly amountService = inject(AmountService);

  ionViewWillEnter() {
    this.amountService.input.set('0');
  }
}
