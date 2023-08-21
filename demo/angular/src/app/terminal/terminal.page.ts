import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { HelperService } from '../shared/helper.service';
import { StripeTerminal, TerminalConnectType } from '@capacitor-community/stripe-terminal';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.page.html',
  styleUrls: ['./terminal.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class TerminalPage {

  constructor(
    private http: HttpClient,
    private helper: HelperService,
  ) { }

  async initialize() {
    await StripeTerminal.initialize({ tokenProviderEndpoint: environment.api + 'connection/token' });
  }

  async connect() {
    const { locationId } = await firstValueFrom(this.http.post<{
      locationId: string;
    }>(environment.api + 'connection/location', {}))
      // .catch(async (e) => {
      //   await this.helper.updateItem(this.eventItems,'HttpClient', false);
      //   throw e;
      // });

    const result = await StripeTerminal.discoverReaders({
      type: TerminalConnectType.TapToPay,
      locationId: locationId,
    });
    await StripeTerminal.connectReader({
      reader: result.readers[0],
    });
  }

  async collect() {
    const { paymentIntent } = await firstValueFrom(this.http.post<{
      paymentIntent: string;
    }>(environment.api + 'connection/intent', {}))
    // .catch(async (e) => {
    //   await this.helper.updateItem(this.eventItems,'HttpClient', false);
    //   throw e;
    // });
    await StripeTerminal.collect({ paymentIntent });
  }
}
