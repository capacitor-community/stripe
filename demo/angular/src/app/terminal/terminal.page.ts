import {Component} from '@angular/core';

import {FormsModule} from '@angular/forms';
import {
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
  Platform
} from '@ionic/angular/standalone';
import {HttpClient} from '@angular/common/http';
import {HelperService} from '../shared/helper.service';
import {StripeTerminal, TerminalConnectTypes, TerminalEventsEnum} from '@capacitor-community/stripe-terminal';
import {environment} from '../../environments/environment';
import {firstValueFrom} from 'rxjs';
import {ITestItems} from '../shared/interfaces';
import {PluginListenerHandle} from '@capacitor/core';
import {addIcons} from "ionicons";
import {checkmarkCircle, notificationsCircleOutline, playOutline} from "ionicons/icons";

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
        name: 'collect',
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
        name: 'collect',
    },
    {
        type: 'method',
        name: 'cancelCollect',
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
    imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonListHeader, IonLabel, IonItemDivider, IonItem, IonIcon]
})
export class TerminalPage {
    public eventItems: ITestItems[] = [];
    public terminalConnectTypes = TerminalConnectTypes;
    private readonly listenerHandlers: PluginListenerHandle[] = [];
    constructor(
        public platform: Platform,
        private http: HttpClient,
        private helper: HelperService,
    ) {
        addIcons({ playOutline, notificationsCircleOutline, checkmarkCircle });
    }

    async create(type: 'happyPath' | 'cancelPath', readerType: TerminalConnectTypes) {
        const eventKeys = Object.keys(TerminalEventsEnum);
        eventKeys.forEach(key => {
            const handler = StripeTerminal.addListener(TerminalEventsEnum[key], () => {
                console.log(key);
                this.helper.updateItem(this.eventItems, TerminalEventsEnum[key], true);
            });
            this.listenerHandlers.push(handler);
            if (key === 'RequestedConnectionToken') {
                this.listenerHandlers.push(StripeTerminal.addListener(TerminalEventsEnum.RequestedConnectionToken, async () => {
                    const { secret } = await firstValueFrom(this.http.post<{
                        secret: string;
                    }>(environment.api + 'connection/token', {}));
                    StripeTerminal.setConnectionToken({ token: secret });
                }));
            }
        });

        if (type === 'happyPath') {
            this.eventItems = JSON.parse(JSON.stringify(happyPathItems));
        } else {
            this.eventItems = JSON.parse(JSON.stringify(cancelPathItems));
        }

        await StripeTerminal.initialize({ isTest: readerType === TerminalConnectTypes.TapToPay })
            .then(() => this.helper.updateItem(this.eventItems, 'initialize', true))
            .catch(() => this.helper.updateItem(this.eventItems, 'initialize', false));

        const result = await StripeTerminal.discoverReaders({
            type: readerType,
            locationId: "tml_FOUOdQVIxvVdvN",
        })
            .catch((e) => {
                this.helper.updateItem(this.eventItems, 'discoverReaders', false)
                throw e;
            });

        await this.helper.updateItem(this.eventItems, 'discoverReaders', result.readers.length > 0);

        await StripeTerminal.connectReader({
            reader: result.readers[0],
        })
            .catch((e) => {
                this.helper.updateItem(this.eventItems, 'connectReader', false)
                throw e;
            });
        await this.helper.updateItem(this.eventItems, 'connectReader', true);

        const { paymentIntent } = await firstValueFrom(this.http.post<{
            paymentIntent: string;
        }>(environment.api + 'connection/intent', {}))
            .catch(async (e) => {
                await this.helper.updateItem(this.eventItems, 'HttpClientPaymentIntent', false);
                throw e;
            });
        await this.helper.updateItem(this.eventItems, 'HttpClientPaymentIntent', true);

        await StripeTerminal.collect({ paymentIntent })
            .then(() => this.helper.updateItem(this.eventItems, 'collect', true))
            .catch(async (e) => {
                await this.helper.updateItem(this.eventItems, 'collect', false);
                throw e;
            });

        if (type === 'cancelPath') {
            await new Promise(resolve => setTimeout(resolve, 2000));
            await StripeTerminal.cancelCollect()
                .catch(async (e) => {
                    await this.helper.updateItem(this.eventItems, 'cancelCollect', false);
                    throw e;
                });
            await this.helper.updateItem(this.eventItems, 'cancelCollect', true);
        } else {
            await StripeTerminal.confirmPaymentIntent();
            await this.helper.updateItem(this.eventItems, 'confirmPaymentIntent', true);
        }

        this.listenerHandlers.forEach(handler => handler.remove());
    }

    async checkDiscoverMethod() {
        const eventKeys = Object.keys(TerminalEventsEnum);
        eventKeys.forEach(key => {
            const handler = StripeTerminal.addListener(TerminalEventsEnum[key], () => {
                this.helper.updateItem(this.eventItems, TerminalEventsEnum[key], true);
            });
            this.listenerHandlers.push(handler);
            if (key === 'RequestedConnectionToken') {
                this.listenerHandlers.push(StripeTerminal.addListener(TerminalEventsEnum.RequestedConnectionToken, async () => {
                    const { secret } = await firstValueFrom(this.http.post<{
                        secret: string;
                    }>(environment.api + 'connection/token', {}));
                    StripeTerminal.setConnectionToken({ token: secret });
                }));
            }
        });

        this.eventItems = JSON.parse(JSON.stringify(checkDiscoverMethodItems));

        await StripeTerminal.initialize({ tokenProviderEndpoint: environment.api + 'connection/token', isTest: true })
            .then(() => this.helper.updateItem(this.eventItems, 'initialize', true))
            .catch(() => this.helper.updateItem(this.eventItems, 'initialize', false));

        const result = await StripeTerminal.discoverReaders({
            type: TerminalConnectTypes.TapToPay,
            locationId: "tml_FOUOdQVIxvVdvN",
        })
            .catch((e) => {
                this.helper.updateItem(this.eventItems, 'discoverReaders', false)
                throw e;
            });

        await this.helper.updateItem(this.eventItems, 'discoverReaders', result.readers.length > 0);

        await StripeTerminal.connectReader({
            reader: result.readers[0],
        })
            .catch((e) => {
                this.helper.updateItem(this.eventItems, 'connectReader', false)
                throw e;
            });
        await this.helper.updateItem(this.eventItems, 'connectReader', true);

        const { reader } = await StripeTerminal.getConnectedReader()
            .catch((e) => {
                this.helper.updateItem(this.eventItems, 'getConnectedReader', false)
                throw e;
            });
        await this.helper.updateItem(this.eventItems, 'getConnectedReader', reader !== null);

        await StripeTerminal.disconnectReader()
            .catch((e) => {
                this.helper.updateItem(this.eventItems, 'disconnectReader', false)
                throw e;
            });
        await this.helper.updateItem(this.eventItems, 'disconnectReader', true);


        this.listenerHandlers.forEach(handler => handler.remove());
    }
}
