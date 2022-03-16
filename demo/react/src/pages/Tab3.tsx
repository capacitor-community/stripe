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
import './Tab3.css';
import React from 'react';

const Tab3: React.FC = () => {
  const {stripe} = useCapacitorStripe()
  const { createPaymentIntent} = usePaymentSheet()
  const [httpClientStepResult, setHttpClientStepResult] = useState<TaskResult>('')
  const [createPaymentFlowResult, setCreatePaymentFlowResult] = useState<TaskResult>('')
  const [presentPaymentFlowResult, setPresentPaymentFlowResult] = useState<TaskResult>('')
  const [confirmPaymentFlowResult, setConfirmPaymentFlowResult] = useState<TaskResult>('')
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
    setCreatePaymentFlowResult('inprogress')
    await stripe.createPaymentFlow({
      paymentIntentClientSecret: paymentIntent,
      customerEphemeralKeySecret: ephemeralKey,
      customerId: customer,
      merchantDisplayName: 'rdlabo',
    }).then(() => setCreatePaymentFlowResult('success'))
    .catch(e => {
      setCreatePaymentFlowResult('error')
      throw e
    })

    await stripe.presentPaymentFlow()
    .then(() => setPresentPaymentFlowResult('success'))
    .catch(e => {
      setPresentPaymentFlowResult('error')
      throw e
    })

    await stripe.confirmPaymentFlow()
    .then(() => setConfirmPaymentFlowResult('success'))
    .catch(e => {
      setConfirmPaymentFlowResult('error')
      throw e
    })

  },[stripe, createPaymentIntent, setHttpClientStepResult, setCreatePaymentFlowResult, setPresentPaymentFlowResult, setConfirmPaymentFlowResult])
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Flow</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Flow</IonTitle>
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
            <IonLabel>createPaymentFlow</IonLabel>
            {['success', 'error'].includes(createPaymentFlowResult) ? (
              <IonIcon slot="end" icon={checkmarkCircle} color={createPaymentFlowResult}></IonIcon>
            ): null}
          </IonItem>
          <IonItem>
            <IonIcon slot="start" icon={playOutline}/>
            <IonLabel>presentPaymentFlow</IonLabel>
            {['success', 'error'].includes(presentPaymentFlowResult) ? (
              <IonIcon slot="end" icon={checkmarkCircle} color={presentPaymentFlowResult}></IonIcon>
            ): null}
          </IonItem>
          <IonItem>
            <IonIcon slot="start" icon={playOutline}/>
            <IonLabel>confirmPaymentFlow</IonLabel>
            {['success', 'error'].includes(confirmPaymentFlowResult) ? (
              <IonIcon slot="end" icon={checkmarkCircle} color={confirmPaymentFlowResult}></IonIcon>
            ): null}
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
