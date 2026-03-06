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
    // TODO: レシート要求
    return this.navCtrl.navigateRoot('/home');
  }
}
