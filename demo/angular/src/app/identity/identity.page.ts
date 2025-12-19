import { Component, inject } from '@angular/core';
import { ITestItems } from '../shared/interfaces';
import {
  IdentityVerificationSheetEventsEnum,
  StripeIdentity,
} from '@capacitor-community/stripe-identity';
import { PluginListenerHandle } from '@capacitor/core';
import { HttpClient } from '@angular/common/http';
import { HelperService } from '../shared/helper.service';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle,
  notificationsCircleOutline,
  playOutline,
} from 'ionicons/icons';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

const happyPathItems: ITestItems[] = [
  {
    type: 'method',
    name: 'HttpClient',
  },
  {
    type: 'method',
    name: 'createIdentityVerificationSheet',
  },
  {
    type: 'event',
    name: IdentityVerificationSheetEventsEnum.Loaded,
  },
  {
    type: 'method',
    name: 'presentIdentityVerificationSheet',
  },
  {
    type: 'event',
    name: IdentityVerificationSheetEventsEnum.VerificationResult,
    expect: IdentityVerificationSheetEventsEnum.Completed,
  },
];

const cancelPathItems: ITestItems[] = [
  {
    type: 'method',
    name: 'HttpClient',
  },
  {
    type: 'method',
    name: 'createIdentityVerificationSheet',
  },
  {
    type: 'event',
    name: IdentityVerificationSheetEventsEnum.Loaded,
  },
  {
    type: 'method',
    name: 'presentIdentityVerificationSheet',
  },
  {
    type: 'event',
    name: IdentityVerificationSheetEventsEnum.VerificationResult,
    expect: IdentityVerificationSheetEventsEnum.Canceled,
  },
];

@Component({
  selector: 'app-identity',
  templateUrl: './identity.page.html',
  styleUrls: ['./identity.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonListHeader,
    IonLabel,
    IonItem,
    IonIcon,
  ],
})
export class IdentityPage {
  private http = inject(HttpClient);
  private helper = inject(HelperService);

  public eventItems: ITestItems[] = [];
  private readonly listenerHandlers: PluginListenerHandle[] = [];

  constructor() {
    addIcons({ playOutline, notificationsCircleOutline, checkmarkCircle });
  }

  async create(type: 'happyPath' | 'cancelPath') {
    const eventKeys = Object.keys(IdentityVerificationSheetEventsEnum);
    for (const key of eventKeys) {
      const handler = StripeIdentity.addListener(
        IdentityVerificationSheetEventsEnum[key],
        (value) => {
          this.helper.updateItem(
            this.eventItems,
            IdentityVerificationSheetEventsEnum[key],
            true,
            value,
          );
        },
      );
      this.listenerHandlers.push(await handler);
    }

    if (type === 'happyPath') {
      this.eventItems = JSON.parse(JSON.stringify(happyPathItems));
    } else {
      this.eventItems = JSON.parse(JSON.stringify(cancelPathItems));
    }

    const { verficationSessionId, ephemeralKeySecret, clientSecret } =
      await firstValueFrom(
        this.http.post<{
          verficationSessionId: string;
          ephemeralKeySecret: string;
          clientSecret: string;
        }>(environment.api + 'identify', {}),
      ).catch(async (e) => {
        await this.helper.updateItem(this.eventItems, 'HttpClient', false);
        throw e;
      });

    await this.helper.updateItem(this.eventItems, 'HttpClient', true);

    await StripeIdentity.create({
      ephemeralKeySecret,
      clientSecret,
      verificationId: verficationSessionId,
    })
      .then(() =>
        this.helper.updateItem(
          this.eventItems,
          'createIdentityVerificationSheet',
          true,
        ),
      )
      .catch(() =>
        this.helper.updateItem(
          this.eventItems,
          'createIdentityVerificationSheet',
          false,
        ),
      );

    await StripeIdentity.present().then(() => {
      return this.helper.updateItem(
        this.eventItems,
        'presentIdentityVerificationSheet',
        true,
      );
    });

    this.listenerHandlers.forEach((handler) => handler.remove());
  }
}
