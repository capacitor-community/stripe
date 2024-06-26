import { Component, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import {
  AlertController,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonListHeader,
  IonTitle,
  IonToolbar,
  Platform,
} from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { HelperService } from '../shared/helper.service';
import {
  ReaderInterface,
  StripeTerminal,
  TerminalConnectTypes,
  TerminalEventsEnum,
} from '@capacitor-community/stripe-terminal';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { ITestItems } from '../shared/interfaces';
import { PluginListenerHandle } from '@capacitor/core';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle,
  notificationsCircleOutline,
  playOutline,
} from 'ionicons/icons';

const happyPathItems: ITestItems[] = [
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
    name: 'collectPaymentMethod',
  },
  {
    type: 'event',
    name: TerminalEventsEnum.CollectedPaymentIntent,
  },
  {
    type: 'method',
    name: 'confirmPaymentIntent',
  },
  {
    type: 'event',
    name: TerminalEventsEnum.ConfirmedPaymentIntent,
  },
];

const cancelPathItems: ITestItems[] = [
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
    name: 'collectPaymentMethod',
  },
  {
    type: 'method',
    name: 'cancelCollectPaymentMethod',
  },
  {
    type: 'event',
    name: TerminalEventsEnum.Canceled,
  },
];

const checkDiscoverMethodItems: ITestItems[] = [
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
    name: 'getConnectedReader',
  },
  {
    type: 'method',
    name: 'disconnectReader',
  },
  {
    type: 'event',
    name: TerminalEventsEnum.DisconnectedReader,
  },
];

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.page.html',
  styleUrls: ['./terminal.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonListHeader,
    IonLabel,
    IonItemDivider,
    IonItem,
    IonIcon,
  ],
})
export class TerminalPage {
  public eventItems: ITestItems[] = [];
  public terminalConnectTypes = TerminalConnectTypes;
  private readonly listenerHandlers: PluginListenerHandle[] = [];

  public readonly platform = inject(Platform);
  private readonly alertCtrl = inject(AlertController);

  constructor(
    private http: HttpClient,
    private helper: HelperService,
  ) {
    addIcons({ playOutline, notificationsCircleOutline, checkmarkCircle });
  }

  async create(
    type: 'happyPath' | 'cancelPath',
    readerType: TerminalConnectTypes,
  ) {
    const eventKeys = Object.keys(TerminalEventsEnum);
    for (const key of eventKeys) {
      const handler = StripeTerminal.addListener(
        TerminalEventsEnum[key],
        () => {
          console.log(key);
          this.helper.updateItem(
            this.eventItems,
            TerminalEventsEnum[key],
            true,
          );
        },
      );
      this.listenerHandlers.push(await handler);
      if (key === 'RequestedConnectionToken') {
        this.listenerHandlers.push(
          await StripeTerminal.addListener(
            TerminalEventsEnum.RequestedConnectionToken,
            async () => {
              const { secret } = await firstValueFrom(
                this.http.post<{
                  secret: string;
                }>(environment.api + 'connection/token', {}),
              );
              StripeTerminal.setConnectionToken({ token: secret });
            },
          ),
        );
      }
    }

    if (type === 'happyPath') {
      this.eventItems = JSON.parse(JSON.stringify(happyPathItems));
    } else {
      this.eventItems = JSON.parse(JSON.stringify(cancelPathItems));
    }

    await StripeTerminal.initialize({
      isTest: readerType === TerminalConnectTypes.TapToPay,
    })
      .then(() => this.helper.updateItem(this.eventItems, 'initialize', true))
      .catch(() =>
        this.helper.updateItem(this.eventItems, 'initialize', false),
      );

    const result = await StripeTerminal.discoverReaders({
      type: readerType,
      locationId:
        this.platform.is('android') &&
        [TerminalConnectTypes.Bluetooth, TerminalConnectTypes.Usb].includes(
          readerType,
        )
          ? 'tml_Ff37mAmk1XdBYT'
          : 'tml_FOUOdQVIxvVdvN',
    }).catch((e) => {
      this.helper.updateItem(this.eventItems, 'discoverReaders', false);
      throw e;
    });

    await this.helper.updateItem(
      this.eventItems,
      'discoverReaders',
      result.readers.length > 0,
    );

    console.log(result);

    const selectedReader =
      result.readers.length === 1
        ? result.readers[0]
        : await this.alertFilterReaders(result.readers);
    console.log(selectedReader);
    if (!selectedReader) {
      alert('No reader selected');
      return;
    }

    await StripeTerminal.connectReader({
      reader: selectedReader,
    }).catch((e) => {
      alert(e);
      this.helper.updateItem(this.eventItems, 'connectReader', false);
      throw e;
    });
    await this.helper.updateItem(this.eventItems, 'connectReader', true);

    const { paymentIntent } = await firstValueFrom(
      this.http.post<{
        paymentIntent: string;
      }>(environment.api + 'connection/intent', {}),
    ).catch(async (e) => {
      await this.helper.updateItem(
        this.eventItems,
        'HttpClientPaymentIntent',
        false,
      );
      throw e;
    });
    await this.helper.updateItem(
      this.eventItems,
      'HttpClientPaymentIntent',
      true,
    );

    await StripeTerminal.collectPaymentMethod({ paymentIntent })
      .then(() =>
        this.helper.updateItem(this.eventItems, 'collectPaymentMethod', true),
      )
      .catch(async (e) => {
        await this.helper.updateItem(
          this.eventItems,
          'collectPaymentMethod',
          false,
        );
        throw e;
      });

    if (type === 'cancelPath') {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await StripeTerminal.cancelCollectPaymentMethod().catch(async (e) => {
        await this.helper.updateItem(
          this.eventItems,
          'cancelCollectPaymentMethod',
          false,
        );
        throw e;
      });
      await this.helper.updateItem(
        this.eventItems,
        'cancelCollectPaymentMethod',
        true,
      );
    } else {
      await StripeTerminal.confirmPaymentIntent();
      await this.helper.updateItem(
        this.eventItems,
        'confirmPaymentIntent',
        true,
      );
    }

    await StripeTerminal.disconnectReader();
    this.listenerHandlers.forEach((handler) => handler.remove());
  }

