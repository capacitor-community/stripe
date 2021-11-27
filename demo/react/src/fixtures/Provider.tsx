import { createContext, FC, PropsWithChildren, ReactNode, useContext, useEffect, useState } from "react";
import { Stripe, StripePlugin, StripeInitializationOptions } from '@capacitor-community/stripe';
import { defineCustomElements } from '@stripe-elements/stripe-elements/loader';

export type CapacitorStripe = {
    stripe: StripePlugin;
    isApplePayAvailable: boolean;
    isGooglePayAvailable: boolean;
}
const CapacitorStripeContext = createContext<CapacitorStripe>({
    stripe: undefined as any,
    isApplePayAvailable: false,
    isGooglePayAvailable: false,
})

export const useCapacitorStripe = () => {
    return useContext(CapacitorStripeContext)
}
export type CapacitorStripeProviderProps = PropsWithChildren<StripeInitializationOptions & {
    fallback?: ReactNode;
}>

export const CapacitorStripeProvider :FC<CapacitorStripeProviderProps> = ({
    fallback,
    children,
    ...initializeOptions
}) => {
    const [stripe, setStripe] = useState<StripePlugin>()
    const [isApplePayAvailable, setApplePayAvailableStatus] = useState(false)
    const [isGooglePayAvailable, setGooglePayAvailableStatus] = useState(false)
    useEffect(() => {
        defineCustomElements().then(() => {   
            if (!initializeOptions.publishableKey) return
            Stripe.initialize(initializeOptions)
                .then(() => {
                    return Stripe.isApplePayAvailable().then(() => {
                        setApplePayAvailableStatus(true)
                    }).catch(() => {
                        setApplePayAvailableStatus(false)
                    })
                })
                .then(() => {
                    return Stripe.isGooglePayAvailable().then(() => {
                        setGooglePayAvailableStatus(true)
                    }).catch(() => {
                        setGooglePayAvailableStatus(false)
                    })
                })
                .then(() => {
                    setStripe(Stripe)
                })
        });
    }, [initializeOptions, setApplePayAvailableStatus])
    if (!stripe) {
        if (fallback) return <>{fallback}</>
        return null;
    }
    return (
        <CapacitorStripeContext.Provider value={{
            stripe,
            isGooglePayAvailable,
            isApplePayAvailable,
        }}>
            {children}
        </CapacitorStripeContext.Provider>
    )
}