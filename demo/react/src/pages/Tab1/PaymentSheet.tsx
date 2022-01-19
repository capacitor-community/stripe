import { IonItem, IonLabel, IonList, IonListHeader } from '@ionic/react';
import { useState } from 'react';
import { useCapacitorStripe } from '../../fixtures/Provider';
import { usePaymentSheet } from '../../hooks/payment-sheet';
import { ProcessStatus } from '../../interfaces';


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

