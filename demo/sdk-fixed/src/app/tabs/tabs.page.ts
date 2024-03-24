import {Component} from '@angular/core';
import {addIcons} from "ionicons";
import {chevronForwardCircleOutline, copyOutline, tabletLandscapeOutline} from "ionicons/icons";
import {IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs} from "@ionic/angular/standalone";

@Component({
    selector: 'app-tabs',
    templateUrl: 'tabs.page.html',
    styleUrls: ['tabs.page.scss'],
    standalone: true,
    imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel]
})
export class TabsPage {

    constructor() {
        addIcons({ chevronForwardCircleOutline, tabletLandscapeOutline, copyOutline });
    }

}
