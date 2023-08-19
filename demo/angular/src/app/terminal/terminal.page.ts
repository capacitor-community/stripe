import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {HttpClient} from '@angular/common/http';
import {HelperService} from '../shared/helper.service';
import { StripeTerminal } from '@capacitor-community/stripe-terminal';

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
    await StripeTerminal.initialize({ tokenProviderEndpoint: 'https://stripe-terminal-backend.herokuapp.com/' });
  }

  async connect() {
    await StripeTerminal.connect({ type: 'internet' });
  }

  async collect() {
    await StripeTerminal.collect({ paymentIntent: 'pi_1JXj4s2eZvKYlo2CzK4BZqyK' });
  }
}
