import { IonItem, IonLabel, IonList, IonListHeader } from '@ionic/react';
import { useState } from 'react';
import { useCapacitorStripe } from '../../fixtures/Provider';
import { usePaymentSheet } from '../../hooks/payment-sheet';
import { ProcessStatus } from '../../interfaces';


export const ApplePay: React.FC = () => {
  const { stripe, isApplePayAvailable } = useCapacitorStripe()
  const [step, setStep] = useState<ProcessStatus>('ready')
  const { createPaymentIntent } = usePaymentSheet()
  return (
    <IonList>
      <IonListHeader>
        <IonLabel>ApplePay</IonLabel>
      </IonListHeader>
      {isApplePayAvailable ? (
          <>
            <IonItem
                button
                detail
                disabled={step !== 'ready'}
                onClick={async e => {
                e.preventDefault()
                const {
                    paymentIntent,
                } = await createPaymentIntent()
                try {
                    await stripe.createApplePay({
                    paymentIntentClientSecret: paymentIntent,
                    paymentSummaryItems: [{
                      label: 'Product Name',
                      amount: 1099.00
                    }],
                    merchantIdentifier: 'merchant.com.getcapacitor.stripe',
                    countryCode: 'US',
                    currency: 'USD',
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
                    await stripe.presentApplePay()
                    setStep('present')
                } catch(e) {
                    console.log(e)
                }
                }}
            >
                <IonLabel>Present</IonLabel>
            </IonItem>
          </>
      ): (
          <IonItem button detail disabled={true}>
              <IonLabel>
                  Your device does not supports ApplePay.
              </IonLabel>
          </IonItem>
      )}
    </IonList>
  );
};

