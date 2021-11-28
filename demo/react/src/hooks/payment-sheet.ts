import { useCallback, useMemo } from "react"


export const usePaymentSheet = () => {
    const api = useMemo(() => {
        if (process.env.NODE_ENV === 'production') {
            return 'https://j3x0ln9gj7.execute-api.ap-northeast-1.amazonaws.com/dev/'
        }
        return 'http://localhost:3000/'
    },[])
    const createPaymentIntent = useCallback(async (): Promise<{
        customer: string;
        paymentIntent: string;
        ephemeralKey: string;
    }> => {
        const {
          customer,
          paymentIntent,
          ephemeralKey,
        } = await fetch('http://localhost:3000/payment-sheet', {
          method: 'POST'
        }).then(res => res.json())
        return {
            customer,
            paymentIntent,
            ephemeralKey,
        }
    }, [api])
    return {
        createPaymentIntent,
    }
}