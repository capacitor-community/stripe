import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { HelperService } from '../shared/helper.service';
import { StripeTerminal, TerminalConnectType, TerminalEventsEnum } from '@capacitor-community/stripe-terminal';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import {ITestItems} from '../shared/interfaces';
import {PluginListenerHandle} from '@capacitor/core';

const happyPathItems: ITestItems [] = [
  {
    type: 'method',
    name: 'initialize',
  },
  {
    type: 'event',
    name: TerminalEventsEnum.Loaded,
  },
  {
    type: 'method',
    name: 'HttpClientLocation',
  },
  {
    type: 'method',
    name: 'discoverReaders',
  },
  {
    type: 'event',
    name: TerminalEventsEnum.DiscoveredReaders,
  },
  {
    type: 'method',
    name: 'connectReader',
  },
  {
    type: 'event',
    name: TerminalEventsEnum.ConnectedReader,
  },
  {
    type: 'method',
    name: 'HttpClientPaymentIntent',
  },
  {
    type: 'method',
    name: 'collect',
  },
  {
    type: 'event',
    name: TerminalEventsEnum.Completed,
  },
];

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.page.html',
  styleUrls: ['./terminal.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class TerminalPage {
  public eventItems: ITestItems [] = [];
  private readonly listenerHandlers: PluginListenerHandle[] = [];
  constructor(
    private http: HttpClient,
    private helper: HelperService,
  ) { }

  async create(type: 'happyPath' | 'cancelPath') {
    const eventKeys = Object.keys(TerminalEventsEnum);
    eventKeys.forEach(key => {
      const handler = StripeTerminal.addListener(TerminalEventsEnum[key], () => {
        this.helper.updateItem(this.eventItems, TerminalEventsEnum[key], true);
      });
      this.listenerHandlers.push(handler);
    });

    if (type === 'happyPath') {
      this.eventItems =  JSON.parse(JSON.stringify(happyPathItems));
    }

    await StripeTerminal.initialize({ tokenProviderEndpoint: environment.api + 'connection/token' })
      .then(() => this.helper.updateItem(this.eventItems,'initialize', true))
      .catch(() => this.helper.updateItem(this.eventItems,'initialize', false));

    const { locationId } = await firstValueFrom(this.http.post<{
      locationId: string;
    }>(environment.api + 'connection/location', {}))
      .catch(async (e) => {
        await this.helper.updateItem(this.eventItems,'HttpClientLocation', false);
        throw e;
      });
    await this.helper.updateItem(this.eventItems,'HttpClientLocation', true);

    const result = await StripeTerminal.discoverReaders({
      type: TerminalConnectType.TapToPay,
      locationId: locationId,
    })
      .catch((e) => {
        this.helper.updateItem(this.eventItems,'discoverReaders', false)
        throw e;
      });

    await this.helper.updateItem(this.eventItems,'discoverReaders', result.readers.length > 0);

    await StripeTerminal.connectReader({
      reader: result.readers[0],
    })
      .catch((e) => {
        this.helper.updateItem(this.eventItems,'connectReader', false)
        throw e;
      });
    await this.helper.updateItem(this.eventItems,'connectReader', true);

    const { paymentIntent } = await firstValueFrom(this.http.post<{
      paymentIntent: string;
    }>(environment.api + 'connection/intent', {}))
    .catch(async (e) => {
      await this.helper.updateItem(this.eventItems,'HttpClientPaymentIntent', false);
      throw e;
    });
    await this.helper.updateItem(this.eventItems,'HttpClientPaymentIntent', true);

    await StripeTerminal.collect({ paymentIntent })
      .catch(async (e) => {
        await this.helper.updateItem(this.eventItems,'collect', false);
        throw e;
      });
    await this.helper.updateItem(this.eventItems,'collect', true);

    this.listenerHandlers.forEach(handler => handler.remove());
  }
}
