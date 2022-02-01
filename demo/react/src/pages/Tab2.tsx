import { PaymentSheetEventsEnum } from '@capacitor-community/stripe';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { checkmarkCircle, playOutline } from 'ionicons/icons';
import { useCallback, useEffect, useState } from 'react';
/**
 * If you use typescript@4.5, you can write:
 * import { useCapacitorStripe } from '@capacitor-community/stripe/react';
 */
import { useCapacitorStripe } from '@capacitor-community/stripe/dist/esm/react/provider';
import { usePaymentSheet } from '../hooks/payment-sheet';
import { TaskResult } from '../interfaces';
import './Tab2.css';
import React from 'react';

const Tab2: React.FC = () => {
  const {stripe} = useCapacitorStripe()
  const { createPaymentIntent} = usePaymentSheet()
  const [httpClientStepResult, setHttpClientStepResult] = useState<TaskResult>('')
  const [createPaymentSheetResult, setCreatePaymentSheetResult] = useState<TaskResult>('')
  const [presentPaymentSheetResult, setPresentPaymentSheetResult] = useState<TaskResult>('')
  useEffect(() => {
    if (!stripe) return;
    Object.keys(PaymentSheetEventsEnum).forEach((key) => {
      // @ts-expect-error
      const eventName = PaymentSheetEventsEnum[key]
      stripe.addListener(eventName, (value: any) => {
        console.log(`[Event:${eventName}] ${value}`)
      })
    })
  },[stripe])
  const startHappyPath = useCallback(async () => {
    if (!stripe) throw new Error('Stripe does not loaded')
    setHttpClientStepResult('inprogress')
    const { customer, ephemeralKey, paymentIntent } = await createPaymentIntent()
    .then(result => {
      setHttpClientStepResult('success')
      return result
    }).catch(e => {
      setHttpClientStepResult('error')
      console.log(e)
      throw e
    })
    setCreatePaymentSheetResult('inprogress')
    await stripe.createPaymentSheet({
      paymentIntentClientSecret: paymentIntent,
      customerEphemeralKeySecret: ephemeralKey,
      customerId: customer,
      merchantDisplayName: 'rdlabo',
    }).then(() => setCreatePaymentSheetResult('success'))
    .catch(e => {
      setCreatePaymentSheetResult('error')
      throw e
    })

    await stripe.presentPaymentSheet()
    .then(() => setPresentPaymentSheetResult('success'))
    .catch(e => {
      setPresentPaymentSheetResult('error')
      throw e
    })

  },[stripe, createPaymentIntent, setHttpClientStepResult, setCreatePaymentSheetResult, setPresentPaymentSheetResult])
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Sheet</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Sheet</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList>
          <IonListHeader>Task</IonListHeader>
          <IonItem button detail onClick={() => startHappyPath()}>
            <IonLabel>Expect Happy Path</IonLabel>
          </IonItem>
        </IonList>
        <IonList>
          <IonListHeader>Expect</IonListHeader>
          <IonItem>
            <IonIcon slot="start" icon={playOutline}/>
            <IonLabel>HttpClient</IonLabel>
            {['success', 'error'].includes(httpClientStepResult) ? (
              <IonIcon slot="end" icon={checkmarkCircle} color={httpClientStepResult}></IonIcon>
            ): null}
          </IonItem>
          <IonItem>
            <IonIcon slot="start" icon={playOutline}/>
            <IonLabel>createPaymentSheet</IonLabel>
            {['success', 'error'].includes(createPaymentSheetResult) ? (
              <IonIcon slot="end" icon={checkmarkCircle} color={createPaymentSheetResult}></IonIcon>
            ): null}
          </IonItem>
          <IonItem>
            <IonIcon slot="start" icon={playOutline}/>
            <IonLabel>presentPaymentSheet</IonLabel>
            {['success', 'error'].includes(presentPaymentSheetResult) ? (
              <IonIcon slot="end" icon={checkmarkCircle} color={presentPaymentSheetResult}></IonIcon>
            ): null}
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
