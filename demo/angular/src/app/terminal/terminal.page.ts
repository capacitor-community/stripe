import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {HttpClient} from '@angular/common/http';
import {HelperService} from '../shared/helper.service';
import {StripeTerminal, TerminalConnectType} from '@capacitor-community/stripe-terminal';
import {environment} from '../../environments/environment';
import {first} from 'rxjs/operators';

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
    const { locationId } = await this.http.post<{
      locationId: string;
    }>(environment.api + 'connection/location', {}).pipe(first()).toPromise(Promise)
      // .catch(async (e) => {
      //   await this.helper.updateItem(this.eventItems,'HttpClient', false);
      //   throw e;
      // });

    await StripeTerminal.connect({
      type: TerminalConnectType.TapToPay,
      locationId: locationId,
    });
  }

  async collect() {
    const { paymentIntent } = await this.http.post<{
      paymentIntent: string;
    }>(environment.api + 'connection/intent', {}).pipe(first()).toPromise(Promise)
    // .catch(async (e) => {
    //   await this.helper.updateItem(this.eventItems,'HttpClient', false);
    //   throw e;
    // });
    await StripeTerminal.collect({ paymentIntent });
  }
}
