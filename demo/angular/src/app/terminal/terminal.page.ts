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
  CartLineItem,
  ReaderInterface, SimulateReaderUpdate,
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
import {happyPathBluetoothItems, happyPathItems} from './happyPathItems';
import {cancelPathItems} from './cancelPathItems';
import {checkDiscoverMethodItems} from './checkDiscoverMethodItems';
import {updateDeviceRequiredItems} from './updateDeviceRequiredItems';
import {updateDeviceUpdateItems} from './updateDeviceUpdateItems';
import {Stripe} from '@capacitor-community/stripe';

@Component({
    selector: 'app-terminal',
    templateUrl: './terminal.page.html',
    styleUrls: ['./terminal.page.scss'],
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
    ]
})
export class TerminalPage {
  public eventItems: ITestItems[] = [];
  public terminalConnectTypes = TerminalConnectTypes;
  public simulateReaderUpdate = SimulateReaderUpdate;
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
    let eventItems: ITestItems[];
    if (type === 'happyPath') {
      if (readerType === TerminalConnectTypes.Bluetooth) {
        eventItems = structuredClone(happyPathBluetoothItems)
      } else {
        eventItems = structuredClone(happyPathItems)
      }
    } else {
      eventItems = structuredClone(cancelPathItems)
    }
    await this.prepareTerminalEvents(eventItems, readerType);