  async checkDiscoverMethod() {
    const eventKeys = Object.keys(TerminalEventsEnum);
    for (const key of eventKeys) {
      const handler = StripeTerminal.addListener(
        TerminalEventsEnum[key],
        () => {
          this.helper.updateItem(
            this.eventItems,
            TerminalEventsEnum[key],
            true,
          );
        },
      );
      this.listenerHandlers.push(await handler);
      if (key === 'RequestedConnectionToken') {
        this.listenerHandlers.push(
          await StripeTerminal.addListener(
            TerminalEventsEnum.RequestedConnectionToken,
            async () => {
              const { secret } = await firstValueFrom(
                this.http.post<{
                  secret: string;
                }>(environment.api + 'connection/token', {}),
              );
              StripeTerminal.setConnectionToken({ token: secret });
            },
          ),
        );
      }
    }

    this.eventItems = JSON.parse(JSON.stringify(checkDiscoverMethodItems));

    await StripeTerminal.initialize({
      tokenProviderEndpoint: environment.api + 'connection/token',
      isTest: true,
    })
      .then(() => this.helper.updateItem(this.eventItems, 'initialize', true))
      .catch(() =>
        this.helper.updateItem(this.eventItems, 'initialize', false),
      );

    const result = await StripeTerminal.discoverReaders({
      type: TerminalConnectTypes.TapToPay,
      locationId: 'tml_FOUOdQVIxvVdvN',
    }).catch((e) => {
      this.helper.updateItem(this.eventItems, 'discoverReaders', false);
      throw e;
    });

    await this.helper.updateItem(
      this.eventItems,
      'discoverReaders',
      result.readers.length > 0,
    );

    const selectedReader =
      result.readers.length === 1
        ? result.readers[0]
        : await this.alertFilterReaders(result.readers);
    if (!selectedReader) {
      alert('No reader selected');
      return;
    }

    await StripeTerminal.connectReader({
      reader: selectedReader,
    }).catch((e) => {
      alert(e);
      this.helper.updateItem(this.eventItems, 'connectReader', false);
      throw e;
    });
    await this.helper.updateItem(this.eventItems, 'connectReader', true);

    const { reader } = await StripeTerminal.getConnectedReader().catch((e) => {
      this.helper.updateItem(this.eventItems, 'getConnectedReader', false);
      throw e;
    });
    await this.helper.updateItem(
      this.eventItems,
      'getConnectedReader',
      reader !== null,
    );

    await StripeTerminal.disconnectReader().catch((e) => {
      this.helper.updateItem(this.eventItems, 'disconnectReader', false);
      throw e;
    });
    await this.helper.updateItem(this.eventItems, 'disconnectReader', true);

    this.listenerHandlers.forEach((handler) => handler.remove());
  }

  private alertFilterReaders(
    readers: ReaderInterface[],
  ): Promise<ReaderInterface | undefined> {
    return new Promise(async (resolve) => {
      const alert = await this.alertCtrl.create({
        header: `Select a reader`,
        message: `Select a reader to connect to.`,
        inputs: readers.map((reader, index) => ({
          name: 'serialNumber',
          type: 'radio',
          label: reader.serialNumber,
          value: reader.serialNumber,
          checked: index === 0,
        })),
        buttons: [
          {
            text: `Cancel`,
            role: 'cancel',
            handler: () => resolve(undefined),
          },
          {
            text: `Submit`,
            handler: (d) => {
              resolve(readers.find((reader) => reader.serialNumber === d));
            },
          },
        ],
      });
      await alert.present();
    });
  }
}
