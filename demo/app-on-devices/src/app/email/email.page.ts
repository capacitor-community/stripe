import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonTitle,
  IonToolbar,
  NavController,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-email',
  templateUrl: './email.page.html',
  styleUrls: ['./email.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonInput,
    IonButton,
    IonButtons,
    IonBackButton,
  ],
})
export class EmailPage {
  readonly navCtrl = inject(NavController);
  readonly email = signal<string>('');
  sendEmail() {
    /**
     * Normally, `receipt_email` would be set when creating the PaymentIntent.
     * However, because this is an open-source project, exposing such an API could be abused to send unsolicited emails.
     * Therefore, this functionality is intentionally not included.
     *
     * If you need to implement this, please refer to:
     * https://docs.stripe.com/terminal/features/receipts?locale=ja-JP
     */
    return this.navCtrl.navigateRoot('/home');
  }
}
