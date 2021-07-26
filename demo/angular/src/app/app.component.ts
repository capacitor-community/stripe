import { Component } from '@angular/core';
import {Stripe} from '../../../../dist/esm';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor() {
    Stripe.initialize({
      publishableKey: 'pk_test_YssveZBA1kucfaTfZbeDwauN',
    });
  }
}
