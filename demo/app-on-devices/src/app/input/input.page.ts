import { Component, inject } from '@angular/core';
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
} from '@ionic/angular/standalone';
import { AmountService } from '../amount.service';
import { Try15secPage } from '../game/try15sec/try15sec.page';

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
        // TODO
      }
    }


    if (this.platform.is('hybrid')) {
      // TODO
    } else {
      this.navCtrl.navigateRoot('/receipt');
    }
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
    })
  }
}
