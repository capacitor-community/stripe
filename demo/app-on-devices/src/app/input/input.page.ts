import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonRow,
  IonToolbar,
  NavController,
  Platform,
  AlertController,
  ModalController,
  LoadingController,
} from '@ionic/angular/standalone';
import { AmountService } from '../amount.service';
import { Try15secPage } from '../game/try15sec/try15sec.page';
import { StripeTerminal } from '@capacitor-community/stripe-terminal';

@Component({
  selector: 'app-input',
  templateUrl: './input.page.html',
  styleUrls: ['./input.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonBackButton,
    IonButtons,
    IonButton,
    IonFooter,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
  ],
})
export class InputPage {
  readonly platform = inject(Platform);
  readonly alertCtrl = inject(AlertController);
  readonly navCtrl = inject(NavController);
  readonly loadingCtrl = inject(LoadingController);
  readonly modalCtrl = inject(ModalController);
  readonly amountService = inject(AmountService);

  async requestPayment() {
    if (await this.confirmChallenge()) {
      const modal = await this.modalCtrl.create({
        component: Try15secPage,
        backdropDismiss: false,
      });
      await modal.present();
      const { data } = await modal.onWillDismiss<boolean>();
      if (data) {
        const half = Number.parseInt(this.amountService.input(), 10);
        this.amountService.input.set(String(Math.floor(half / 2)));
      }
    }

    if (this.platform.is('hybrid')) {
      await this.runPayment();
    }
    await this.navCtrl.navigateRoot('/receipt');
  }

  async runPayment() {
    const loading = await this.loadingCtrl.create({
      message: 'Create paymentIntent...',
    });
    await loading.present();
    const { paymentIntent } = await this.amountService.createPaymentIntent(
      Number.parseInt(this.amountService.input(), 10),
    );
    loading.message = 'Collect PaymentMethod';
    await StripeTerminal.collectPaymentMethod({ paymentIntent });
    loading.message = 'Confirm PaymentIntent';
    await StripeTerminal.confirmPaymentIntent();
    await loading.dismiss();
  }

  async confirmChallenge() {
    return new Promise(async (resolve) => {
      const alert = await this.alertCtrl.create({
        header: '15-Second Challenge',
        subHeader: 'Stop the timer at exactly 15 seconds.',
        message: 'Think you can do it?',
        buttons: [
          {
            text: `Not now`,
            role: 'cancel',
            handler: () => resolve(false),
          },
          {
            text: 'Start challenge',
            handler: () => resolve(true),
          },
        ],
      });
      await alert.present();
    });
  }
}
