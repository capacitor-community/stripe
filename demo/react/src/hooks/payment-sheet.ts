import { useCallback } from "react"

const api = 'https://capacitor-stripe-demo-server.bittersweet-barberry.workers.dev/'

export const usePaymentSheet = () => {
    const createPaymentIntent = useCallback(async (): Promise<{
        customer: string;
        paymentIntent: string;
        ephemeralKey: string;
    }> => {
        const {
          customer,
          paymentIntent,
          ephemeralKey,
        } = await fetch(`${api}intent`, {
          method: 'POST'
        }).then(res => res.json())
        return {
            customer,
            paymentIntent,
            ephemeralKey,
        }
    }, [])
    return {
        createPaymentIntent,
    }
}
