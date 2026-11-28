import type { ViewWillLeave } from '@ionic/angular/standalone';
import { Component, viewChild } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { EmbeddedControlsComponent } from './embedded-controls.component';

@Component({
  selector: 'app-embedded',
  templateUrl: 'embedded.page.html',
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    EmbeddedControlsComponent,
  ],
})
export class EmbeddedPage implements ViewWillLeave {
  readonly controls = viewChild.required(EmbeddedControlsComponent);
  ionViewWillLeave() {
    return this.controls().destroy();
  }
}
