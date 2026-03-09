import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import {
  StripeTerminal,
  TerminalConnectTypes,
  TerminalEventsEnum,
} from '@capacitor-community/stripe-terminal';
import { environment } from '../environments/environment'
import { AmountService } from './amount.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit, OnDestroy {
  readonly amount = inject(AmountService);
  readonly platform = inject(Platform);
  async ngOnInit() {
    if (this.platform.is('hybrid')) {
      await StripeTerminal.initialize({
        tokenProviderEndpoint: environment.api + 'connection/token',
        isTest: true,
      });
      /**
       * TODO: For some reason, `discoverReaders` is not returning,
       *       so I'm getting them from the Listener.
       *       I need to investigate the differences compared to others.
       */
      const listener = await StripeTerminal.addListener(
        TerminalEventsEnum.DiscoveredReaders,
        async ({ readers }) => {
          await listener.remove();
          await StripeTerminal.connectReader({
            reader: readers[0],
          });
          this.amount.isReady.set(true);
        },
      );
      await StripeTerminal.discoverReaders({
        type: TerminalConnectTypes.HandOff,
        locationId: 'tml_GLtRqww2teK7X0',
      });
    } else {
      this.amount.isReady.set(true);
    }
  }

  ngOnDestroy() {
    if (this.amount.isReady()) {
      StripeTerminal.disconnectReader().then();
    }
  }
}
