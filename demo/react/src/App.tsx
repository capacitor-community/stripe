import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { chevronForwardCircleOutline, copyOutline, tabletLandscapeOutline } from 'ionicons/icons';
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import { CapacitorStripeProvider } from '@capacitor-community/stripe/src/react/provider';

const App: React.FC = () => (
  <CapacitorStripeProvider
    publishableKey="pk_test_YssveZBA1kucfaTfZbeDwauN"
    fallback={<p>Loading...</p>}
  >
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/demo">
              <Tab1 />
            </Route>
            <Route exact path="/sheet">
              <Tab2 />
            </Route>
            <Route path="/flow">
              <Tab3 />
            </Route>
            <Route exact path="/">
              <Redirect to="/demo" />
            </Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="demo" href="/demo">
              <IonIcon icon={chevronForwardCircleOutline} />
              <IonLabel>Demo</IonLabel>
            </IonTabButton>
            <IonTabButton tab="sheet" href="/sheet">
              <IonIcon icon={tabletLandscapeOutline} />
              <IonLabel>Sheet</IonLabel>
            </IonTabButton>
            <IonTabButton tab="flow" href="/flow">
              <IonIcon icon={copyOutline} />
              <IonLabel>Flow</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  </CapacitorStripeProvider>
);

export default App;
