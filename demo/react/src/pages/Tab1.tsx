import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Tab1.css';
import { useState } from 'react';
import { useCapacitorStripe } from '../fixtures/Provider';
import { usePaymentSheet } from '../hooks/payment-sheet';
import { ProcessStatus } from '../interfaces';
import { PaymentSheet } from './Tab1/PaymentSheet';
import { PaymentFlow } from './Tab1/PaymentFlow';
import { ApplePay } from './Tab1/ApplePay';
import { GooglePay } from './Tab1/GooglePay';


const Tab1: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Demo</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Demo</IonTitle>
          </IonToolbar>
        </IonHeader>
        <PaymentSheet />
        <PaymentFlow />
        <ApplePay />
        <GooglePay />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
