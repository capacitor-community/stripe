import { IonItem, IonLabel, IonList, IonListHeader } from '@ionic/react';
import { useState } from 'react';
/**
 * If you use typescript@4.5, you can write:
 * import { useCapacitorStripe } from '@capacitor-community/stripe/react';
 */
import { useCapacitorStripe } from '@capacitor-community/stripe/dist/esm/react/provider';
import { usePaymentSheet } from '../../hooks/payment-sheet';
import { ProcessStatus } from '../../interfaces';
import React from 'react';


export const PaymentSheet: React.FC = () => {
  const { stripe } = useCapacitorStripe()
  const [step, setStep] = useState<ProcessStatus>('ready')
  const { createPaymentIntent } = usePaymentSheet()
  return (
        <IonList>
          <IonListHeader>
            <IonLabel>PaymentSheet</IonLabel>
          </IonListHeader>
          <IonItem
            button
            detail
            disabled={step !== 'ready'}
            onClick={async e => {
              e.preventDefault()
              const {
                customer,
                paymentIntent,
                ephemeralKey,
              } = await createPaymentIntent()
              try {
                await stripe.createPaymentSheet({
                  paymentIntentClientSecret: paymentIntent,
                  customerId: customer,
                  customerEphemeralKeySecret: ephemeralKey,
                  merchantDisplayName: 'rdlabo'
                })
                setStep('create')
              } catch(e) {
                console.log(e)
              }
            }}
          >
            <IonLabel>Create</IonLabel>
          </IonItem>
          <IonItem
            button
            detail
            disabled={step !== 'create'}
            onClick={async e => {
              e.preventDefault()
              try {
                await stripe.presentPaymentSheet()
                setStep('present')
              } catch(e) {
                console.log(e)
              }
            }}
          >
            <IonLabel>Present</IonLabel>
          </IonItem>
        </IonList>
  );
};

