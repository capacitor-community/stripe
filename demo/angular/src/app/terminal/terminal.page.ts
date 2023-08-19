import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {HttpClient} from '@angular/common/http';
import {HelperService} from '../shared/helper.service';
import {StripeTerminal, TerminalConnectType} from '@capacitor-community/stripe-terminal';
import {environment} from '../../environments/environment';

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
    await StripeTerminal.connect({
      type: TerminalConnectType.TapToPay,
      locationId: 55,
    });
  }

  async collect() {
    await StripeTerminal.collect({ paymentIntent: 'pi_1JXj4s2eZvKYlo2CzK4BZqyK' });
  }
}