    const listenerHandler = await StripeTerminal.addListener(TerminalEventsEnum.DiscoveredReaders, async ({ readers }) => {
      if (readers?.length > 0) {
        const result = { readers };
        await this.helper.updateItem(this.eventItems, 'discoverReaders', true);

        this.listenerHandlers.push(listenerHandler);

        const selectedReader =
          result.readers?.length === 1
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

        if (readerType === TerminalConnectTypes.Internet) {
          await StripeTerminal.setReaderDisplay({
            currency: 'usd',
            tax: 0,
            total: 1000,
            lineItems: [{
              displayName: 'winecode',
              quantity: 2,
              amount: 500
            }] as CartLineItem[],
          })

          await new Promise((resolve) => setTimeout(resolve, 2000));

          await StripeTerminal.clearReaderDisplay();
        }



        if (type === 'cancelPath') {
          // During Collect, cancel the payment
          StripeTerminal.collectPaymentMethod({ paymentIntent })
            .catch(async (e) => {
              await this.helper.updateItem(
                this.eventItems,
                'collectPaymentMethod',
                false,
              );
              throw e;
            });
          await this.helper.updateItem(this.eventItems, 'collectPaymentMethod', true);
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
    });

    const result = await StripeTerminal.discoverReaders({
      type: readerType,
      locationId:
        [TerminalConnectTypes.Usb].includes(
          readerType,
        )
          ? 'tml_Ff37mAmk1XdBYT'
          : 'tml_FOUOdQVIxvVdvN',
    }).catch((e) => {
      this.helper.updateItem(this.eventItems, 'discoverReaders', false);
      throw e;
    });
  }

  async checkUpdateDeviceUpdate(readerType: TerminalConnectTypes = TerminalConnectTypes.Bluetooth) {
    await this.prepareTerminalEvents(structuredClone(updateDeviceUpdateItems));
    await StripeTerminal.setSimulatorConfiguration({ update: SimulateReaderUpdate.UpdateAvailable })
      .then(() => this.helper.updateItem(this.eventItems, 'setSimulatorConfiguration:UPDATE_AVAILABLE', true));

    const result = await StripeTerminal.discoverReaders({
      type: readerType,
      locationId:
        [TerminalConnectTypes.Usb].includes(readerType)
          ? 'tml_Ff37mAmk1XdBYT'  // Auckland, New Zealand
          : 'tml_FOUOdQVIxvVdvN', // San Francisco, CA 94110
    }).catch((e) => {
      this.helper.updateItem(this.eventItems, 'discoverReaders', false);
      throw e;
    });

    const listnerHandler = await StripeTerminal.addListener(TerminalEventsEnum.DiscoveredReaders, async ({ readers }) => {
      if (readers?.length > 0) {
        const result = { readers };
        await this.helper.updateItem(this.eventItems, 'discoverReaders', true);

        this.listenerHandlers.push(listnerHandler);

        const selectedReader =
          result.readers?.length === 1
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

        await StripeTerminal.installAvailableUpdate()
          .then(() => this.helper.updateItem(this.eventItems, 'installAvailableUpdate', true));

        await new Promise((resolve) => setTimeout(resolve, 2000));

        await StripeTerminal.cancelInstallUpdate()
          .then(() => this.helper.updateItem(this.eventItems, 'cancelInstallUpdate', true));

        // await new Promise((resolve) => setTimeout(resolve, 5000));

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

        await StripeTerminal.disconnectReader().catch((e) => {
          this.helper.updateItem(this.eventItems, 'disconnectReader', false);
          throw e;
        });
        await this.helper.updateItem(this.eventItems, 'disconnectReader', true);

        this.listenerHandlers.forEach((handler) => handler.remove());
      }
    });
  }

  async checkUpdateDeviceRequired(readerType: TerminalConnectTypes = TerminalConnectTypes.Bluetooth) {
    await this.prepareTerminalEvents(structuredClone(updateDeviceRequiredItems));
    await StripeTerminal.setSimulatorConfiguration({ update: SimulateReaderUpdate.Required })
      .then(() => this.helper.updateItem(this.eventItems, 'setSimulatorConfiguration:REQUIRED', true));

    const result = await StripeTerminal.discoverReaders({
      type: readerType,
      locationId:
        [TerminalConnectTypes.Usb].includes(readerType)
          ? 'tml_Ff37mAmk1XdBYT'  // Auckland, New Zealand
          : 'tml_FOUOdQVIxvVdvN', // San Francisco, CA 94110
    }).catch((e) => {
      this.helper.updateItem(this.eventItems, 'discoverReaders', false);
      throw e;
    });

    const listnerHandler = await StripeTerminal.addListener(TerminalEventsEnum.DiscoveredReaders, async ({ readers }) => {
      if (readers?.length > 0) {
        const result = { readers };
        await this.helper.updateItem(this.eventItems, 'discoverReaders', true);

        this.listenerHandlers.push(listnerHandler);

        const selectedReader =
          result.readers?.length === 1
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

        // await new Promise((resolve) => setTimeout(resolve, 5000));

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

        await StripeTerminal.disconnectReader().catch((e) => {
          this.helper.updateItem(this.eventItems, 'disconnectReader', false);
          throw e;
        });
        await this.helper.updateItem(this.eventItems, 'disconnectReader', true);

        this.listenerHandlers.forEach((handler) => handler.remove());
      }
    })
  }

  async checkDiscoverMethod() {
    await this.prepareTerminalEvents(structuredClone(checkDiscoverMethodItems));

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
      result.readers?.length > 0,
    );

    const listenerHandler = await StripeTerminal.addListener(TerminalEventsEnum.DiscoveredReaders, async ({ readers }) => {
      console.log('discoveredReaders Lisener', readers);
      if (readers?.length > 0) {
        this.listenerHandlers.push(listenerHandler);

        const selectedReader =
          result.readers?.length === 1
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
    });
  }

  private alertFilterReaders(
    readers: ReaderInterface[],
  ): Promise<ReaderInterface | undefined> {
    return new Promise(async (resolve) => {
      const alert = await this.alertCtrl.create({
        header: `Select a reader`,
        message: `Select a reader to connect to.`,
        backdropDismiss: false,
        inputs: readers.map((reader, index) => ({
          name: 'serialNumber',
          type: 'radio',
          label: reader.deviceType,
          value: reader.serialNumber,
          checked: index === 0,
          disabled: reader.status === 'OFFLINE'
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

  private async prepareTerminalEvents(eventItems: ITestItems[], readerType = undefined) {
    const eventKeys = Object.keys(TerminalEventsEnum);
    for (const key of eventKeys) {
      const handler = StripeTerminal.addListener(
        TerminalEventsEnum[key],
        (info) => {
          this.helper.updateItem(
            this.eventItems,
            TerminalEventsEnum[key],
            true,
            info
          );
          console.log('=========' + key + ':' + JSON.stringify(info))
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
    this.eventItems = eventItems;
    await StripeTerminal.initialize({
      // tokenProviderEndpoint: environment.api + 'connection/token',
      isTest: !readerType || readerType === TerminalConnectTypes.TapToPay,
    })
      .then(() => this.helper.updateItem(this.eventItems, 'initialize', true))
      .catch(() =>
        this.helper.updateItem(this.eventItems, 'initialize', false),
      );
  }
}
