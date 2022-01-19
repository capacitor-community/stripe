import { IonItem, IonLabel, IonList, IonListHeader } from '@ionic/react';
import { useState } from 'react';
import { useCapacitorStripe } from '../../fixtures/Provider';
import { usePaymentSheet } from '../../hooks/payment-sheet';
import { ProcessStatus } from '../../interfaces';


export const PaymentFlow: React.FC = () => {
  const { stripe } = useCapacitorStripe()
  const [step, setStep] = useState<ProcessStatus>('ready')
  const { createPaymentIntent } = usePaymentSheet()
  return (
    <IonList>
      <IonListHeader>
        <IonLabel>PaymentFlow</IonLabel>
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
            await stripe.createPaymentFlow({
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
            await stripe.presentPaymentFlow()
            setStep('present')
          } catch(e) {
            console.log(e)
          }
        }}
      >
        <IonLabel>Present</IonLabel>
      </IonItem>
      <IonItem
        button
        detail
        disabled={step !== 'present'}
        onClick={async e => {
          e.preventDefault()
          try {
            setStep('confirm')
            await stripe.confirmPaymentFlow()
            setStep('ready')
          } catch(e) {
            console.log(e)
          }
        }}
      >
        <IonLabel>Confirm</IonLabel>
      </IonItem>
    </IonList>
  );
};

