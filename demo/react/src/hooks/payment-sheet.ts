import { useCallback, useMemo } from "react"


export const usePaymentSheet = () => {
    const api = useMemo(() => {
        if (process.env.REACT_APP_API_URL) {
            return process.env.REACT_APP_API_URL
        }
        return 'https://j3x0ln9gj7.execute-api.ap-northeast-1.amazonaws.com/dev/'
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
        } = await fetch(`${api}intent`, {
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
