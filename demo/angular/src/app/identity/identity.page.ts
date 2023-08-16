import {Component} from '@angular/core';
import {ITestItems} from '../shared/interfaces';
import {IdentityVerificationSheetEventsEnum, StripeIdentity} from '@capacitor-community/stripe-identity';
import {PluginListenerHandle} from '@capacitor/core';
import {HttpClient} from '@angular/common/http';
import {HelperService} from '../shared/helper.service';
import {environment} from '../../environments/environment';
import {first} from 'rxjs/operators';
import {NgFor, NgIf} from '@angular/common';
import {IonicModule} from '@ionic/angular';

const happyPathItems: ITestItems [] = [
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
    expect: [IdentityVerificationSheetEventsEnum.Completed],
  },
  {
    type: 'event',
    name: IdentityVerificationSheetEventsEnum.Completed,
  },
];

const cancelPathItems: ITestItems [] = [
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
    expect: [IdentityVerificationSheetEventsEnum.Canceled],
  },
  {
    type: 'event',
    name: IdentityVerificationSheetEventsEnum.Canceled,
  },
];

@Component({
    selector: 'app-identity',
    templateUrl: './identity.page.html',
    styleUrls: ['./identity.page.scss'],
    standalone: true,
    imports: [
        IonicModule,
        NgIf,
        NgFor,
    ],
})
export class IdentityPage {
  public eventItems: ITestItems [] = [];
  private readonly listenerHandlers: PluginListenerHandle[] = [];

  constructor(
    private http: HttpClient,
    private helper: HelperService,
  ) {}

  async create(type: 'happyPath' | 'cancelPath') {
    const eventKeys = Object.keys(IdentityVerificationSheetEventsEnum);
    eventKeys.forEach(key => {
      const handler = StripeIdentity.addListener(IdentityVerificationSheetEventsEnum[key], (value) => {
        this.helper.updateItem(this.eventItems, IdentityVerificationSheetEventsEnum[key], true, value);
      });
      this.listenerHandlers.push(handler);
    });

    if (type === 'happyPath') {
      this.eventItems =  JSON.parse(JSON.stringify(happyPathItems));
    } else {
      this.eventItems =  JSON.parse(JSON.stringify(cancelPathItems));
    }

    const { verficationSessionId, ephemeralKeySecret } = await this.http.post<{
      verficationSessionId: string;
      ephemeralKeySecret: string;
    }>(environment.api + 'identify', {}).pipe(first()).toPromise(Promise)
      .catch(async (e) => {
        await this.helper.updateItem(this.eventItems,'HttpClient', false);
        throw e;
      });

    await this.helper.updateItem(this.eventItems,'HttpClient', true);

    await StripeIdentity.createIdentityVerificationSheet({
      ephemeralKeySecret,
      verificationId: verficationSessionId,
    })
      .then(() => this.helper.updateItem(this.eventItems,'createIdentityVerificationSheet', true))
      .catch(() => this.helper.updateItem(this.eventItems,'createIdentityVerificationSheet', false));

    await StripeIdentity.presentIdentityVerificationSheet()
      .then((data) => {
        return this.helper.updateItem(this.eventItems, 'presentIdentityVerificationSheet', undefined, data.identityVerificationResult);
      });

    this.listenerHandlers.forEach(handler => handler.remove());
  }
}
